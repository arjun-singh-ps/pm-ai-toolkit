// Insight card for one proactive agent alert. Renders the three-part structure
// (what / why it matters / suggested action) with dismiss reasons and a
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
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: "var(--coral-light)", color: "var(--coral)" }}
        >
          ⚡ {agentDisplayName(alert.agent_name)}
        </span>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {timeAgo(alert.triggered_at)}
        </p>
      </div>

      {/* What */}
      <p className="mt-2.5 text-sm font-semibold leading-snug" style={{ color: "var(--navy)" }}>
        {alert.what}
      </p>

      {/* Why it matters */}
      <ul className="mt-2 flex flex-col gap-1">
        {alert.why_matters.map((bullet, i) => (
          <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--coral)" }}>·</span>
            {bullet}
          </li>
        ))}
      </ul>

      {/* Suggested action */}
      <div
        className="mt-3 rounded-xl px-3 py-2.5"
        style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Suggested action
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--navy)" }}>
          {alert.suggested_action}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {DISMISS_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            disabled={isDismissing}
            onClick={() => handleDismiss(reason)}
            className="rounded-full px-3 py-1 text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40"
            style={{
              background: "var(--bg)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {DISMISS_REASON_LABELS[reason]}
          </button>
        ))}

        <Link
          href={`/programme/${programmeId}/agents/${alert.agent_name}?alertId=${alert.id}`}
          className="ml-auto rounded-full px-3 py-1 text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: "var(--coral)", color: "#fff" }}
        >
          Open agent →
        </Link>
      </div>
    </div>
  );
}
