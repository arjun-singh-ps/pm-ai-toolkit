// The chat engine shared by every agent: builds the system prompt, runs the
// Claude conversation with a record_artefact tool, validates and persists
// any artefacts produced, and tracks token cost. Adding a new agent never
// requires touching this file — only a new config under src/agents/.

import type Anthropic from "@anthropic-ai/sdk";
import { getClient, CLAUDE_MODEL } from "@/lib/claude";
import { getAgent } from "@/agents/registry";
import { canRunAgent } from "@/lib/gating";
import { getProgramme } from "@/lib/programmes";
import { loadOrCreateSession, saveSessionMessages, type ChatMessage } from "@/lib/chatSessions";
import { recordArtefactDraft } from "@/lib/artefacts";
import { recordCost } from "@/lib/costRecords";
import { writeKpiSnapshot } from "@/lib/kpiSnapshots";
import { createAgentAlert, getAgentAlert, formatAlertForSystemPrompt } from "@/lib/agentAlerts";
import { getExtraContext } from "@/lib/crossCuttingContext";
import { getActiveIntegrations } from "@/lib/integrations";
import { listArtefactsForProgramme } from "@/lib/artefacts";
import { formatArtefactSummary } from "@/agents/cross-cutting/artefactSummary";
import { WELCOME_INIT_MARKER } from "@/lib/constants";
import type { AgentConfig } from "@/agents/types";
import type { Programme } from "@/types/programme";

const MAX_OUTPUT_TOKENS = 4096;
const MAX_TOOL_ITERATIONS = 5;

const RECORD_ALERT_TOOL: Anthropic.Messages.Tool = {
  name: "record_alert",
  description:
    "Records a proactive insight card shown on the programme home screen. Call this ONLY " +
    "when you have identified a specific, quantified condition requiring the PM's attention: " +
    "a threshold breach, a metric trending the wrong way, a decision that is overdue. " +
    "The card must stand alone — the PM will read it without seeing this conversation. " +
    "Never call this for vague concerns or when the PM has not confirmed actual data.",
  input_schema: {
    type: "object",
    properties: {
      what: {
        type: "string",
        description:
          "One line: what changed or what threshold was crossed. Specific and quantified. " +
          "Example: 'Sprint velocity dropped to 71% — below the 80% Quality Covenant threshold'.",
      },
      why_matters: {
        type: "array",
        items: { type: "string" },
        description:
          "2-3 bullets explaining consequences. Each bullet is one sentence, concrete and specific.",
      },
      suggested_action: {
        type: "string",
        description:
          "One concrete action the PM should take. Specific enough to act on without further review.",
      },
    },
    required: ["what", "why_matters", "suggested_action"],
  },
};

const RECORD_KPI_TOOL: Anthropic.Messages.Tool = {
  name: "record_kpi",
  description:
    "Records one confirmed KPI metric value for this programme. Only call this when the " +
    "programme manager has explicitly confirmed a specific numeric value — never invent figures. " +
    "You may call this multiple times in one turn to record several metrics at once.",
  input_schema: {
    type: "object",
    properties: {
      lever_or_dimension: {
        type: "string",
        description:
          "The KPI lever name exactly as defined for this agent, e.g. 'Quality of Modernisation'.",
      },
      metric_name: {
        type: "string",
        description: "The specific metric name, e.g. 'Code Coverage (%)'.",
      },
      value: {
        type: "number",
        description: "The confirmed numeric value for this metric.",
      },
    },
    required: ["lever_or_dimension", "metric_name", "value"],
  },
};

const RECORD_ARTEFACT_TOOL: Anthropic.Messages.Tool = {
  name: "record_artefact",
  description:
    "Records one completed artefact for the current programme. Call this only once you have " +
    "enough information to produce the full artefact content — not for partial drafts or while " +
    "still asking clarifying questions.",
  input_schema: {
    type: "object",
    properties: {
      artefactName: {
        type: "string",
        description: "Must exactly match one of this agent's artefact names.",
      },
      content: {
        type: "object",
        properties: {
          title: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                heading: { type: "string" },
                body: { type: "string" },
              },
              required: ["heading", "body"],
            },
          },
        },
        required: ["title", "sections"],
      },
    },
    required: ["artefactName", "content"],
  },
};

