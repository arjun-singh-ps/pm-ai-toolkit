// GET /api/alerts?programmeId= — returns active alerts for a programme.

import { NextResponse } from "next/server";
import { listActiveAlerts } from "@/lib/agentAlerts";

/** Returns all active alerts for a programme, newest first. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const programmeId = searchParams.get("programmeId");

  if (!programmeId) {
    return NextResponse.json({ error: "'programmeId' query parameter is required." }, { status: 400 });
  }

  try {
    const alerts = await listActiveAlerts(programmeId);
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Failed to list alerts:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load alerts." }, { status: 500 });
  }
}
