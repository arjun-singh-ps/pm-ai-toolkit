// Dependency and phase-gate checks. Called from both the chat API route
// (to refuse running a locked agent) and the sidebar nav (to grey it out) —
// one source of truth, two call sites.

import { getSupabaseServiceClient } from "@/lib/supabase";
import { getAgent, listAgentsForPhase } from "@/agents/registry";
import type { Persona } from "@/types/programme";

export interface ArtefactStatusRow {
  artefact_name: string;
  status: string;
}

/** Reads artefact name/status pairs for a programme, restricted to the given names. Injectable for tests. */
export type FetchArtefactStatuses = (
  programmeId: string,
  artefactNames: string[]
) => Promise<ArtefactStatusRow[]>;

async function defaultFetchArtefactStatuses(
  programmeId: string,
  artefactNames: string[]
): Promise<ArtefactStatusRow[]> {
  if (artefactNames.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseServiceClient()
    .from("artefacts")
    .select("artefact_name, status")
    .eq("programme_id", programmeId)
    .in("artefact_name", artefactNames);

  if (error) {
    throw new Error(`Failed to check artefact status: ${error.message}`);
  }

  return data as ArtefactStatusRow[];
}

function missingApprovedArtefacts(rows: ArtefactStatusRow[], requiredNames: string[]): string[] {
  const approved = new Set(rows.filter((row) => row.status === "approved").map((row) => row.artefact_name));
  return requiredNames.filter((name) => !approved.has(name));
}

/** True if every artefact this agent depends on (via its dependsOnAgents) is approved for this programme. */
export async function canRunAgent(
  programmeId: string,
  agentName: string,
  fetchArtefactStatuses: FetchArtefactStatuses = defaultFetchArtefactStatuses
): Promise<{ allowed: boolean; reason?: string }> {
  const agent = getAgent(agentName);

  if (!agent) {
    return { allowed: false, reason: `Unknown agent "${agentName}".` };
  }

  for (const dependencyName of agent.dependsOnAgents) {
    const dependency = getAgent(dependencyName);
    if (!dependency) {
      continue;
    }

    const requiredNames = dependency.produces.map((spec) => spec.name);
    const rows = await fetchArtefactStatuses(programmeId, requiredNames);
    const missing = missingApprovedArtefacts(rows, requiredNames);

    if (missing.length > 0) {
      return {
        allowed: false,
        reason: `Waiting on ${dependency.displayName} to be approved (missing: ${missing.join(", ")}).`,
      };
    }
  }

  return { allowed: true };
}

/** True if every agent's artefacts in this persona+phase are approved, i.e. the next phase may unlock. */
export async function isPhaseGateClear(
  programmeId: string,
  persona: Persona,
  phase: string,
  fetchArtefactStatuses: FetchArtefactStatuses = defaultFetchArtefactStatuses
): Promise<{ clear: boolean; missing: string[] }> {
  const requiredNames = listAgentsForPhase(persona, phase).flatMap((agent) =>
    agent.produces.map((spec) => spec.name)
  );

  const rows = await fetchArtefactStatuses(programmeId, requiredNames);
  const missing = missingApprovedArtefacts(rows, requiredNames);

  return { clear: missing.length === 0, missing };
}
