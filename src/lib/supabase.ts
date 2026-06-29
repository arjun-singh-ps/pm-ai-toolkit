// Server-only Supabase client. Never import this from a "use client" file —
// the service-role key bypasses Row Level Security and must stay server-side.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

/**
 * Returns the singleton service-role Supabase client used for all
 * server-side reads/writes. Service-role bypasses RLS by design — this is
 * the app's own access path, independent of the auth-gated RLS policies
 * that only matter for the publicly-shipped anon key.
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set. Add them to .env.local."
    );
  }

  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }

  return serviceClient;
}
