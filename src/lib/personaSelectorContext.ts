// Server-only: builds Persona Guide's context — an artefact summary plus
// a clear statement of the current persona commitment. If no artefacts exist
// yet, returns just the persona commitment so Persona Guide knows whether
// the PM is considering a switch or choosing for the first time.

import { listArtefactsForProgramme } from "@/lib/artefacts";
import { getProgramme } from "@/lib/programmes";
import { formatArtefactSummary } from "@/agents/cross-cutting/artefactSummary";

/** Builds context for Persona Guide: persona commitment + existing artefact state. */
export async function buildPersonaSelectorContext(programmeId: string): Promise<string | null> {
  const [programme, artefacts] = await Promise.all([
    getProgramme(programmeId),
    listArtefactsForProgramme(programmeId),
  ]);

  if (!programme) return null;

  const personaName =
    programme.persona === "legacy" ? "Modernising Legacy Journey" : "Agentic Delivery";

  const commitmentBlock =
    `## Current persona commitment\n\n` +
    `Persona: ${personaName} (${programme.persona})\n` +
    `Active phase: ${programme.active_phase}\n` +
    `Artefacts produced so far: ${artefacts.length}`;

  const artefactBlock = formatArtefactSummary(artefacts);

  if (!artefactBlock) {
    return (
      commitmentBlock +
      "\n\nNo artefacts have been produced yet. The PM is at the very start of this programme."
    );
  }

  return `${commitmentBlock}\n\n${artefactBlock}`;
}
