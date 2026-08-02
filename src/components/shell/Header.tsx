// Centre panel header — two-tier layout.
// Tier 1: programme identity + primary navigation.
// Tier 2: cross-cutting agent toolbar in two labelled rows.
// Revolut-influenced: text-based links, precise spacing, ALL-CAPS group labels,
// dot separators, a single accent used sparingly.

import Link from "next/link";
import type { Programme } from "@/types/programme";

interface HeaderProps {
  programme: Programme;
}

const INTELLIGENCE_LINKS: { label: string; agentName: string }[] = [
  { label: "Navigator", agentName: "orchestrator" },
  { label: "Persona Guide", agentName: "persona-selector" },
  { label: "Artefact State", agentName: "artefact-state" },
  { label: "KPI Monitor", agentName: "kpi-monitor" },
  { label: "AI Safety Review", agentName: "responsible-ai" },
];

const OUTPUT_LINKS: { label: string; agentName: string }[] = [
  { label: "Governance Guardian", agentName: "governance-guardian" },
  { label: "Cost Compass", agentName: "cost-compass" },
  { label: "Roadmap Architect", agentName: "roadmap-architect" },
  { label: "Comms Architect", agentName: "comms-architect" },
];

export function Header({ programme }: HeaderProps) {
  const personaAccent = programme.persona === "legacy" ? "var(--coral)" : "#7C3AED";

  return (
    <>
      <style>{`
        .hdr-nav-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          letter-spacing: -0.01em;
          transition: color 0.12s;
          white-space: nowrap;
        }
        .hdr-nav-link:hover { color: var(--navy); }

        .hdr-group-label {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          min-width: 62px;
          flex-shrink: 0;
        }

        .hdr-sep {
          font-size: 11px;
          color: var(--border);
          padding: 0 5px;
          user-select: none;
          flex-shrink: 0;
        }

        .hdr-agent {
          font-size: 12px;
          font-weight: 500;
          padding: 2px 7px;
          border-radius: 5px;
          transition: background 0.12s, color 0.12s;
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .hdr-agent-grey {
          color: var(--text-secondary);
        }
        .hdr-agent-grey:hover {
          color: var(--navy);
          background: var(--bg);
        }
        .hdr-agent-coral {
          color: var(--coral);
          opacity: 0.9;
        }
        .hdr-agent-coral:hover {
          opacity: 1;
          background: var(--coral-light);
        }
      `}</style>

      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* ── Tier 1: programme identity + nav ── */}
        <div
          className="flex items-center justify-between px-5"
          style={{ height: "44px" }}
        >
          {/* Left: persona dot + name + phase chip */}
          <div className="flex items-center gap-2 min-w-0">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: personaAccent,
                flexShrink: 0,
              }}
            />
            <span
              className="text-sm font-semibold truncate"
              style={{ color: "var(--navy)", letterSpacing: "-0.02em", maxWidth: 220 }}
            >
              {programme.name}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--text-muted)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "1px 7px",
                flexShrink: 0,
              }}
            >
              {programme.active_phase}
            </span>
          </div>

          {/* Right: primary navigation */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <Link
              href={`/programme/${programme.id}/roadmap`}
              className="hdr-nav-link"
            >
              Roadmap
            </Link>
            <span style={{ color: "var(--border)", fontSize: 12 }}>·</span>
            <Link
              href={`/programme/${programme.id}/history`}
              className="hdr-nav-link"
            >
              History
            </Link>
            <span style={{ color: "var(--border)", fontSize: 12 }}>·</span>
            <Link
              href={`/programme/${programme.id}/kpis`}
              className="hdr-nav-link"
            >
              KPIs
            </Link>
          </div>
        </div>

        {/* ── Tier 2: agent toolbar ── */}
        <div
          className="px-5"
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 6,
            paddingBottom: 7,
          }}
        >
          {/* Row 1 — advisers */}
          <div className="flex items-center" style={{ minHeight: 24 }}>
            <span className="hdr-group-label">Advisers</span>
            {INTELLIGENCE_LINKS.map(({ label, agentName }, i) => (
              <span key={agentName} className="flex items-center">
                {i > 0 && <span className="hdr-sep">·</span>}
                <Link
                  href={`/programme/${programme.id}/agents/${agentName}`}
                  className="hdr-agent hdr-agent-grey"
                >
                  {label}
                </Link>
              </span>
            ))}
          </div>

          {/* Row 2 — outputs */}
          <div className="flex items-center" style={{ minHeight: 24 }}>
            <span className="hdr-group-label">Outputs</span>
            {OUTPUT_LINKS.map(({ label, agentName }, i) => (
              <span key={agentName} className="flex items-center">
                {i > 0 && <span className="hdr-sep">·</span>}
                <Link
                  href={`/programme/${programme.id}/agents/${agentName}`}
                  className="hdr-agent hdr-agent-coral"
                >
                  {label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
