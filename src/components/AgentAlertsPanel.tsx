// Client component: fetches and displays active proactive alerts for a programme.
// Renders nothing when there are no active alerts — no empty state, no chrome.
// After dismiss, the card disappears optimistically without a page reload.

"use client";

import { useEffect, useState } from "react";
import { AgentAlertCard } from "@/components/AgentAlertCard";
import type { AgentAlert } from "@/types/agentAlert";

interface AgentAlertsPanelProps {
  programmeId: string;
}

/** Shows all active proactive alerts. Disappears entirely when there are none. */
export function AgentAlertsPanel({ programmeId }: AgentAlertsPanelProps) {
  const [alerts, setAlerts] = useState<AgentAlert[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/alerts?programmeId=${programmeId}`);
        const data = await response.json();
        setAlerts(data.alerts ?? []);
      } finally {
        setIsLoaded(true);
      }
    }
    void load();
  }, [programmeId]);

  function handleDismissed(id: string) {
    setAlerts((current) => current.filter((a) => a.id !== id));
  }

  // Nothing to show — don't render empty chrome.
  if (!isLoaded || alerts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-8 pb-0">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        ⚡ Proactive alerts
      </h2>
      {alerts.map((alert) => (
        <AgentAlertCard
          key={alert.id}
          alert={alert}
          programmeId={programmeId}
          onDismissed={handleDismissed}
        />
      ))}
    </div>
  );
}
