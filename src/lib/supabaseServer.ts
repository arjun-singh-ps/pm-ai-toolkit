// Server-side Supabase client for Server Components and Route Handlers,
// backed by the request's cookie store. Uses the public anon/publishable
// key (the session cookie, not the key, is what proves identity) — never
// the service-role key. This is a different client instance from
// src/middleware.ts's, which has its own NextRequest/NextResponse cookie
// glue.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for the current request, reading/writing the
 * session cookie via next/headers. Call fresh per request — don't cache
 * the instance across requests.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Components can't set cookies; this throws there, which
          // is fine — session refresh happens in middleware instead.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — no-op, see comment above.
          }
        },
      },
    }
  );
}
