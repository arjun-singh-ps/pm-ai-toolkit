// Type for a row in the programme_documents table.
// Stores extracted plain text from PM-uploaded files (Excel, PDF, DOCX).

export type DocumentFileType = "pdf" | "xlsx" | "xls" | "docx" | "doc";

export interface ProgrammeDocument {
  id: string;
  programme_id: string;
  filename: string;
  file_type: DocumentFileType;
  content_text: string;
  uploaded_by: string;
  created_at: string;
}
