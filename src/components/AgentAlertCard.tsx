// Insight card for one proactive agent alert. Renders the three-part structure
// (what / why it matters / suggested action) with three dismiss reasons and a
// direct link to the agent with alert context pre-loaded.
//
// Design rule: the card must answer "why should I act on this right now?" in
// under 10 seconds. If it can't, the PM will re-verify manually — defeating
// the point of the automation.

"use client";

import { useState } from "react";
import Link from "next/link";
import type { AgentAlert, DismissReason } from "@/types/agentAlert";
import { DISMISS_REASON_LABELS } from "@/types/agentAlert";
import { MONITORING_AGENTS } from "@/lib/constants";

interface AgentAlertCardProps {
  alert: AgentAlert;
  programmeId: string;
  onDismissed: (id: string) => void;
}

const DISMISS_REASONS: DismissReason[] = [
  "not_relevant",
  "already_handled",
  "monitor_next_sprint",
];

/** Returns the display name for the agent that generated the alert. */
function agentDisplayName(agentName: string): string {
  return MONITORING_AGENTS.find((a) => a.name === agentName)?.displayName ?? agentName;
}

/** How long ago an ISO timestamp was, as a human-readable string. */
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

/** Proactive insight card: what / why it matters / suggested action + dismiss controls. */
export function AgentAlertCard({ alert, programmeId, onDismissed }: AgentAlertCardProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  async function handleDismiss(reason: DismissReason) {
    setIsDismissing(true);
    try {
      const response = await fetch(`/api/alerts/${alert.id}/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        onDismissed(alert.id);
      }
    } finally {
      setIsDismissing(false);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          ⚡ {agentDisplayName(alert.agent_name)}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{timeAgo(alert.triggered_at)}</p>
      </div>

      {/* What */}
      <p className="mt-2 text-sm font-medium text-black dark:text-zinc-50">{alert.what}</p>

      {/* Why it matters */}
      <ul className="mt-2 flex flex-col gap-1">
        {alert.why_matters.map((bullet, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="mt-0.5 flex-shrink-0 text-zinc-400">·</span>
            {bullet}
          </li>
        ))}
      </ul>

      {/* Suggested action */}
      <div className="mt-3 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Suggested action</p>
        <p className="mt-0.5 text-sm text-black dark:text-zinc-50">{alert.suggested_action}</p>
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap gap-2">
        {DISMISS_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            disabled={isDismissing}
            onClick={() => handleDismiss(reason)}
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5"
          >
            {DISMISS_REASON_LABELS[reason]}
          </button>
        ))}

        <Link
          href={`/programme/${programmeId}/agents/${alert.agent_name}?alertId=${alert.id}`}
          className="ml-auto rounded-full border border-black/20 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-black/5 dark:border-white/20 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          Open {agentDisplayName(alert.agent_name)} →
        </Link>
      </div>
    </div>
  );
}
