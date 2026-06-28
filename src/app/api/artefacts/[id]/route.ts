// API route for fetching one artefact's full content.

import { NextResponse } from "next/server";
import { getArtefact } from "@/lib/artefacts";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Handles GET /api/artefacts/[id]. */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const artefact = await getArtefact(id);

    if (!artefact) {
      return NextResponse.json({ error: "Artefact not found." }, { status: 404 });
    }

    return NextResponse.json({ artefact });
  } catch (error) {
    console.error("Failed to fetch artefact:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load artefact." }, { status: 500 });
  }
}
