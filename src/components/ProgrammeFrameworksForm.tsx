// Lets the user add or remove regulatory frameworks from an existing programme.
// The PATCH /api/programmes/[id] route already accepts regulatory_frameworks —
// this is purely the UI that was missing.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGULATORY_FRAMEWORKS } from "@/lib/constants";

interface ProgrammeFrameworksFormProps {
  programmeId: string;
  initialFrameworks: string[];
}

/** Toggle pills for a programme's regulatory frameworks, persisted via PATCH. */
export function ProgrammeFrameworksForm({ programmeId, initialFrameworks }: ProgrammeFrameworksFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialFrameworks);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleToggle(framework: string) {
    setSelected((current) =>
      current.includes(framework)
        ? current.filter((f) => f !== framework)
        : [...current, framework]
    );
  }

  /** Persists the updated framework list and revalidates agent context. */
  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/programmes/${programmeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regulatory_frameworks: selected }),
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
    <form onSubmit={handleSave} className="flex flex-col gap-3 p-6 pt-0">
      <div>
        <h2 className="font-semibold" style={{ color: "var(--navy)" }}>
          Regulatory frameworks
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Governance Guardian reviews artefacts against these frameworks — changes take effect on the next conversation turn.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {REGULATORY_FRAMEWORKS.map((framework) => (
          <label
            key={framework}
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={
              selected.includes(framework)
                ? { background: "var(--coral)", color: "#fff" }
                : {
                    background: "var(--bg)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            <input
              type="checkbox"
              checked={selected.includes(framework)}
              onChange={() => handleToggle(framework)}
              className="sr-only"
            />
            {framework}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--coral)" }}
        >
          {isSaving ? "Saving…" : "Save frameworks"}
        </button>
        {savedAt && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Saved at {savedAt}
          </p>
        )}
      </div>
    </form>
  );
}
