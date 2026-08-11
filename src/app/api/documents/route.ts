// Document upload and listing API.
// POST: accepts a multipart/form-data file upload, extracts plain text, saves to programme_documents.
// GET: returns all documents for a programme (?programmeId=).
//
// Supports: PDF (pdf-parse), Excel/xls/xlsx (xlsx), Word/docx (mammoth).
// The raw file is never stored — only the extracted text, used as agent context.
//
// All three parsing packages are marked in next.config.ts as serverExternalPackages
// so webpack skips bundling them; they are require()'d at runtime in Node.js only.
//
// pdf-parse is pinned to 1.x — 2.x pulls in @napi-rs/canvas + pdfjs-dist for
// rendering, and that native binary doesn't load reliably on this app's
// Alpine/musl deploy target, which crashed every request here (even GET) with
// "ReferenceError: DOMMatrix is not defined". 1.x has no canvas dependency and
// is enough since this only ever needs plain text, never rendering.

import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { createDocument, listDocumentsForProgramme } from "@/lib/programmeDocuments";
import { getCurrentUserEmail } from "@/lib/auth";
import type { DocumentFileType } from "@/types/programmeDocument";

const SUPPORTED_EXTENSIONS = new Set(["pdf", "xlsx", "xls", "docx", "doc"]);

/** Extracts the lowercase file extension from a filename. */
function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

/** Extracts plain text from a file buffer based on its type. */
async function extractText(buffer: Buffer, fileType: DocumentFileType): Promise<string> {
  if (fileType === "pdf") {
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  if (fileType === "xlsx" || fileType === "xls") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    return workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      return `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(sheet)}`;
    }).join("\n\n");
  }

  if (fileType === "docx" || fileType === "doc") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

/** GET /api/documents?programmeId= — lists documents for a programme. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const programmeId = searchParams.get("programmeId");
  if (!programmeId) {
    return NextResponse.json({ error: "programmeId is required." }, { status: 400 });
  }

  try {
    const documents = await listDocumentsForProgramme(programmeId);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Failed to list documents:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to list documents." }, { status: 500 });
  }
}

/** POST /api/documents — upload a file, extract its text, save the result. */
export async function POST(request: Request) {
  const email = await getCurrentUserEmail();
  if (!email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const programmeId = formData.get("programmeId") as string | null;

    if (!file || !programmeId) {
      return NextResponse.json({ error: "file and programmeId are required." }, { status: 400 });
    }

    const ext = getExtension(file.name);
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type ".${ext}". Supported: PDF, Excel, Word.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentText = await extractText(buffer, ext as DocumentFileType);

    if (!contentText.trim()) {
      return NextResponse.json(
        { error: "No text could be extracted from this file." },
        { status: 422 }
      );
    }

    const document = await createDocument(
      programmeId,
      file.name,
      ext as DocumentFileType,
      contentText,
      email
    );

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Document upload failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to process document." }, { status: 500 });
  }
}
