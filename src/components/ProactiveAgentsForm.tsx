// Lets the user set individual monitoring agents to proactive mode per programme.
// Proactive mode persists the user's intent and surfaces a sidebar badge.
// The scheduled trigger that will make agents run automatically is future
// infrastructure — this toggle is the configuration surface for when it arrives.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MONITORING_AGENTS } from "@/lib/constants";

interface ProactiveAgentsFormProps {
  programmeId: string;
  initialProactiveAgents: string[];
}

/** Toggle rows for setting monitoring agents to reactive or proactive mode, persisted via PATCH. */
export function ProactiveAgentsForm({ programmeId, initialProactiveAgents }: ProactiveAgentsFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialProactiveAgents);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleToggle(agentName: string) {
    setSelected((current) =>
      current.includes(agentName)
        ? current.filter((n) => n !== agentName)
        : [...current, agentName]
    );
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/programmes/${programmeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proactive_agents: selected }),
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
          Agent mode
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Proactive agents have a ⚡ badge reminding you to open them for the latest programme assessment. Full automatic scheduling is coming.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {MONITORING_AGENTS.map(({ name, displayName, built }) => {
          const isProactive = selected.includes(name);
          return (
            <div
              key={name}
              className="flex items-center justify-between rounded-xl px-3 py-3"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                opacity: built ? 1 : 0.5,
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                  {displayName}
                  {!built && (
                    <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                      coming soon
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: isProactive ? "var(--coral)" : "var(--text-muted)" }}>
                  {isProactive ? "⚡ Proactive" : "Reactive"}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                disabled={!built}
                onClick={() => handleToggle(name)}
                className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed"
                style={{ background: isProactive ? "var(--coral)" : "var(--border)" }}
                aria-pressed={isProactive}
                aria-label={`Set ${displayName} to ${isProactive ? "reactive" : "proactive"} mode`}
              >
                <span
                  className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: isProactive ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--coral)" }}
        >
          {isSaving ? "Saving…" : "Save agent mode"}
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
