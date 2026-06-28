// API route for listing artefacts, used by the Artefacts tab and history page.

import { NextResponse } from "next/server";
import { listArtefactsForProgramme } from "@/lib/artefacts";

/** Handles GET /api/artefacts?programmeId=... */
export async function GET(request: Request) {
  const programmeId = new URL(request.url).searchParams.get("programmeId");

  if (!programmeId) {
    return NextResponse.json({ error: "'programmeId' query parameter is required." }, { status: 400 });
  }

  try {
    const artefacts = await listArtefactsForProgramme(programmeId);
    return NextResponse.json({ artefacts });
  } catch (error) {
    console.error("Failed to list artefacts:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load artefacts." }, { status: 500 });
  }
}
