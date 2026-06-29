// Server-only: builds Governance Guardian's portfolio-wide context (the
// programme's existing artefacts). Deliberately NOT exported from
// src/agents/cross-cutting/governanceGuardian.ts — that file is reachable
// from client components via the registry, and this one touches Supabase.

import { listArtefactsForProgramme } from "@/lib/artefacts";
import { formatArtefactSummary } from "@/agents/cross-cutting/artefactSummary";

/** Fetches and formats this programme's existing artefacts for Governance Guardian's context. */
export async function buildGovernanceGuardianContext(programmeId: string): Promise<string | null> {
  const artefacts = await listArtefactsForProgramme(programmeId);
  return formatArtefactSummary(artefacts);
}
