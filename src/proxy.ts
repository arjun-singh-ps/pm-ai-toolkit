// Gates every request behind a valid Supabase session, except the public
// auth pages. Pages get redirected to /login; API routes get a 401.
//
// This is the app's actual access-control mechanism (not the RLS policies
// in supabase/migrations/0002_enable_rls.sql, which are a backstop for
// direct anon-key REST access, not for this app's own routes).

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() revalidates against Supabase rather than just trusting the
  // cookie's JWT — required for this to be a real auth check, not a
  // spoofable one.
  const { data } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(data.user);

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!isAuthenticated && !isPublicPath) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    // Carry over any refreshed session cookies — constructing a new
    // NextResponse for the redirect loses them otherwise.
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
