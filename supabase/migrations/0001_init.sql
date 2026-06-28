-- Initial schema for the GenAI Delivery Copilot.
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query -> paste -> Run).
-- RLS is intentionally disabled on every table: there is no auth yet, and all
-- access goes through the Next.js server using the service-role key.

create table programmes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client text,
  persona text not null check (persona in ('legacy', 'agentic')),
  active_phase text not null,
  regulatory_frameworks text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table artefacts (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references programmes(id) on delete cascade,
  artefact_name text not null,
  phase text not null,
  activity text not null,
  agent_name text not null,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'approved')),
  content jsonb not null default '{}',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by text
);

create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references programmes(id) on delete cascade,
  agent_name text not null,
  phase text not null,
  activity text not null,
  messages jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references programmes(id) on delete cascade,
  persona text not null,
  lever_or_dimension text not null,
  metric_name text not null,
  value numeric not null,
  recorded_at timestamptz not null default now()
);

create table cost_records (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references programmes(id) on delete cascade,
  agent_name text not null,
  tokens_in integer not null,
  tokens_out integer not null,
  cost_usd numeric(10, 6) not null,
  artefact_id uuid references artefacts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_artefacts_programme on artefacts(programme_id);
create index idx_chat_sessions_programme_agent on chat_sessions(programme_id, agent_name);
create index idx_cost_records_programme on cost_records(programme_id);

alter table programmes disable row level security;
alter table artefacts disable row level security;
alter table chat_sessions disable row level security;
alter table kpi_snapshots disable row level security;
alter table cost_records disable row level security;
