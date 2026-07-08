// Right panel of the three-panel shell: Artefacts / KPIs / Gate tabs.
// All three tabs are wired to real data.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Artefact } from "@/types/artefact";
import type { KpiSnapshot } from "@/lib/kpiSnapshots";
import type { Persona } from "@/types/programme";
import { listAgentsForPhase } from "@/agents/registry";
import { NEXT_PHASE } from "@/lib/constants";
import { ArtefactModal } from "@/components/ArtefactModal";
import { ARTEFACT_RECORDED_EVENT } from "@/lib/clientEvents";

type Tab = "artefacts" | "kpis" | "gate";

const TABS: { id: Tab; label: string }[] = [
  { id: "artefacts", label: "Artefacts" },
  { id: "kpis", label: "KPIs" },
  { id: "gate", label: "Gate" },
];

const STATUS_LABEL: Record<Artefact["status"], string> = {
  draft: "Draft",
  in_progress: "In progress",
  approved: "Approved",
};

const STATUS_COLOR: Record<Artefact["status"], string> = {
  draft: "text-zinc-500 dark:text-zinc-400",
  in_progress: "text-blue-600 dark:text-blue-400",
  approved: "text-green-600 dark:text-green-400",
};

interface GateAgentChecklist {
  name: string;
  displayName: string;
  artefacts: { name: string; approved: boolean }[];
}

interface RightPanelProps {
  programmeId: string;
  phase: string;
  persona: Persona;
}

/**
 * Groups KPI snapshots by lever, de-duplicates to the most recent value per metric,
 * and renders each lever as a labelled section.
 */
