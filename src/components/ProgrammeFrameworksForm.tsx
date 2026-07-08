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

/** Checkbox editor for a programme's regulatory frameworks, persisted via PATCH. */
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
    <form onSubmit={handleSave} className="flex max-w-xl flex-col gap-3 p-8 pt-0">
      <h2 className="text-lg font-medium text-black dark:text-zinc-50">Regulatory Frameworks</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Select the frameworks in scope for this programme. Governance Guardian uses these to
        review your artefacts — changes take effect on the next conversation turn.
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {REGULATORY_FRAMEWORKS.map((framework) => (
          <label key={framework} className="flex cursor-pointer items-center gap-2 text-sm text-black dark:text-zinc-50">
            <input
              type="checkbox"
              checked={selected.includes(framework)}
              onChange={() => handleToggle(framework)}
              className="rounded border-black/20 dark:border-white/20"
            />
            {framework}
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {isSaving ? "Saving..." : "Save frameworks"}
      </button>
      {savedAt && <p className="text-sm text-zinc-500">Saved at {savedAt}</p>}
    </form>
  );
}
