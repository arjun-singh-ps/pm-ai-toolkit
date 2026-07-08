// Data-access layer for the kpi_snapshots table. No agent writes to this
// table yet (kpi-monitor is a cross-cutting agent, out of scope this
// milestone) — this exists so the KPIs page reads real (currently empty)
// data rather than fabricating a placeholder.

import { getSupabaseServiceClient } from "@/lib/supabase";

export interface KpiSnapshot {
  id: string;
  programme_id: string;
  persona: string;
  lever_or_dimension: string;
  metric_name: string;
  value: number;
  recorded_at: string;
}

/** Records one KPI metric value for a programme. */
export async function writeKpiSnapshot(
  programmeId: string,
  persona: string,
  leverOrDimension: string,
  metricName: string,
  value: number
): Promise<void> {
  const { error } = await getSupabaseServiceClient().from("kpi_snapshots").insert({
    programme_id: programmeId,
    persona,
    lever_or_dimension: leverOrDimension,
    metric_name: metricName,
    value,
  });

  if (error) {
    throw new Error(`Failed to write KPI snapshot: ${error.message}`);
  }
}

/** Returns every KPI snapshot recorded for a programme, most recent first. */
export async function listKpiSnapshots(programmeId: string): Promise<KpiSnapshot[]> {
  const { data, error } = await getSupabaseServiceClient()
    .from("kpi_snapshots")
    .select("*")
    .eq("programme_id", programmeId)
    .order("recorded_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list KPI snapshots: ${error.message}`);
  }

  return data as KpiSnapshot[];
}
