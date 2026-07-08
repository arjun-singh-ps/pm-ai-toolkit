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

/** Toggle UI for setting monitoring agents to reactive or proactive mode, persisted via PATCH. */
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
    <form onSubmit={handleSave} className="flex max-w-xl flex-col gap-3 p-8 pt-0">
      <h2 className="text-lg font-medium text-black dark:text-zinc-50">Agent Mode</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Set monitoring agents to <strong>proactive</strong> mode. A proactive agent has a ⚡ badge
        in the sidebar reminding you to open it for its latest programme assessment. The full
        scheduled trigger — where the agent checks your programme automatically without you opening
        it — is coming infrastructure.
      </p>

      <div className="flex flex-col gap-3">
        {MONITORING_AGENTS.map(({ name, displayName, built }) => {
          const isProactive = selected.includes(name);
          return (
            <div
              key={name}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                built
                  ? "border-black/10 dark:border-white/10"
                  : "border-black/5 opacity-50 dark:border-white/5"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-black dark:text-zinc-50">
                  {displayName}
                  {!built && (
                    <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                      coming soon
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isProactive ? "⚡ Proactive — open to see assessment" : "Reactive — runs when you open it"}
                </p>
              </div>

              <button
                type="button"
                disabled={!built}
                onClick={() => handleToggle(name)}
                className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed ${
                  isProactive
                    ? "bg-black dark:bg-zinc-50"
                    : "bg-black/20 dark:bg-white/20"
                }`}
                aria-pressed={isProactive}
                aria-label={`Set ${displayName} to ${isProactive ? "reactive" : "proactive"} mode`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-zinc-900 ${
                    isProactive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {isSaving ? "Saving..." : "Save agent mode"}
      </button>
      {savedAt && <p className="text-sm text-zinc-500">Saved at {savedAt}</p>}
    </form>
  );
}
