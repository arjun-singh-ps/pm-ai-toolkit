// Server-only: builds Artefact State's detailed status map — every artefact
// grouped by agent, with status, version, and approval state. Deliberately
// more structured than the formatArtefactSummary used by other cross-cutting
// agents, because Artefact State exists specifically to give the PM a
// comprehensive programme status overview, not just background context.

import { listArtefactsForProgramme } from "@/lib/artefacts";
import { getProgramme } from "@/lib/programmes";
import {
  FOUNDATION_AGENTS,
  FORGE_AGENTS,
  AMPLIFY_AGENTS,
  ENVISION_AGENTS,
  SHAPE_AGENTS,
  INCUBATE_AGENTS,
  PROVE_AGENTS,
  SCALE_AGENTS,
} from "@/agents/registry";
import type { AgentConfig } from "@/agents/types";

const PERSONA_PHASES: Record<string, { phase: string; agents: AgentConfig[] }[]> = {
  legacy: [
    { phase: "foundation", agents: FOUNDATION_AGENTS },
    { phase: "forge", agents: FORGE_AGENTS },
    { phase: "amplify", agents: AMPLIFY_AGENTS },
  ],
  agentic: [
    { phase: "envision", agents: ENVISION_AGENTS },
    { phase: "shape", agents: SHAPE_AGENTS },
    { phase: "incubate", agents: INCUBATE_AGENTS },
    { phase: "prove", agents: PROVE_AGENTS },
    { phase: "scale", agents: SCALE_AGENTS },
  ],
};

/** Builds Artefact State's detailed status map for programme status reporting. */
export async function buildArtefactStateContext(programmeId: string): Promise<string | null> {
  const [programme, artefacts] = await Promise.all([
    getProgramme(programmeId),
    listArtefactsForProgramme(programmeId),
  ]);

  if (!programme) return null;

  const persona = programme.persona as string;
  const phases = PERSONA_PHASES[persona] ?? PERSONA_PHASES["legacy"];

  // Index artefacts by agent name for O(1) lookup.
  const byAgent = new Map<string, typeof artefacts>();
  for (const artefact of artefacts) {
    const existing = byAgent.get(artefact.agent_name) ?? [];
    existing.push(artefact);
    byAgent.set(artefact.agent_name, existing);
  }

  // Counts for summary header.
  let agentComplete = 0;
  let agentInProgress = 0;
  let agentNotStarted = 0;
  const awaitingApproval: string[] = [];

  const phaseBlocks: string[] = [];

  for (const { phase, agents } of phases) {
    const agentLines: string[] = [];

    for (const agent of agents) {
      const produced = byAgent.get(agent.name) ?? [];
      const expectedArtefacts = agent.produces;

      // Work out which expected artefacts are missing.
      const producedNames = new Set(produced.map((a) => a.artefact_name));
      const missing = expectedArtefacts.filter((p) => !producedNames.has(p.name));

      // Determine agent-level status.
      let agentStatus: "COMPLETE" | "IN PROGRESS" | "NOT STARTED";
      if (produced.length === 0) {
        agentStatus = "NOT STARTED";
        agentNotStarted++;
      } else if (
        missing.length === 0 &&
        produced.every((a) => a.status === "approved")
      ) {
        agentStatus = "COMPLETE";
        agentComplete++;
      } else {
        agentStatus = "IN PROGRESS";
        agentInProgress++;
      }

      // Flag artefacts awaiting approval.
      for (const a of produced) {
        if (a.status === "draft" || a.status === "in_progress") {
          awaitingApproval.push(`${a.artefact_name} (from ${agent.displayName})`);
        }
      }

      // Build per-artefact lines.
      const artefactLines: string[] = [];
      for (const p of expectedArtefacts) {
        const artefact = produced.find((a) => a.artefact_name === p.name);
        if (artefact) {
          artefactLines.push(
            `    • ${p.name}: ${artefact.status}, v${artefact.version}, ` +
              `updated ${artefact.created_at.slice(0, 10)}` +
              (artefact.approved_at ? `, approved ${artefact.approved_at.slice(0, 10)}` : "")
          );
        } else {
          artefactLines.push(`    • ${p.name}: NOT YET PRODUCED`);
        }
      }

      if (expectedArtefacts.length === 0) {
        artefactLines.push("    (strategic adviser — no fixed artefacts)");
      }

      agentLines.push(
        `  [${agentStatus}] ${agent.displayName}\n${artefactLines.join("\n")}`
      );
    }

    phaseBlocks.push(
      `### ${phase.charAt(0).toUpperCase() + phase.slice(1)} phase\n${agentLines.join("\n")}`
    );
  }

  const totalAgents = agentComplete + agentInProgress + agentNotStarted;
  const completePct = totalAgents > 0 ? Math.round((agentComplete / totalAgents) * 100) : 0;

  const awaiting =
    awaitingApproval.length > 0
      ? `\n\n## Awaiting PM approval\n${awaitingApproval.map((a) => `  • ${a}`).join("\n")}`
      : "\n\n## Awaiting PM approval\n  (none — all produced artefacts are approved)";

  return (
    `## Programme status map\n\n` +
    `Programme: ${programme.name} | Persona: ${persona} | Active phase: ${programme.active_phase}\n` +
    `Agents: ${agentComplete} complete / ${agentInProgress} in progress / ${agentNotStarted} not started (${completePct}% complete)\n` +
    `${awaiting}\n\n` +
    phaseBlocks.join("\n\n")
  );
}
