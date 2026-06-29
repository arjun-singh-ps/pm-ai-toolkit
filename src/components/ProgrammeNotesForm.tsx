// Lets the user set programme-level notes once, reused as context across
// every agent's system prompt for this programme — the per-programme
// successor to the old global, localStorage-based "project context".

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProgrammeNotesFormProps {
  programmeId: string;
  initialNotes: string;
}

/** Editable notes field, persisted to the programmes table. */
export function ProgrammeNotesForm({ programmeId, initialNotes }: ProgrammeNotesFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  /** Persists the notes and revalidates server-rendered context (every agent reads this on its next turn). */
  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/programmes/${programmeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (response.ok) {
        setSavedAt(new Date().toLocaleString());
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex max-w-xl flex-col gap-3 p-8">
      <h2 className="text-lg font-medium text-black dark:text-zinc-50">Programme Notes</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Background context (methodology, regulatory environment, delivery phase) shared with every
        agent in this programme, so you don&apos;t need to repeat it in every conversation.
      </p>
      <textarea
        rows={6}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="e.g. Agile delivery, regulated UK retail banking environment, mid-implementation phase."
        className="rounded-md border border-black/10 bg-white p-3 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {isSaving ? "Saving..." : "Save notes"}
      </button>
      {savedAt && <p className="text-sm text-zinc-500">Saved at {savedAt}</p>}
      <p className="mt-4 text-sm text-zinc-400">Select an agent from the sidebar to begin a conversation.</p>
    </form>
  );
}
