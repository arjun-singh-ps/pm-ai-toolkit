-- Enables Row Level Security now that NEXT_PUBLIC_SUPABASE_ANON_KEY is
-- shipped to the browser for Supabase Auth. Run this in the Supabase SQL
-- Editor the same way as 0001_init.sql.
--
-- IMPORTANT: this product is a shared team workspace by design — any
-- authenticated user can see and act on every programme, with no per-user
-- isolation. The policies below are deliberately a rubber stamp ("logged
-- in => full access"). They exist ONLY as a backstop against someone using
-- the public anon/publishable key to call Supabase's REST API directly,
-- bypassing this app's own Next.js routes entirely. They are NOT this
-- app's access-control mechanism — that's the session check in
-- src/middleware.ts and src/lib/auth.ts. A future "add per-user
-- permissions" effort must not assume RLS is already wired for that; it
-- isn't. The app's own server code uses the service-role key everywhere
-- (src/lib/supabase.ts), which bypasses RLS by design regardless of these
-- policies.
--
-- No explicit anon-deny policy is needed: enabling RLS with zero policies
-- for a role denies that role by default.

alter table programmes enable row level security;
alter table artefacts enable row level security;
alter table chat_sessions enable row level security;
alter table kpi_snapshots enable row level security;
alter table cost_records enable row level security;

create policy "authenticated_full_access" on programmes
  as permissive for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on artefacts
  as permissive for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on chat_sessions
  as permissive for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on kpi_snapshots
  as permissive for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on cost_records
  as permissive for all to authenticated using (true) with check (true);
