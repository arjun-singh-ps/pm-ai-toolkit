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
        // Archiving — leave this programme's page.
        router.push("/");
      } else {
        // Unarchiving — refresh the current page.
        router.refresh();
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mx-8 mt-8">
      <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
        {archived ? "Archived programme" : "Archive programme"}
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {archived
          ? "This programme is archived. All artefacts and history are preserved. Unarchive to make it active again."
          : "Move this programme to the archive. All artefacts, sessions, and alerts are preserved — nothing is deleted."}
      </p>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="mt-3 rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:border-black/20 hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-white/5"
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
  );
}
