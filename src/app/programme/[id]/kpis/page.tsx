// KPI dashboard page. Honest empty state — no kpi-monitor agent exists yet
// to populate kpi_snapshots, so this reads the real (currently empty) table
// rather than fabricating placeholder numbers.

import { listKpiSnapshots } from "@/lib/kpiSnapshots";

interface KpisPageProps {
  params: Promise<{ id: string }>;
}

/** Shows recorded KPI snapshots for the programme, or an honest empty state. */
export default async function KpisPage({ params }: KpisPageProps) {
  const { id } = await params;
  const snapshots = await listKpiSnapshots(id);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">KPIs</h1>
      {snapshots.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No KPI data recorded for this programme yet. KPI tracking is produced by the cross-cutting
          KPI Monitor agent, which hasn&apos;t been built yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {snapshots.map((snapshot) => (
            <li key={snapshot.id} className="text-sm text-black dark:text-zinc-50">
              {snapshot.metric_name}: {snapshot.value} ({snapshot.lever_or_dimension})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
