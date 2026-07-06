// Server-only: builds Comms Architect's context from existing artefacts and
// any KPI snapshots. Comms artefacts are grounded in delivery status, so the
// agent needs both the artefact summary and any metrics recorded so far.

import { listArtefactsForProgramme } from "@/lib/artefacts";
import { listKpiSnapshots } from "@/lib/kpiSnapshots";
import { formatArtefactSummary } from "@/agents/cross-cutting/artefactSummary";

/** Fetches artefacts and KPI snapshots and formats them for Comms Architect's context. */
export async function buildCommsArchitectContext(programmeId: string): Promise<string | null> {
  const [artefacts, kpiSnapshots] = await Promise.all([
    listArtefactsForProgramme(programmeId),
    listKpiSnapshots(programmeId),
  ]);

  const parts: string[] = [];

  const artefactSummary = formatArtefactSummary(artefacts);
  if (artefactSummary) {
    parts.push(artefactSummary);
  }

  if (kpiSnapshots.length > 0) {
    const kpiLines = kpiSnapshots
      .slice(0, 20) // cap to avoid bloating the context window
      .map(
        (s) =>
          `  - ${s.metric_name} (${s.lever_or_dimension}): ${s.value} — recorded ${s.recorded_at.slice(0, 10)}`
      )
      .join("\n");
    parts.push(`## KPI snapshots (most recent first)\n\n${kpiLines}`);
  }

  return parts.length > 0 ? parts.join("\n\n") : null;
}
