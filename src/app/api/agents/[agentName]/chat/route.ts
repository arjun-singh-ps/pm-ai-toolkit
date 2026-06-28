// API route: runs one chat turn for an agent. The browser never calls Claude
// directly — this route holds the only path to agentEngine.ts.

import { NextResponse } from "next/server";
import { runAgentTurn } from "@/lib/agentEngine";

interface RouteParams {
  params: Promise<{ agentName: string }>;
}

/** Handles POST /api/agents/[agentName]/chat. Expects { programmeId, message }. */
export async function POST(request: Request, { params }: RouteParams) {
  const { agentName } = await params;
  const body = (await request.json()) as { programmeId?: string; message?: string };

  if (!body.programmeId || !body.message) {
    return NextResponse.json({ error: "'programmeId' and 'message' are required." }, { status: 400 });
  }

  try {
    const result = await runAgentTurn(body.programmeId, agentName, body.message);

    if (result.blocked) {
      return NextResponse.json({ error: result.reason ?? "This agent is not available." }, { status: 403 });
    }

    return NextResponse.json({ reply: result.reply, recordedArtefacts: result.recordedArtefacts });
  } catch (error) {
    console.error(`Agent chat failed for "${agentName}":`, error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to get a response. Please try again." }, { status: 502 });
  }
}
