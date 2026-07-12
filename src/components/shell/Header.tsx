// Centre panel header: breadcrumb, quick links, and cross-cutting agent buttons.
// Monzo-style: clean white bar, coral active accents, pill-shaped agent buttons.

import Link from "next/link";
import type { Programme } from "@/types/programme";

interface HeaderProps {
  programme: Programme;
}

/** Programme intelligence agents — contextual advisers and monitors. */
const INTELLIGENCE_LINKS: { label: string; agentName: string }[] = [
  { label: "Navigator", agentName: "orchestrator" },
  { label: "Persona Guide", agentName: "persona-selector" },
  { label: "Artefact State", agentName: "artefact-state" },
  { label: "KPI Monitor", agentName: "kpi-monitor" },
  { label: "AI Safety Review", agentName: "responsible-ai" },
];

/** Delivery output agents — produce governed, structured deliverables. */
const OUTPUT_LINKS: { label: string; agentName: string }[] = [
  { label: "Governance Guardian", agentName: "governance-guardian" },
  { label: "Cost Compass", agentName: "cost-compass" },
  { label: "Roadmap Architect", agentName: "roadmap-architect" },
  { label: "Comms Architect", agentName: "comms-architect" },
];

/** Desktop header: breadcrumb + History/KPIs links + cross-cutting agent pill buttons in two rows. */
export function Header({ programme }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 py-2"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
          {programme.name}
        </p>
        <span style={{ color: "var(--border)" }}>·</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
          style={{ background: "var(--bg)", color: "var(--text-secondary)" }}
        >
          {programme.active_phase}
        </span>
        <Link
          href={`/programme/${programme.id}/history`}
          className="text-xs transition-opacity hover:opacity-100"
          style={{ color: "var(--text-muted)" }}
        >
          History
        </Link>
        <Link
          href={`/programme/${programme.id}/kpis`}
          className="text-xs transition-opacity hover:opacity-100"
          style={{ color: "var(--text-muted)" }}
        >
          KPIs
        </Link>
      </div>

      {/* Right: cross-cutting agent buttons — two rows */}
      <div className="flex flex-col items-end gap-1">
        {/* Row 1: programme intelligence (grey) */}
        <div className="flex flex-wrap justify-end gap-1">
          {INTELLIGENCE_LINKS.map(({ label, agentName }) => (
            <Link
              key={agentName}
              href={`/programme/${programme.id}/agents/${agentName}`}
              className="rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: "var(--bg)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Row 2: delivery outputs (coral) */}
        <div className="flex flex-wrap justify-end gap-1">
          {OUTPUT_LINKS.map(({ label, agentName }) => (
            <Link
              key={agentName}
              href={`/programme/${programme.id}/agents/${agentName}`}
              className="rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: "var(--coral-light)",
                color: "var(--coral)",
                border: "1px solid transparent",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
