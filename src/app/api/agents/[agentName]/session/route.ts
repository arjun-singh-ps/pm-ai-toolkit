// API route: fetches the existing chat history for an agent, used to
// hydrate the chat UI on page load.

import { NextResponse } from "next/server";
import { getAgent } from "@/agents/registry";
import { loadOrCreateSession, toDisplayMessages } from "@/lib/chatSessions";

interface RouteParams {
  params: Promise<{ agentName: string }>;
}

/** Handles GET /api/agents/[agentName]/session?programmeId=... */
export async function GET(request: Request, { params }: RouteParams) {
  const { agentName } = await params;
  const programmeId = new URL(request.url).searchParams.get("programmeId");

  if (!programmeId) {
    return NextResponse.json({ error: "'programmeId' query parameter is required." }, { status: 400 });
  }

  const agent = getAgent(agentName);
  if (!agent) {
    return NextResponse.json({ error: `Unknown agent "${agentName}".` }, { status: 404 });
  }

  try {
    const session = await loadOrCreateSession(programmeId, agent);
    return NextResponse.json({ messages: toDisplayMessages(session.messages) });
  } catch (error) {
    console.error(`Failed to load session for "${agentName}":`, error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load chat history." }, { status: 500 });
  }
}
