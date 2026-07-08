// API route for reading KPI snapshots for a programme.

import { NextResponse } from "next/server";
import { listKpiSnapshots } from "@/lib/kpiSnapshots";

/** Handles GET /api/kpis?programmeId= — returns all KPI snapshots, most recent first. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const programmeId = searchParams.get("programmeId");

  if (!programmeId) {
    return NextResponse.json({ error: "programmeId is required." }, { status: 400 });
  }

  try {
    const snapshots = await listKpiSnapshots(programmeId);
    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error("Failed to fetch KPI snapshots:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load KPI snapshots." }, { status: 500 });
  }
}
