// Extra context injected into the Delivery Intelligence agent's system prompt.
// Fetches any programme documents the PM has uploaded and formats them as source
// material for the RAID Register, alongside the MCP integrations that are
// already wired globally (Jira, Confluence, SharePoint) via the agent engine.

import { listDocumentsForProgramme } from "@/lib/programmeDocuments";

/** Characters of document text shown per file before truncation. */
const MAX_CHARS_PER_DOC = 3000;

/**
 * Builds context from uploaded programme documents. Returns null when none exist
 * so the agent engine skips the injection rather than appending an empty block.
 */
export async function buildDeliveryIntelligenceContext(
  programmeId: string
): Promise<string | null> {
  const docs = await listDocumentsForProgramme(programmeId);
  if (docs.length === 0) return null;

  const sections = docs.map((doc) => {
    const body =
      doc.content_text.length > MAX_CHARS_PER_DOC
        ? `${doc.content_text.slice(0, MAX_CHARS_PER_DOC)}\n[... truncated — ${doc.content_text.length} chars total]`
        : doc.content_text;
    return `### ${doc.filename} (${doc.file_type})\n${body}`;
  });

  return [
    "--- Uploaded programme documents (primary source material for RAID Register) ---",
    "Extract any existing risks, assumptions, issues, and dependencies from these documents.",
    "Where data is structured (e.g. a spreadsheet), preserve the row-by-row detail.",
    ...sections,
    "---",
  ].join("\n\n");
}
