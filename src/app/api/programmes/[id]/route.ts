// API route for fetching and updating a single programme.

import { NextResponse } from "next/server";
import { getProgramme, updateProgramme } from "@/lib/programmes";
import type { Programme } from "@/types/programme";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Handles GET /api/programmes/[id] — returns one programme or 404. */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const programme = await getProgramme(id);

    if (!programme) {
      return NextResponse.json({ error: "Programme not found." }, { status: 404 });
    }

    return NextResponse.json({ programme });
  } catch (error) {
    console.error("Failed to fetch programme:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load programme." }, { status: 500 });
  }
}

/** Handles PATCH /api/programmes/[id] — updates notes, active_phase, regulatory_frameworks, or proactive_agents. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as Partial<
    Pick<Programme, "notes" | "active_phase" | "regulatory_frameworks" | "proactive_agents">
  >;

  try {
    const programme = await updateProgramme(id, body);
    return NextResponse.json({ programme });
  } catch (error) {
    console.error("Failed to update programme:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to update programme." }, { status: 500 });
  }
}
