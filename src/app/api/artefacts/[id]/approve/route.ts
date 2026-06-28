// API route for the explicit human approval action on a draft artefact.

import { NextResponse } from "next/server";
import { approveArtefact } from "@/lib/artefacts";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Handles POST /api/artefacts/[id]/approve. */
export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const artefact = await approveArtefact(id);
    return NextResponse.json({ artefact });
  } catch (error) {
    console.error("Failed to approve artefact:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to approve artefact." }, { status: 500 });
  }
}