/** Builds the system prompt: programme/persona/phase/notes context, then the agent's own brief. */
export function buildSystemPrompt(agent: AgentConfig, programme: Programme): string {
  const contextLines = [
    `Programme name: ${programme.name}`,
    `Persona: ${programme.persona}`,
    `Phase: ${programme.active_phase}`,
    programme.client ? `Client: ${programme.client}` : null,
    programme.regulatory_frameworks.length > 0
      ? `Regulatory frameworks in scope: ${programme.regulatory_frameworks.join(", ")}`
      : null,
    programme.notes ? `Programme notes: ${programme.notes}` : null,
  ].filter((line): line is string => Boolean(line));

  return `${contextLines.join("\n")}\n\n${agent.systemPrompt}`;
}

export interface AgentTurnResult {
  blocked: boolean;
  reason?: string;
  reply?: string;
  recordedArtefacts?: string[];
  recordedAlerts?: number;
}

/** Runs one user turn of a conversation with an agent: may loop internally while Claude calls tools. */
export async function runAgentTurn(
  programmeId: string,
  agentName: string,
  userMessage: string,
  userEmail: string,
  alertId?: string
): Promise<AgentTurnResult> {
  const agent = getAgent(agentName);
  if (!agent) {
    return { blocked: true, reason: `Unknown agent "${agentName}".` };
  }

  const gate = await canRunAgent(programmeId, agentName);
  if (!gate.allowed) {
    return { blocked: true, reason: gate.reason ?? "This agent is not yet available." };
  }

  const programme = await getProgramme(programmeId);
  if (!programme) {
    return { blocked: true, reason: "Programme not found." };
  }

  const session = await loadOrCreateSession(programmeId, agent);
  const messages: ChatMessage[] = [...session.messages, { role: "user", content: userMessage }];
  const baseSystemPrompt = buildSystemPrompt(agent, programme);
  const extraContext = await getExtraContext(agentName, programmeId);
  let systemPrompt = extraContext ? `${baseSystemPrompt}\n\n${extraContext}` : baseSystemPrompt;

  const isWelcomeInit = userMessage === WELCOME_INIT_MARKER;

  // For the welcome briefing, inject all existing artefacts so the agent can
  // say what it already knows about the programme before asking questions.
  if (isWelcomeInit) {
    const existingArtefacts = await listArtefactsForProgramme(programmeId);
    const artefactContext = formatArtefactSummary(existingArtefacts);
    if (artefactContext) {
      systemPrompt += `\n\n${artefactContext}`;
    }

    // When opened from an alert card, inject the alert so the agent leads with
    // the specific issue rather than a generic welcome briefing.
    if (alertId) {
      const alert = await getAgentAlert(alertId);
      if (alert) {
        systemPrompt += `\n\n${formatAlertForSystemPrompt(alert)}`;
      }
    }

    systemPrompt +=
      "\n\nThis is the very start of the conversation. The programme manager has just opened this chat for the first time. " +
      "Generate a welcoming opening briefing that does three things:\n" +
      "1. Briefly introduce yourself — who you are and which artefacts you will produce in this session.\n" +
      "2. Summarise what you already know about this programme from the context above — be specific about what's been done so far (name artefacts, decisions, or data points where they exist). If nothing exists yet, say so clearly.\n" +
      "3. Ask the programme manager to confirm this is accurate and share any additional context, constraints, or priorities before you begin.\n" +
      "Write in flowing, professional prose. Do not use markdown headers. Do not record any artefacts yet.";
  }

  const activeIntegrations = await getActiveIntegrations();
  const mcpServers = activeIntegrations.map((integration) => ({
    type: "url" as const,
    url: integration.server_url,
    name: integration.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    ...(integration.auth_token ? { authorization_token: integration.auth_token } : {}),
  }));

  const tools: Anthropic.Messages.Tool[] = [RECORD_ARTEFACT_TOOL];
  if (agent.kpiLevers && agent.kpiLevers.length > 0) {
    tools.push(RECORD_KPI_TOOL);
  }
  if (agent.canRecordAlerts) {
    tools.push(RECORD_ALERT_TOOL);
  }

  const recordedArtefacts: string[] = [];
  let recordedAlerts = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let totalCacheCreationTokens = 0;
  let totalCacheReadTokens = 0;
  let finalAssistantText = "";

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const baseParams = {
      model: CLAUDE_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: systemPrompt,
      messages,
      tools,
      // Marks the last cacheable block in the request (the end of `messages`)
      // as an ephemeral (5-minute) cache breakpoint. Since each turn's request
      // is the previous turn's full request plus new messages appended, this
      // makes every turn after the first re-use the cached system prompt,
      // tools, and prior history instead of paying full input price for all
      // of it again — see Technical Documentation §6 for the cost accounting.
      cache_control: { type: "ephemeral" as const },
    };

    // Use the beta MCP client when integrations are configured; standard API otherwise.
    const response =
      mcpServers.length > 0
        ? await getClient().beta.messages.create({
            ...baseParams,
            mcp_servers: mcpServers,
            betas: ["mcp-client-2025-04-04"],
          })
        : await getClient().messages.create(baseParams);

    totalTokensIn += response.usage.input_tokens;
    totalTokensOut += response.usage.output_tokens;
    totalCacheCreationTokens += response.usage.cache_creation_input_tokens ?? 0;
    totalCacheReadTokens += response.usage.cache_read_input_tokens ?? 0;
    // Cast is safe: BetaContentBlock is a superset of ContentBlock at runtime;
    // we're just storing content for replay in subsequent turns.
    const responseContent = response.content as Anthropic.Messages.ContentBlock[];
    messages.push({ role: "assistant", content: responseContent });

    const textBlocks = responseContent.filter(
      (block): block is Anthropic.Messages.TextBlock => block.type === "text"
    );
    finalAssistantText = textBlocks.map((block) => block.text).join("\n").trim();

    const toolUseBlocks = responseContent.filter(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
    );

    // Every tool_use block MUST get a paired tool_result in the next message,
    // no matter why the response stopped — otherwise the next call to Claude
    // with this history is rejected outright, corrupting the saved session.
    // A truncated response (stop_reason "max_tokens") can still contain a
    // tool_use block with incomplete/unusable input, so that case is treated
    // as an error result rather than skipped.
    if (toolUseBlocks.length > 0) {
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        if (response.stop_reason === "max_tokens") {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: "Response was cut off before this tool call finished. Please ask the agent to try again, perhaps with a shorter artefact.",
            is_error: true,
          });
          continue;
        }

        if (toolUse.name === "record_alert") {
          const alertInput = toolUse.input as {
            what?: string;
            why_matters?: string[];
            suggested_action?: string;
          };
          if (
            !alertInput.what?.trim() ||
            !Array.isArray(alertInput.why_matters) ||
            alertInput.why_matters.length === 0 ||
            !alertInput.suggested_action?.trim()
          ) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: "record_alert requires non-empty 'what', at least one 'why_matters' bullet, and 'suggested_action'.",
              is_error: true,
            });
            continue;
          }
          await createAgentAlert(
            programmeId,
            agentName,
            alertInput.what,
            alertInput.why_matters,
            alertInput.suggested_action
          );
          recordedAlerts++;
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Alert recorded: "${alertInput.what}". It will appear on the programme home screen.`,
          });
          continue;
        }

        if (toolUse.name === "record_kpi") {
          const kpiInput = toolUse.input as {
            lever_or_dimension?: string;
            metric_name?: string;
            value?: number;
          };
          if (
            !kpiInput.lever_or_dimension ||
            !kpiInput.metric_name ||
            typeof kpiInput.value !== "number"
          ) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: "record_kpi requires lever_or_dimension, metric_name, and a numeric value.",
              is_error: true,
            });
            continue;
          }
          await writeKpiSnapshot(
            programmeId,
            programme.persona,
            kpiInput.lever_or_dimension,
            kpiInput.metric_name,
            kpiInput.value
          );
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Recorded KPI: ${kpiInput.metric_name} = ${kpiInput.value} (${kpiInput.lever_or_dimension}).`,
          });
          continue;
        }

        if (toolUse.name !== "record_artefact") {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Unknown tool "${toolUse.name}".`,
            is_error: true,
          });
          continue;
        }

        const input = toolUse.input as { artefactName?: string; content?: Record<string, unknown> };
        const isKnownArtefact = agent.produces.some((spec) => spec.name === input.artefactName);

        if (!isKnownArtefact || !input.content) {
          const validNames = agent.produces.map((spec) => spec.name).join(", ");
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `"${input.artefactName}" is not one of this agent's artefacts. Valid names: ${validNames}.`,
            is_error: true,
          });
          continue;
        }

        await recordArtefactDraft(
          programmeId,
          programme.name,
          agent,
          input.artefactName!,
          input.content,
          userEmail
        );
        recordedArtefacts.push(input.artefactName!);
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: `Recorded "${input.artefactName}" as a draft artefact for human review.`,
        });
      }

      messages.push({ role: "user", content: toolResults });
    }

    if (response.stop_reason !== "tool_use") {
      break;
    }
  }

  await saveSessionMessages(session.id, messages);
  await recordCost(
    programmeId,
    agentName,
    totalTokensIn,
    totalTokensOut,
    totalCacheCreationTokens,
    totalCacheReadTokens
  );

  return { blocked: false, reply: finalAssistantText, recordedArtefacts, recordedAlerts };
}
