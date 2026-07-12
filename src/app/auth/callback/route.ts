// Handles the redirect from a clicked email-confirmation link: exchanges
// the code for a session, then sends the user into the app.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/** Handles GET /auth/callback?code=... */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Cloud Run terminates TLS and proxies to the container on 0.0.0.0:8080,
  // so request.url contains the internal address. x-forwarded-host holds
  // the real public hostname set by Cloud Run's load balancer.
  const headersList = await headers();
  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedProto = headersList.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin);

  return NextResponse.redirect(`${origin}/`);
}
