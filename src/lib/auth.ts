// Server-only helper for reading the current user's identity inside Route
// Handlers and Server Components. Uses getUser(), not getSession() — the
// latter only reads the unverified JWT from the cookie, while getUser()
// revalidates it against Supabase. Middleware already gates whether a
// request is authenticated at all; this is for routes that need to know
// WHO is acting (e.g. to record an artefact's owner or approver).

import { createSupabaseServerClient } from "@/lib/supabaseServer";

/** Returns the current user's email, or null if no valid session exists. */
export async function getCurrentUserEmail(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) {
    return null;
  }

  return data.user.email;
}
