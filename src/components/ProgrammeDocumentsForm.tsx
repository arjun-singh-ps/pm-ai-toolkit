// Programme documents: upload Excel, PDF, or Word files so agents can use
// their content as source material. Delivery Intelligence uses these to
// pre-populate the RAID Register. All agents receive uploaded documents
// as part of their welcome briefing context.
//
// Files are parsed server-side; only the extracted text is stored.

"use client";

import { useEffect, useRef, useState } from "react";
import type { ProgrammeDocument } from "@/types/programmeDocument";

interface ProgrammeDocumentsFormProps {
  programmeId: string;
}

const ACCEPT = ".pdf,.xlsx,.xls,.docx,.doc";

/** Upload panel for programme documents — used by Delivery Intelligence for RAID context. */
export function ProgrammeDocumentsForm({ programmeId }: ProgrammeDocumentsFormProps) {
  const [documents, setDocuments] = useState<ProgrammeDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/documents?programmeId=${programmeId}`);
      const data = await res.json();
      setDocuments(data.documents ?? []);
    }
    void load();
  }, [programmeId]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("programmeId", programmeId);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }

      setDocuments((current) => [...current, data.document as ProgrammeDocument]);
    } catch {
      setUploadError("Could not reach the server. Check your connection.");
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be re-uploaded if needed.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((current) => current.filter((d) => d.id !== id));
    }
  }

  return (
    <div className="mx-8 mt-8">
      <h2 className="text-sm font-semibold text-black dark:text-zinc-50">Programme Documents</h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Upload Excel, PDF, or Word files (existing RAID logs, risk registers, project docs).
        Delivery Intelligence uses these when building the RAID Register. All agents can reference
        them.
      </p>

      <div className="mt-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            className="sr-only"
            disabled={isUploading}
          />
          {isUploading ? "Uploading…" : "Upload file"}
        </label>
        <span className="ml-3 text-xs text-zinc-400 dark:text-zinc-500">
          PDF, Excel (.xlsx/.xls), Word (.docx/.doc)
        </span>
      </div>

      {uploadError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{uploadError}</p>
      )}

      {documents.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-zinc-900"
            >
              <div>
                <p className="text-sm font-medium text-black dark:text-zinc-50">{doc.filename}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {doc.file_type.toUpperCase()} ·{" "}
                  {Math.round(doc.content_text.length / 1000)}k chars extracted ·{" "}
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(doc.id)}
                className="ml-4 text-xs text-zinc-400 transition-colors hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
