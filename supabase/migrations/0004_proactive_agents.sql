-- Adds proactive_agents to programmes: the agent names the user has opted into
-- proactive monitoring mode for this programme.
-- Run in the Supabase SQL Editor: Project → SQL Editor → New query → paste → Run.

alter table programmes
  add column if not exists proactive_agents text[] not null default '{}';
