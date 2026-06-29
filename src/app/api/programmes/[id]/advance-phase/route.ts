// API route: the only path that may change a programme's active_phase.
// Re-checks the phase gate server-side — never trust a disabled UI button
// alone to enforce this business rule.

import { NextResponse } from "next/server";
import { getProgramme, updateProgramme } from "@/lib/programmes";
import { isPhaseGateClear } from "@/lib/gating";
import { listAgentsForPhase } from "@/agents/registry";
import { NEXT_PHASE } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Handles POST /api/programmes/[id]/advance-phase. */
export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const programme = await getProgramme(id);
    if (!programme) {
      return NextResponse.json({ error: "Programme not found." }, { status: 404 });
    }

    const nextPhase = NEXT_PHASE[programme.active_phase];
    if (!nextPhase || listAgentsForPhase(programme.persona, nextPhase).length === 0) {
      return NextResponse.json({ error: "The next phase is not yet available." }, { status: 403 });
    }

    const gate = await isPhaseGateClear(id, programme.persona, programme.active_phase);
    if (!gate.clear) {
      return NextResponse.json(
        { error: `Phase gate not clear. Missing: ${gate.missing.join(", ")}.` },
        { status: 403 }
      );
    }

    const updated = await updateProgramme(id, { active_phase: nextPhase });
    return NextResponse.json({ programme: updated });
  } catch (error) {
    console.error("Failed to advance phase:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to advance phase." }, { status: 500 });
  }
}
