// Server Action for signing out. A POST-only action (never a GET/link),
// so prefetching never triggers a logout.

"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/** Signs the current user out and redirects to /login. */
export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
