// Builds a formatted Word document (.docx) from an artefact's structured
// content and triggers a browser download. Runs entirely client-side — the
// artefact's content is already loaded into the viewer, so no server round
// trip or new API route is needed. Only ever called from a "use client"
// component's event handler, never during render.

import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { Artefact } from "@/types/artefact";

interface ArtefactSection {
  heading?: string;
  body?: string;
}

interface ArtefactContent {
  title?: string;
  sections?: ArtefactSection[];
  version?: number;
  date?: string;
  programmeName?: string;
  owner?: string;
  disclaimer?: string;
}

/** Splits a section body into paragraphs on blank lines, and single newlines into line breaks within a paragraph. */
function bodyParagraphs(body: string): Paragraph[] {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [new Paragraph({})];
  }

  return paragraphs.map(
    (paragraph) =>
      new Paragraph({
        spacing: { after: 200 },
        children: paragraph
          .split("\n")
          .map((line, index) => new TextRun({ text: line, break: index === 0 ? 0 : 1 })),
      })
  );
}

/** Strips characters Windows/macOS forbid in filenames. */
function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "-").trim();
}

/** Generates a formatted .docx for one artefact and triggers a browser download of it. */
export async function downloadArtefactAsDocx(artefact: Artefact): Promise<void> {
  const content = artefact.content as ArtefactContent;
  const title = content.title ?? artefact.artefact_name;
  const sections = content.sections ?? [];
  const version = content.version ?? artefact.version;

  const metaLine = [
    `Version ${version}`,
    content.date,
    content.programmeName ? `Programme: ${content.programmeName}` : null,
    content.owner ? `Recorded by: ${content.owner}` : null,
    artefact.status === "approved" && artefact.approved_by
      ? `Approved by: ${artefact.approved_by}`
      : `Status: ${artefact.status.replace("_", " ")}`,
  ]
    .filter((part): part is string => Boolean(part))
    .join("   |   ");

  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: metaLine, color: "666666", size: 20 })],
    }),
  ];

  for (const section of sections) {
    children.push(
      new Paragraph({
        text: section.heading ?? "Untitled",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );
    children.push(...bodyParagraphs(section.body ?? ""));
  }

  if (content.disclaimer) {
    children.push(
      new Paragraph({
        spacing: { before: 400 },
        children: [
          new TextRun({ text: `⚠ ${content.disclaimer}`, italics: true, color: "B45309", size: 20 }),
        ],
      })
    );
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(title)} v${version}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
