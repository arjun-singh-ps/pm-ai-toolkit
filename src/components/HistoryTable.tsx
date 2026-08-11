// Client-side filter/search over a programme's full artefact history.

"use client";

import { useState } from "react";
import type { Artefact, ArtefactStatus } from "@/types/artefact";
import { downloadArtefactAsDocx } from "@/lib/artefactDocx";

const STATUS_OPTIONS: (ArtefactStatus | "all")[] = ["all", "draft", "in_progress", "approved"];

/** Filters and searches the given artefact list entirely client-side (the list is already loaded). */
export function HistoryTable({ artefacts }: { artefacts: Artefact[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArtefactStatus | "all">("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(artefact: Artefact) {
    setDownloadingId(artefact.id);
    try {
      await downloadArtefactAsDocx(artefact);
    } catch {
      // The button reverts to "Download" on failure — the user can just retry.
    } finally {
      setDownloadingId(null);
    }
  }

  const filtered = artefacts.filter((artefact) => {
    const matchesSearch = artefact.artefact_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || artefact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by artefact name..."
          className="flex-1 rounded-md border border-black/10 bg-white p-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ArtefactStatus | "all")}
          className="rounded-md border border-black/10 bg-white p-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All statuses" : option}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No artefacts match.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-zinc-400 dark:border-white/10">
              <th className="py-2">Artefact</th>
              <th className="py-2">Agent</th>
              <th className="py-2">Version</th>
              <th className="py-2">Status</th>
              <th className="py-2">Created</th>
              <th className="py-2">Approved</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((artefact) => (
              <tr key={artefact.id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 text-black dark:text-zinc-50">{artefact.artefact_name}</td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">{artefact.agent_name}</td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">v{artefact.version}</td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">{artefact.status}</td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">
                  {new Date(artefact.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">
                  {artefact.approved_at ? new Date(artefact.approved_at).toLocaleDateString() : "—"}
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleDownload(artefact)}
                    disabled={downloadingId === artefact.id}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
                  >
                    {downloadingId === artefact.id ? "Preparing..." : "Download .docx"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
