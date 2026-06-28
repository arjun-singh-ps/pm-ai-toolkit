// API route for listing and creating programmes.

import { NextResponse } from "next/server";
import { createProgramme, listProgrammes } from "@/lib/programmes";
import type { CreateProgrammeInput } from "@/types/programme";

/** Handles GET /api/programmes — returns every programme. */
export async function GET() {
  try {
    const programmes = await listProgrammes();
    return NextResponse.json({ programmes });
  } catch (error) {
    console.error("Failed to list programmes:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load programmes." }, { status: 500 });
  }
}

/** Handles POST /api/programmes — creates a new programme. Expects CreateProgrammeInput. */
export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateProgrammeInput>;

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "'name' is required." }, { status: 400 });
  }

  if (body.persona !== "legacy" && body.persona !== "agentic") {
    return NextResponse.json({ error: "'persona' must be 'legacy' or 'agentic'." }, { status: 400 });
  }

  try {
    const programme = await createProgramme({
      name: body.name,
      client: body.client,
      persona: body.persona,
      regulatoryFrameworks: body.regulatoryFrameworks,
    });
    return NextResponse.json({ programme }, { status: 201 });
  } catch (error) {
    console.error("Failed to create programme:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to create programme." }, { status: 500 });
  }
}
