// Data-access layer for the programme_documents table.
// Stores extracted text from PM-uploaded files so agents can use them as context.

import { getSupabaseServiceClient } from "@/lib/supabase";
import type { DocumentFileType, ProgrammeDocument } from "@/types/programmeDocument";

/** Returns all documents for a programme, oldest first (upload order matters for context). */
export async function listDocumentsForProgramme(programmeId: string): Promise<ProgrammeDocument[]> {
  const { data, error } = await getSupabaseServiceClient()
    .from("programme_documents")
    .select("*")
    .eq("programme_id", programmeId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to list documents: ${error.message}`);
  return data as ProgrammeDocument[];
}

/** Saves extracted text from an uploaded file. */
export async function createDocument(
  programmeId: string,
  filename: string,
  fileType: DocumentFileType,
  contentText: string,
  uploadedBy: string
): Promise<ProgrammeDocument> {
  const { data, error } = await getSupabaseServiceClient()
    .from("programme_documents")
    .insert({ programme_id: programmeId, filename, file_type: fileType, content_text: contentText, uploaded_by: uploadedBy })
    .select()
    .single();

  if (error) throw new Error(`Failed to save document: ${error.message}`);
  return data as ProgrammeDocument;
}

/** Deletes a document. The caller must verify the document belongs to the programme. */
export async function deleteDocument(id: string): Promise<void> {
  const { error } = await getSupabaseServiceClient()
    .from("programme_documents")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete document ${id}: ${error.message}`);
}
