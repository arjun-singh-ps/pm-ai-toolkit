// DELETE /api/documents/[id] — removes a programme document.

import { NextResponse } from "next/server";
import { deleteDocument } from "@/lib/programmeDocuments";
import { getCurrentUserEmail } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Handles DELETE /api/documents/[id] — removes a document. Requires auth. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const email = await getCurrentUserEmail();
  if (!email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteDocument(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete document:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }
}
