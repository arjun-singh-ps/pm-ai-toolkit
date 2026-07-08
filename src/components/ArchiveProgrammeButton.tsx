// Archive / unarchive a programme. Archived programmes are hidden from the
// active list but all data (artefacts, sessions, alerts) is preserved.
// Archiving does not delete anything — it is a soft-removal only.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ArchiveProgrammeButtonProps {
  programmeId: string;
  archived: boolean;
}

/** Archive or unarchive a programme with a single click. Navigates to home on archive. */
export function ArchiveProgrammeButton({ programmeId, archived }: ArchiveProgrammeButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/programmes/${programmeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !archived }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update programme.");
        return;
      }

      if (!archived) {
        router.push("/");
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="p-6 pt-0">
      <div
        className="rounded-xl px-4 py-4"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
        }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
          {archived ? "Archived programme" : "Archive programme"}
        </h2>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {archived
            ? "This programme is archived. All artefacts and history are preserved. Unarchive to make it active again."
            : "Move this programme to the archive. All artefacts, sessions, and alerts are preserved — nothing is deleted."}
        </p>

        {error && (
          <p className="mt-2 text-xs" style={{ color: "#B91C1C" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="mt-3 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:opacity-80 disabled:opacity-40"
          style={{
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            background: "var(--surface)",
          }}
        >
          {isPending
            ? archived
              ? "Unarchiving…"
              : "Archiving…"
            : archived
              ? "Unarchive programme"
              : "Archive programme"}
        </button>
      </div>
    </div>
  );
}
