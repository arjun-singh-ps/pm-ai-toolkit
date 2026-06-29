// Handles the redirect from a clicked email-confirmation link: exchanges
// the code for a session, then sends the user into the app.

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/** Handles GET /auth/callback?code=... */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