function KpiDisplay({ snapshots }: { snapshots: KpiSnapshot[] }) {
  // snapshots are ordered most-recent-first; first occurrence of each metric is current value
  const byLever = new Map<string, { metric: string; value: number; date: string }[]>();
  const seen = new Set<string>();

  for (const s of snapshots) {
    const key = `${s.lever_or_dimension}::${s.metric_name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const existing = byLever.get(s.lever_or_dimension) ?? [];
    existing.push({ metric: s.metric_name, value: s.value, date: s.recorded_at.slice(0, 10) });
    byLever.set(s.lever_or_dimension, existing);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...byLever.entries()].map(([lever, metrics]) => (
        <div key={lever}>
          <p className="mb-1 text-xs font-semibold text-black dark:text-zinc-50">{lever}</p>
          <ul className="flex flex-col gap-1">
            {metrics.map(({ metric, value, date }) => (
              <li key={metric} className="text-xs">
                <span className="text-zinc-700 dark:text-zinc-300">{metric}:</span>{" "}
                <span className="font-medium text-black dark:text-zinc-50">{value}</span>
                <span className="ml-1 text-zinc-400 dark:text-zinc-500">({date})</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Tabbed right panel: Artefacts (approve drafts), KPIs (live metrics), and Gate (phase checklist). */
export function RightPanel({ programmeId, phase, persona }: RightPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("artefacts");
  const [artefacts, setArtefacts] = useState<Artefact[]>([]);
  const [kpiSnapshots, setKpiSnapshots] = useState<KpiSnapshot[]>([]);
  const [gate, setGate] = useState<{ clear: boolean; agents: GateAgentChecklist[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const [viewingArtefactId, setViewingArtefactId] = useState<string | null>(null);

  const nextPhase = NEXT_PHASE[phase];
  const nextPhaseAvailable = Boolean(nextPhase) && listAgentsForPhase(persona, nextPhase).length > 0;

  async function loadData() {
    try {
      const [artefactsResponse, gateResponse, kpisResponse] = await Promise.all([
        fetch(`/api/artefacts?programmeId=${programmeId}`),
        fetch(`/api/gate/${phase}?programmeId=${programmeId}`),
        fetch(`/api/kpis?programmeId=${programmeId}`),
      ]);
      const artefactsData = await artefactsResponse.json();
      const gateData = await gateResponse.json();
      const kpisData = await kpisResponse.json();
      setArtefacts(artefactsData.artefacts ?? []);
      setGate(gateData);
      setKpiSnapshots(kpisData.snapshots ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programmeId, phase]);

  useEffect(() => {
    function handleArtefactRecorded() {
      void loadData();
    }
    window.addEventListener(ARTEFACT_RECORDED_EVENT, handleArtefactRecorded);
    return () => window.removeEventListener(ARTEFACT_RECORDED_EVENT, handleArtefactRecorded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programmeId, phase]);

  /** Approves one artefact, refreshes this panel's data, and revalidates the sidebar's lock state. */
  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      const response = await fetch(`/api/artefacts/${id}/approve`, { method: "POST" });
      if (response.ok) {
        await loadData();
        router.refresh();
        setViewingArtefactId(null);
      }
    } finally {
      setApprovingId(null);
    }
  }

  /** Advances the programme to the next phase. The server re-checks the gate independently. */
  async function handleAdvance() {
    setIsAdvancing(true);
    setAdvanceError(null);
    try {
      const response = await fetch(`/api/programmes/${programmeId}/advance-phase`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setAdvanceError(data.error ?? "Failed to advance phase.");
        return;
      }
      router.refresh();
    } finally {
      setIsAdvancing(false);
    }
  }

  return (
    <aside className="flex w-[240px] flex-shrink-0 flex-col border-l border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="flex border-b border-black/10 dark:border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-2 text-xs font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-black text-black dark:border-white dark:text-zinc-50"
                : "text-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 text-sm text-zinc-500 dark:text-zinc-400">
        {activeTab === "artefacts" &&
          (isLoading ? (
            "Loading artefacts..."
          ) : artefacts.length === 0 ? (
            "No artefacts yet."
          ) : (
            <ul className="flex flex-col gap-3">
              {artefacts.map((artefact) => (
                <li key={artefact.id} className="rounded-md border border-black/10 p-2 dark:border-white/10">
                  <p className="text-xs font-medium text-black dark:text-zinc-50">{artefact.artefact_name}</p>
                  <p className={`text-xs ${STATUS_COLOR[artefact.status]}`}>
                    {STATUS_LABEL[artefact.status]} · v{artefact.version}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingArtefactId(artefact.id)}
                      className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
                    >
                      View
                    </button>
                    {artefact.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(artefact.id)}
                        disabled={approvingId === artefact.id}
                        className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
                      >
                        {approvingId === artefact.id ? "Approving..." : "Approve"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {activeTab === "kpis" &&
          (isLoading ? (
            "Loading KPIs..."
          ) : kpiSnapshots.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No KPI data yet. KPIs are captured during conversations with Delivery Intelligence
              (Foundation), Signal Watch (Forge), and Delivery Heartbeat (Amplify).
            </p>
          ) : (
            <KpiDisplay snapshots={kpiSnapshots} />
          ))}

        {activeTab === "gate" &&
          (isLoading || !gate ? (
            "Loading gate status..."
          ) : (
            <div className="flex flex-col gap-3">
              <p className={gate.clear ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                {gate.clear ? "✅ Phase gate clear" : "⏳ Phase gate not yet clear"}
              </p>

              <ul className="flex flex-col gap-2">
                {gate.agents.map((agent) => (
                  <li key={agent.name}>
                    <p className="text-xs font-medium text-black dark:text-zinc-50">{agent.displayName}</p>
                    <ul className="ml-3 mt-1 flex flex-col gap-0.5">
                      {agent.artefacts.map((artefact) => (
                        <li key={artefact.name} className="text-xs">
                          {artefact.approved ? "✅" : "⬜"} {artefact.name}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              {nextPhase === undefined ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  🏁 This is the final phase of this persona.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAdvance}
                    disabled={!gate.clear || !nextPhaseAvailable || isAdvancing}
                    title={
                      !nextPhaseAvailable
                        ? `${nextPhase} phase agents are not yet available`
                        : !gate.clear
                          ? "Approve every artefact above first"
                          : undefined
                    }
                    className="mt-1 self-start rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-zinc-400 opacity-50 enabled:border-black/20 enabled:text-black enabled:opacity-100 enabled:hover:bg-black/5 dark:border-white/10 dark:enabled:text-zinc-50 dark:enabled:hover:bg-white/5"
                  >
                    {isAdvancing
                      ? "Advancing..."
                      : `Advance to ${nextPhase[0].toUpperCase() + nextPhase.slice(1)}`}
                  </button>

                  {advanceError && (
                    <p className="text-xs text-red-600 dark:text-red-400">{advanceError}</p>
                  )}
                </>
              )}
            </div>
          ))}
      </div>

      {viewingArtefactId &&
        (() => {
          const viewingArtefact = artefacts.find((artefact) => artefact.id === viewingArtefactId);
          if (!viewingArtefact) return null;
          return (
            <ArtefactModal
              artefact={viewingArtefact}
              onClose={() => setViewingArtefactId(null)}
              onApprove={handleApprove}
              isApproving={approvingId === viewingArtefact.id}
            />
          );
        })()}
    </aside>
  );
}
