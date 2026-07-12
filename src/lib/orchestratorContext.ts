// Server-only: builds Navigator's (orchestrator) programme progress map —
// shows which agents have produced artefacts, which are in-progress, and
// which have not been started yet. Gives Navigator the factual foundation
// it needs to give specific, grounded navigation advice rather than generic
// sequencing guidance.

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
} from "@/agents/registry";
import type { AgentConfig } from "@/agents/types";

const PHASE_ORDER: Record<string, { label: string; agents: AgentConfig[] }[]> = {
  legacy: [
    { label: "Foundation", agents: FOUNDATION_AGENTS },
    { label: "Forge", agents: FORGE_AGENTS },
    { label: "Amplify", agents: AMPLIFY_AGENTS },
  ],
  agentic: [
    { label: "Envision", agents: ENVISION_AGENTS },
    { label: "Shape", agents: SHAPE_AGENTS },
    { label: "Incubate", agents: INCUBATE_AGENTS },
    { label: "Prove", agents: PROVE_AGENTS },
  ],
};

/** Builds Navigator's programme progress map: agent-by-agent state for navigation advice. */
export async function buildOrchestratorContext(programmeId: string): Promise<string | null> {
  const [programme, artefacts] = await Promise.all([
    getProgramme(programmeId),
    listArtefactsForProgramme(programmeId),
  ]);

  if (!programme) return null;

  const persona = programme.persona as string;
  const phases = PHASE_ORDER[persona] ?? PHASE_ORDER["legacy"];

  // Index artefacts by the agent that produced them.
  const artefactsByAgent = new Map<string, { name: string; status: string; version: number }[]>();
  for (const artefact of artefacts) {
    const existing = artefactsByAgent.get(artefact.agent_name) ?? [];
    existing.push({
      name: artefact.artefact_name,
      status: artefact.status,
      version: artefact.version,
    });
    artefactsByAgent.set(artefact.agent_name, existing);
  }

  const phaseBlocks: string[] = [];

  for (const { label, agents } of phases) {
    const agentLines: string[] = [];

    for (const agent of agents) {
      const produced = artefactsByAgent.get(agent.name) ?? [];
      const expectedCount = agent.produces.length;

      let statusLabel: string;
      if (produced.length === 0) {
        statusLabel = "NOT STARTED";
      } else {
        const allApproved =
          produced.length >= expectedCount && produced.every((a) => a.status === "approved");
        statusLabel = allApproved ? "COMPLETE" : "IN PROGRESS";
      }

      const artefactDetail =
        produced.length > 0
          ? produced
              .map((a) => `      • ${a.name} (${a.status}, v${a.version})`)
              .join("\n")
          : `      • none yet (expects: ${agent.produces.map((p) => p.name).join(", ") || "no fixed artefacts"})`;

      agentLines.push(`  [${statusLabel}] ${agent.displayName} (${agent.name})\n${artefactDetail}`);
    }

    phaseBlocks.push(`### ${label} phase\n${agentLines.join("\n")}`);
  }

  const activePhaseLabel = phases.find((p) =>
    p.agents.some((a) => a.phase === programme.active_phase)
  )?.label ?? programme.active_phase;

  return (
    `## Programme progress map\n\n` +
    `Programme: ${programme.name}\n` +
    `Persona: ${persona === "legacy" ? "Modernising Legacy Journey" : "Agentic Delivery"}\n` +
    `Active phase: ${activePhaseLabel}\n\n` +
    phaseBlocks.join("\n\n")
  );
}
