// Server-only: builds KPI Monitor's context from the programme's KPI
// snapshots and existing artefacts. Groups snapshots by lever/dimension,
// then de-duplicates to current + previous per metric so the agent can
// discuss trends without querying the database itself.

import { listKpiSnapshots } from "@/lib/kpiSnapshots";
import { listArtefactsForProgramme } from "@/lib/artefacts";
import { getProgramme } from "@/lib/programmes";
import { formatArtefactSummary } from "@/agents/cross-cutting/artefactSummary";

/** Builds KPI Monitor's context: grouped snapshots with trend data + artefact summary. */
export async function buildKpiMonitorContext(programmeId: string): Promise<string | null> {
  const [programme, snapshots, artefacts] = await Promise.all([
    getProgramme(programmeId),
    listKpiSnapshots(programmeId),
    listArtefactsForProgramme(programmeId),
  ]);

  if (!programme) return null;

  const persona = programme.persona as string;

  // ── Snapshot processing ──────────────────────────────────────────────────────
  // listKpiSnapshots returns most-recent-first. Group by lever, then by metric name
  // keeping only the most recent and second-most-recent value for trend display.

  type SnapshotEntry = {
    current: { value: number; recordedAt: string };
    previous?: { value: number; recordedAt: string };
  };

  const leverMap = new Map<string, Map<string, SnapshotEntry>>();

  for (const snap of snapshots) {
    const lever = snap.lever_or_dimension;
    const metric = snap.metric_name;

    if (!leverMap.has(lever)) {
      leverMap.set(lever, new Map());
    }

    const metricMap = leverMap.get(lever)!;
    const existing = metricMap.get(metric);

    if (!existing) {
      // First (most recent) value for this metric.
      metricMap.set(metric, {
        current: { value: snap.value, recordedAt: snap.recorded_at.slice(0, 10) },
      });
    } else if (!existing.previous) {
      // Second value becomes the "previous" for trend calculation.
      metricMap.set(metric, {
        ...existing,
        previous: { value: snap.value, recordedAt: snap.recorded_at.slice(0, 10) },
      });
    }
    // Third+ values ignored — we only need current and previous for trend.
  }

  if (leverMap.size === 0) {
    const personaLabel =
      persona === "legacy" ? "Modernising Legacy Journey" : "Agentic Delivery";
    const agentNames =
      persona === "legacy"
        ? "Delivery Intelligence, Signal Watch, and Delivery Heartbeat"
        : "Performance Pulse";
    return (
      `## KPI data\n\n` +
      `No KPI snapshots recorded yet for this programme (${personaLabel}).\n` +
      `KPI values are recorded by these agents: ${agentNames}.\n` +
      `Open these agents and discuss real programme metrics to start capturing KPI data.`
    );
  }

  const leverBlocks: string[] = [];

  for (const [lever, metricMap] of leverMap.entries()) {
    const metricLines: string[] = [];

    for (const [metric, entry] of metricMap.entries()) {
      const { current, previous } = entry;
      let trendText = "(no previous value — first recording)";

      if (previous) {
        const delta = current.value - previous.value;
        const pct =
          previous.value !== 0 ? Math.abs((delta / previous.value) * 100).toFixed(1) : "N/A";
        const direction = delta > 0 ? "▲" : delta < 0 ? "▼" : "→";
        trendText = `${direction} ${delta > 0 ? "+" : ""}${delta.toFixed(2)} (${pct}% vs ${previous.recordedAt})`;
      }

      metricLines.push(
        `  • ${metric}: ${current.value} (updated ${current.recordedAt}) ${trendText}`
      );
    }

    leverBlocks.push(`### ${lever}\n${metricLines.join("\n")}`);
  }

  const totalPoints = snapshots.length;
  const totalLevers = leverMap.size;

  const header =
    `## KPI data\n\n` +
    `Persona: ${persona === "legacy" ? "Modernising Legacy Journey" : "Agentic Delivery"}\n` +
    `${totalPoints} data point(s) recorded across ${totalLevers} lever(s)/dimension(s)\n\n`;

  const artefactSummary = formatArtefactSummary(artefacts);
  const artefactBlock = artefactSummary
    ? `\n\n${artefactSummary}`
    : "\n\n## Existing programme artefacts\n\n(none yet)";

  return header + leverBlocks.join("\n\n") + artefactBlock;
}
