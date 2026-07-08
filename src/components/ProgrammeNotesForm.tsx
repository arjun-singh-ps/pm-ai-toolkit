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
    <form onSubmit={handleSave} className="flex flex-col gap-3 p-6">
      <div>
        <h2 className="font-semibold" style={{ color: "var(--navy)" }}>
          Programme notes
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Background context shared with every agent — methodology, regulatory environment, delivery phase. You don&apos;t need to repeat this in every conversation.
        </p>
      </div>
      <textarea
        rows={5}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="e.g. Agile delivery, regulated UK retail banking environment, mid-implementation phase."
        className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          color: "var(--navy)",
        }}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--coral)" }}
        >
          {isSaving ? "Saving…" : "Save notes"}
        </button>
        {savedAt && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Saved at {savedAt}
          </p>
        )}
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Select an agent from the sidebar to begin a conversation.
      </p>
    </form>
  );
}
