// KPI dashboard: groups recorded snapshots by lever/dimension, shows the
// most recent value per metric with a trend arrow if historical data exists.
// Per-persona empty state explains which agents capture KPIs for this programme.

import { listKpiSnapshots } from "@/lib/kpiSnapshots";
import { getProgramme } from "@/lib/programmes";
import { notFound } from "next/navigation";
import type { KpiSnapshot } from "@/lib/kpiSnapshots";
import type { Persona } from "@/types/programme";

interface KpisPageProps {
  params: Promise<{ id: string }>;
}

// KPI levers per persona, with the agents that capture them.
const LEGACY_LEVERS = [
  {
    name: "Quality of Modernisation",
    agents: "Delivery Intelligence, Delivery Heartbeat",
    metrics: ["Code Coverage (%)", "Vulnerabilities", "Documentation Accuracy (%)"],
  },
  {
    name: "Pace of Modernisation",
    agents: "Signal Watch, Delivery Heartbeat",
    metrics: ["Code Conversion Outcomes", "Human-in-Loop Review Effort", "Context Enrichment Time", "Iterations to Accepted Output"],
  },
  {
    name: "AI Tool Upskill",
    agents: "Delivery Intelligence, Delivery Heartbeat",
    metrics: ["Time to Understand Tool Components", "Time to Understand Agent Outcomes"],
  },
];

const AGENTIC_DIMENSIONS = [
  {
    name: "AI and Engineering Impact",
    agents: "Performance Pulse",
    metrics: ["Accuracy", "Relevancy", "Faithfulness", "Latency (ms)"],
  },
  {
    name: "People Impact",
    agents: "Performance Pulse",
    metrics: ["Active Users", "Total Enrolled Users", "Prompts per Department", "Prompts per User"],
  },
  {
    name: "Financial Impact",
    agents: "Performance Pulse",
    metrics: ["Chassis Run Cost (USD)", "Pillar Run Cost (USD)", "Monthly Runtime Cost Projection (USD)", "Cost per 1,000 Prompts (USD)"],
  },
];

interface ProcessedMetric {
  name: string;
  value: number;
  previousValue: number | null;
  recordedAt: string;
}

interface ProcessedLever {
  name: string;
  metrics: ProcessedMetric[];
}

/** Groups snapshots by lever, de-duplicates to most recent per metric, extracts previous value for trend. */
function processSnapshots(snapshots: KpiSnapshot[]): ProcessedLever[] {
  // snapshots are ordered most recent first
  const byLever = new Map<string, Map<string, KpiSnapshot[]>>();

  for (const s of snapshots) {
    if (!byLever.has(s.lever_or_dimension)) {
      byLever.set(s.lever_or_dimension, new Map());
    }
    const byMetric = byLever.get(s.lever_or_dimension)!;
    if (!byMetric.has(s.metric_name)) {
      byMetric.set(s.metric_name, []);
    }
    byMetric.get(s.metric_name)!.push(s);
  }

  return [...byLever.entries()].map(([leverName, byMetric]) => ({
    name: leverName,
    metrics: [...byMetric.entries()].map(([metricName, entries]) => ({
      name: metricName,
      value: entries[0].value,
      previousValue: entries[1]?.value ?? null,
      recordedAt: entries[0].recorded_at,
    })),
  }));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TrendBadge({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) return null;
  const delta = current - previous;
  const pct = previous !== 0 ? Math.round(Math.abs(delta / previous) * 100) : null;
  const up = delta > 0;
  const neutral = delta === 0;

  if (neutral) return null;

  return (
    <span
      className="ml-1.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
      style={{
        background: up ? "#ECFDF5" : "#FEF2F2",
        color: up ? "var(--green)" : "#DC2626",
      }}
    >
      {up ? "▲" : "▼"} {pct !== null ? `${pct}%` : Math.abs(delta).toFixed(1)}
    </span>
  );
}

function MetricTile({ metric }: { metric: ProcessedMetric }) {
  return (
    <div
      className="flex flex-col justify-between rounded-2xl p-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>
        {metric.name}
      </p>
      <div className="mt-3">
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--navy)" }}>
            {metric.value % 1 === 0 ? metric.value.toLocaleString() : metric.value.toFixed(2)}
          </span>
          <TrendBadge current={metric.value} previous={metric.previousValue} />
        </div>
        <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
          Updated {formatDate(metric.recordedAt)}
        </p>
      </div>
    </div>
  );
}

function LeverCard({ lever }: { lever: ProcessedLever }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ background: "var(--coral)" }}
        />
        <h2 className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
          {lever.name}
        </h2>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {lever.metrics.length} metric{lever.metrics.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lever.metrics.map((metric) => (
          <MetricTile key={metric.name} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ persona }: { persona: Persona }) {
  const levers = persona === "legacy" ? LEGACY_LEVERS : AGENTIC_DIMENSIONS;
  const label = persona === "legacy" ? "levers" : "dimensions";

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
          No KPI data recorded yet
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          KPIs are captured during agent conversations. When you confirm specific numeric values
          with the relevant agents below, they appear here grouped by {label}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {levers.map((lever) => (
          <div
            key={lever.name}
            className="rounded-2xl p-4"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: "var(--coral)" }}
              />
              <p className="text-xs font-semibold" style={{ color: "var(--navy)" }}>
                {lever.name}
              </p>
            </div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Captured by
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {lever.agents}
            </p>
            <p className="mt-3 mb-1 text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Metrics tracked
            </p>
            <ul className="flex flex-col gap-1">
              {lever.metrics.map((m) => (
                <li key={m} className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  · {m}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full KPI dashboard: lever/dimension cards with metric tiles and trend indicators. */
export default async function KpisPage({ params }: KpisPageProps) {
  const { id } = await params;
  const [programme, snapshots] = await Promise.all([
    getProgramme(id),
    listKpiSnapshots(id),
  ]);

  if (!programme) notFound();

  const levers = processSnapshots(snapshots);
  const lastUpdated = snapshots[0]?.recorded_at;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
            KPI Dashboard
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            {programme.persona === "legacy"
              ? "Quality of Modernisation · Pace of Modernisation · AI Tool Upskill"
              : "AI and Engineering Impact · People Impact · Financial Impact"}
          </p>
        </div>
        {lastUpdated && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Last updated {formatDate(lastUpdated)}
          </p>
        )}
      </div>

      {/* Content */}
      {levers.length === 0 ? (
        <EmptyState persona={programme.persona} />
      ) : (
        <div className="flex flex-col gap-4">
          {levers.map((lever) => (
            <LeverCard key={lever.name} lever={lever} />
          ))}

          {/* Summary row */}
          <div
            className="rounded-2xl px-5 py-3 flex items-center justify-between"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {snapshots.length} data point{snapshots.length !== 1 ? "s" : ""} recorded across{" "}
              {levers.length} {programme.persona === "legacy" ? "lever" : "dimension"}
              {levers.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Trend arrows show change vs. previous recorded value
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
