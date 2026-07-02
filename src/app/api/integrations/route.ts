// GET /api/integrations — list all MCP integrations
// POST /api/integrations — create a new MCP integration

import { NextResponse } from "next/server";
import { getCurrentUserEmail } from "@/lib/auth";
import { listIntegrations, createIntegration } from "@/lib/integrations";
import type { McpIntegrationType } from "@/types/mcpIntegration";

const VALID_TYPES: McpIntegrationType[] = ["jira", "confluence", "sharepoint", "custom"];

/** Lists all configured MCP integrations. */
export async function GET() {
  const userEmail = await getCurrentUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const integrations = await listIntegrations();
    return NextResponse.json({ integrations });
  } catch (err) {
    console.error("Failed to list integrations:", err);
    return NextResponse.json({ error: "Failed to load integrations." }, { status: 500 });
  }
}

/** Creates a new MCP integration. */
export async function POST(request: Request) {
  const userEmail = await getCurrentUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    type?: string;
    server_url?: string;
    auth_token?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }
  if (!body.type || !VALID_TYPES.includes(body.type as McpIntegrationType)) {
    return NextResponse.json({ error: `type must be one of: ${VALID_TYPES.join(", ")}.` }, { status: 400 });
  }
  if (!body.server_url?.trim()) {
    return NextResponse.json({ error: "server_url is required." }, { status: 400 });
  }

  try {
    const integration = await createIntegration({
      name: body.name.trim(),
      type: body.type as McpIntegrationType,
      server_url: body.server_url.trim(),
      auth_token: body.auth_token?.trim() || null,
    });
    return NextResponse.json({ integration }, { status: 201 });
  } catch (err) {
    console.error("Failed to create integration:", err);
    return NextResponse.json({ error: "Failed to create integration." }, { status: 500 });
  }
}
