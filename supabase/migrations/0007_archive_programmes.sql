-- Soft-delete for programmes. Archived programmes are hidden from the active list
-- but their data (artefacts, chat sessions, alerts) is preserved.

alter table programmes
  add column if not exists archived boolean not null default false;

create index idx_programmes_archived on programmes(archived);
