// Server-only: builds Roadmap Architect's context from the programme's
// existing artefacts. Same source as Governance Guardian but framed for
// planning rather than compliance — phases, approvals, and gate status
// are what the roadmap agent cares about most.

import { listArtefactsForProgramme } from "@/lib/artefacts";
import { formatArtefactSummary } from "@/agents/cross-cutting/artefactSummary";

/** Fetches and formats this programme's artefacts for Roadmap Architect's context. */
export async function buildRoadmapArchitectContext(programmeId: string): Promise<string | null> {
  const artefacts = await listArtefactsForProgramme(programmeId);
  return formatArtefactSummary(artefacts);
}
