-- MCP (Model Context Protocol) integrations table.
-- Stores server connection details that are injected into every agent's API call,
-- giving Claude live access to Jira, Confluence, SharePoint, or any custom MCP server.
-- Auth tokens are stored as plain text for the MVP — encrypt at rest before production use.
-- Shared workspace: one set of integrations available to all programmes and all users.
-- Run this in Supabase SQL Editor after 0002_enable_rls.sql.

create table mcp_integrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('jira', 'confluence', 'sharepoint', 'custom')),
  server_url text not null,
  auth_token text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table mcp_integrations enable row level security;

create policy "authenticated full access" on mcp_integrations
  to authenticated
  using (true)
  with check (true);
