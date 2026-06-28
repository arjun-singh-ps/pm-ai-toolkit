// API route: returns the phase-gate checklist (every agent's artefacts and
// whether each is approved) for the right panel's Gate tab.

import { NextResponse } from "next/server";
import { listAgentsForPhase } from "@/agents/registry";
import { getProgramme } from "@/lib/programmes";
import { listArtefactsForProgramme } from "@/lib/artefacts";

interface RouteParams {
  params: Promise<{ phase: string }>;
}

/** Handles GET /api/gate/[phase]?programmeId=... */
export async function GET(request: Request, { params }: RouteParams) {
  const { phase } = await params;
  const programmeId = new URL(request.url).searchParams.get("programmeId");

  if (!programmeId) {
    return NextResponse.json({ error: "'programmeId' query parameter is required." }, { status: 400 });
  }

  try {
    const programme = await getProgramme(programmeId);
    if (!programme) {
      return NextResponse.json({ error: "Programme not found." }, { status: 404 });
    }

    const artefacts = await listArtefactsForProgramme(programmeId);
    const agents = listAgentsForPhase(programme.persona, phase).map((agent) => ({
      name: agent.name,
      displayName: agent.displayName,
      artefacts: agent.produces.map((spec) => ({
        name: spec.name,
        approved: artefacts.some((row) => row.artefact_name === spec.name && row.status === "approved"),
      })),
    }));

    const clear = agents.every((agent) => agent.artefacts.every((artefact) => artefact.approved));

    return NextResponse.json({ clear, agents });
  } catch (error) {
    console.error("Failed to load gate status:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load gate status." }, { status: 500 });
  }
}
