-- Agent alerts: proactive insight cards surfaced on the programme home screen.
-- Each row is one flag from a monitoring agent — what changed, why it matters,
-- and the suggested next action. Dismissed alerts are kept for the audit log;
-- only 'active' ones are shown in the UI.
-- Run in: Project → SQL Editor → New query → paste → Run.

create table agent_alerts (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references programmes(id) on delete cascade,
  agent_name text not null,
  what text not null,
  why_matters text[] not null,
  suggested_action text not null,
  triggered_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'dismissed')),
  dismissed_at timestamptz,
  dismissed_by text,
  dismiss_reason text check (
    dismiss_reason in ('not_relevant', 'already_handled', 'monitor_next_sprint')
  )
);

create index idx_agent_alerts_programme_status
  on agent_alerts(programme_id, status);

alter table agent_alerts enable row level security;
create policy "authenticated full access" on agent_alerts
  for all to authenticated using (true) with check (true);
