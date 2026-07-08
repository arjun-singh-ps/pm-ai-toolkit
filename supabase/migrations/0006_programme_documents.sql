-- Stores extracted text from programme manager–uploaded files (Excel, PDF, DOCX).
-- The raw file is never stored here — only the parsed plain text for AI context injection.

create table programme_documents (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references programmes(id) on delete cascade,
  filename text not null,
  file_type text not null check (file_type in ('pdf', 'xlsx', 'xls', 'docx', 'doc')),
  content_text text not null,
  uploaded_by text not null,
  created_at timestamptz not null default now()
);

create index idx_programme_documents_programme on programme_documents(programme_id);
alter table programme_documents enable row level security;
create policy "authenticated full access" on programme_documents
  for all to authenticated using (true) with check (true);
