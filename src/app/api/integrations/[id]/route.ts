// PATCH /api/integrations/[id] — toggle enabled state
// DELETE /api/integrations/[id] — remove an integration

import { NextResponse } from "next/server";
import { getCurrentUserEmail } from "@/lib/auth";
import { setIntegrationEnabled, deleteIntegration } from "@/lib/integrations";

/** Toggles an integration's enabled state. Body: { enabled: boolean } */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userEmail = await getCurrentUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { enabled?: boolean };

  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled (boolean) is required." }, { status: 400 });
  }

  try {
    const integration = await setIntegrationEnabled(id, body.enabled);
    return NextResponse.json({ integration });
  } catch (err) {
    console.error("Failed to update integration:", err);
    return NextResponse.json({ error: "Failed to update integration." }, { status: 500 });
  }
}

/** Deletes an integration permanently. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userEmail = await getCurrentUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteIntegration(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete integration:", err);
    return NextResponse.json({ error: "Failed to delete integration." }, { status: 500 });
  }
}
