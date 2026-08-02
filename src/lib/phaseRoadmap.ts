// Builds a persona's full phase roadmap for the Roadmap view: every phase in
// delivery order, marked completed/current/upcoming, with each phase's
// agents and their artefact-approval status — computed entirely from an
// already-fetched artefact list, no extra Supabase queries.

import { listAgentsForPhase } from "@/agents/registry";
import { canRunAgent, type ArtefactStatusRow } from "@/lib/gating";
import type { Persona } from "@/types/programme";
import type { Artefact } from "@/types/artefact";

export type PhaseStatus = "completed" | "current" | "upcoming";
export type AgentStatus = "approved" | "in_progress" | "pending" | "locked";

export interface RoadmapAgent {
  name: string;
  displayName: string;
  status: AgentStatus;
  reason?: string;
}

export interface RoadmapPhase {
  phase: string;
  status: PhaseStatus;
  approvedCount: number;
  totalCount: number;
  agents: RoadmapAgent[];
}

/** Ordered phase list per persona's delivery journey — the Roadmap view's timeline order. */
export const PHASE_ORDER: Record<Persona, string[]> = {
  legacy: ["foundation", "forge", "amplify"],
  agentic: ["envision", "shape", "incubate", "prove", "scale"],
};

/**
 * Builds the full ordered roadmap for a programme. Read-only: this never
 * touches programme.active_phase — a phase before the current one is
 * "completed" and browsable, never re-activated.
 */
export async function buildRoadmap(
  programmeId: string,
  persona: Persona,
  activePhase: string,
  artefacts: Artefact[]
): Promise<RoadmapPhase[]> {
  const order = PHASE_ORDER[persona];
  const activeIndex = order.indexOf(activePhase);

  const fromCache = async (_id: string, names: string[]): Promise<ArtefactStatusRow[]> =>
    artefacts
      .filter((a) => names.includes(a.artefact_name))
      .map((a) => ({ artefact_name: a.artefact_name, status: a.status }));

  return Promise.all(
    order.map(async (phase, index) => {
      const agentsForPhase = listAgentsForPhase(persona, phase);

      const agents = await Promise.all(
        agentsForPhase.map(async (agent) => {
          const gate = await canRunAgent(programmeId, agent.name, fromCache);
          const produced = artefacts.filter((a) => a.agent_name === agent.name);
          const allApproved =
            agent.produces.length > 0 &&
            agent.produces.every(
              (spec) => produced.find((r) => r.artefact_name === spec.name)?.status === "approved"
            );

          const status: AgentStatus = !gate.allowed
            ? "locked"
            : allApproved
              ? "approved"
              : produced.length > 0
                ? "in_progress"
                : "pending";

          return { name: agent.name, displayName: agent.displayName, status, reason: gate.reason };
        })
      );

      const approvedCount = agents.filter((a) => a.status === "approved").length;
      const status: PhaseStatus =
        index < activeIndex ? "completed" : index === activeIndex ? "current" : "upcoming";

      return { phase, status, approvedCount, totalCount: agents.length, agents };
    })
  );
}
