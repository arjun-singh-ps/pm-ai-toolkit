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
    <div className="flex flex-col gap-3 p-6">
      <div>
        <h2 className="font-semibold" style={{ color: "var(--navy)" }}>
          Programme documents
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Upload Excel, PDF, or Word files (existing RAID logs, risk registers, project docs). Delivery Intelligence uses these when building the RAID Register.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{
            background: isUploading ? "var(--border)" : "var(--coral)",
            pointerEvents: isUploading ? "none" : "auto",
          }}
        >
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
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          PDF, Excel, Word
        </span>
      </div>

      {uploadError && (
        <p className="text-xs" style={{ color: "#B91C1C" }}>
          {uploadError}
        </p>
      )}

      {documents.length > 0 && (
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: "var(--navy)" }}>
                  {doc.filename}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {doc.file_type.toUpperCase()} ·{" "}
                  {Math.round(doc.content_text.length / 1000)}k chars ·{" "}
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(doc.id)}
                className="ml-4 flex-shrink-0 text-xs transition-colors hover:opacity-60"
                style={{ color: "var(--text-muted)" }}
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
