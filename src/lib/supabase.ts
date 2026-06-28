// Server-only Supabase client. Never import this from a "use client" file —
// the service-role key bypasses Row Level Security and must stay server-side.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

/**
 * Returns the singleton service-role Supabase client used for all
 * server-side reads/writes. RLS is disabled on every table this milestone,
 * so this is the only access path — never expose this key to the browser.
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set. Add them to .env.local.");
  }

  if (!serviceClient) {
    serviceClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }

  return serviceClient;
}
