// Pure formatting logic for summarising a programme's existing artefacts
// into context text for a cross-cutting agent. No Supabase/fs imports here
// — kept separate from data-fetching so it's trivially unit-testable.

import type { Artefact } from "@/types/artefact";

const MAX_SECTION_BODY_LENGTH = 500;

interface ArtefactSection {
  heading?: string;
  body?: string;
}

/** Truncates a section body to a fixed length with an explicit marker, never silently. */
function truncateBody(body: string): string {
  if (body.length <= MAX_SECTION_BODY_LENGTH) {
    return body;
  }
  return `${body.slice(0, MAX_SECTION_BODY_LENGTH)}... [truncated]`;
}

/**
 * Formats every artefact (any status) into a status-labeled summary block,
 * approved artefacts first then drafts/in-progress, so a cross-cutting
 * agent reviewing the whole programme has real content to ground its
 * output in rather than going generic. Returns null if there's nothing yet.
 */
export function formatArtefactSummary(artefacts: Artefact[]): string | null {
  if (artefacts.length === 0) {
    return null;
  }

  const sorted = [...artefacts].sort((a, b) =>
    a.status === "approved" && b.status !== "approved" ? -1 : a.status !== "approved" && b.status === "approved" ? 1 : 0
  );

  const blocks = sorted.map((artefact) => {
    const content = artefact.content as { title?: string; sections?: ArtefactSection[] };
    const sections = content.sections ?? [];
    const sectionText = sections
      .map((section) => `  - ${section.heading ?? "Untitled"}: ${truncateBody(section.body ?? "")}`)
      .join("\n");

    return `### ${artefact.artefact_name} (${artefact.status}, v${artefact.version}, from ${artefact.agent_name})\n${sectionText || "  (no content)"}`;
  });

  return `## Existing programme artefacts\n\n${blocks.join("\n\n")}`;
}
