// Server-only: builds AI Safety Review's context — the full artefact summary
// for the programme. Uses the same formatArtefactSummary helper as Governance
// Guardian and Comms Architect, since the agent's job is to review what's
// been produced so far for safety and compliance.

import { listArtefactsForProgramme } from "@/lib/artefacts";
import { formatArtefactSummary } from "@/agents/cross-cutting/artefactSummary";

/** Fetches and formats this programme's artefacts for AI Safety Review's context. */
export async function buildResponsibleAiContext(programmeId: string): Promise<string | null> {
  const artefacts = await listArtefactsForProgramme(programmeId);
  return formatArtefactSummary(artefacts);
}
