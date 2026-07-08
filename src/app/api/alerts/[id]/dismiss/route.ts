// POST /api/alerts/[id]/dismiss — records the PM's response to a proactive alert.
// The dismiss reason is how the system learns whether its thresholds are calibrated correctly.

import { NextResponse } from "next/server";
import { dismissAlert } from "@/lib/agentAlerts";
import { getCurrentUserEmail } from "@/lib/auth";
import type { DismissReason } from "@/types/agentAlert";

const VALID_REASONS = new Set<DismissReason>([
  "not_relevant",
  "already_handled",
  "monitor_next_sprint",
]);

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Handles POST /api/alerts/[id]/dismiss. Expects { reason: DismissReason }. */
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const userEmail = await getCurrentUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { reason?: string };
  const reason = body.reason as DismissReason | undefined;

  if (!reason || !VALID_REASONS.has(reason)) {
    return NextResponse.json(
      { error: `'reason' must be one of: ${[...VALID_REASONS].join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const alert = await dismissAlert(id, userEmail, reason);
    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Failed to dismiss alert:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to dismiss alert." }, { status: 500 });
  }
}
