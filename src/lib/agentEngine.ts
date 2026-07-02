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
import { getExtraContext } from "@/lib/crossCuttingContext";
import { getActiveIntegrations } from "@/lib/integrations";
import type { AgentConfig } from "@/agents/types";
import type { Programme } from "@/types/programme";

const MAX_OUTPUT_TOKENS = 4096;
const MAX_TOOL_ITERATIONS = 5;

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
}

/** Runs one user turn of a conversation with an agent: may loop internally while Claude calls tools. */
export async function runAgentTurn(
  programmeId: string,
  agentName: string,
  userMessage: string,
  userEmail: string
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
  const systemPrompt = extraContext ? `${baseSystemPrompt}\n\n${extraContext}` : baseSystemPrompt;

  const activeIntegrations = await getActiveIntegrations();
  const mcpServers = activeIntegrations.map((integration) => ({
    type: "url" as const,
    url: integration.server_url,
    name: integration.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    ...(integration.auth_token ? { authorization_token: integration.auth_token } : {}),
  }));

  const recordedArtefacts: string[] = [];
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let finalAssistantText = "";

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const baseParams = {
      model: CLAUDE_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: systemPrompt,
      messages,
      tools: [RECORD_ARTEFACT_TOOL],
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
  await recordCost(programmeId, agentName, totalTokensIn, totalTokensOut);

  return { blocked: false, reply: finalAssistantText, recordedArtefacts };
}
