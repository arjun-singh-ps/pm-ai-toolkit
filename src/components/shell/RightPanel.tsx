// Right panel of the three-panel shell: Artefacts / KPIs / Gate tabs.
// Monzo-style: coral active tab indicator, rounded cards, clean status badges.

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

const STATUS_DOT: Record<Artefact["status"], string> = {
  draft: "var(--text-muted)",
  in_progress: "var(--blue)",
  approved: "var(--green)",
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
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {lever}
          </p>
          <ul className="flex flex-col gap-2">
            {metrics.map(({ metric, value, date }) => (
              <li
                key={metric}
                className="rounded-xl px-3 py-2"
                style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {metric}
                </p>
                <div className="mt-0.5 flex items-baseline justify-between">
                  <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
                    {value}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {date}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Tabbed right panel: Artefacts (approve drafts), KPIs (live metrics), Gate (phase checklist). */
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

  const emptyClass = "flex-1 flex items-center justify-center text-xs";

  return (
    <aside
      className="flex w-[240px] flex-shrink-0 flex-col"
      style={{
        background: "var(--surface)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 text-xs font-semibold transition-colors"
            style={
              activeTab === tab.id
                ? {
                    color: "var(--coral)",
                    borderBottom: "2px solid var(--coral)",
                    marginBottom: "-1px",
                  }
                : { color: "var(--text-muted)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Artefacts tab */}
        {activeTab === "artefacts" &&
          (isLoading ? (
            <p className={emptyClass} style={{ color: "var(--text-muted)" }}>Loading...</p>
          ) : artefacts.length === 0 ? (
            <p className={emptyClass} style={{ color: "var(--text-muted)" }}>No artefacts yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {artefacts.map((artefact) => (
                <li
                  key={artefact.id}
                  className="rounded-xl p-3"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: STATUS_DOT[artefact.status] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-snug" style={{ color: "var(--navy)" }}>
                        {artefact.artefact_name}
                      </p>
                      <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {STATUS_LABEL[artefact.status]} · v{artefact.version}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingArtefactId(artefact.id)}
                      className="rounded-full px-3 py-1 text-[10px] font-medium transition-colors hover:opacity-80"
                      style={{
                        background: "var(--surface)",
                        color: "var(--navy)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      View
                    </button>
                    {artefact.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(artefact.id)}
                        disabled={approvingId === artefact.id}
                        className="rounded-full px-3 py-1 text-[10px] font-medium transition-colors hover:opacity-80 disabled:opacity-40"
                        style={{
                          background: "var(--green)",
                          color: "#fff",
                        }}
                      >
                        {approvingId === artefact.id ? "Approving..." : "Approve"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {/* KPIs tab */}
        {activeTab === "kpis" &&
          (isLoading ? (
            <p className={emptyClass} style={{ color: "var(--text-muted)" }}>Loading...</p>
          ) : kpiSnapshots.length === 0 ? (
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              No KPI data yet. KPIs are captured during conversations with Delivery Intelligence,
              Signal Watch, and Delivery Heartbeat.
            </p>
          ) : (
            <KpiDisplay snapshots={kpiSnapshots} />
          ))}

        {/* Gate tab */}
        {activeTab === "gate" &&
          (isLoading || !gate ? (
            <p className={emptyClass} style={{ color: "var(--text-muted)" }}>Loading...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Gate status badge */}
              <div
                className="rounded-xl px-3 py-2.5"
                style={{
                  background: gate.clear ? "#ECFDF5" : "#FFFBEB",
                  border: `1px solid ${gate.clear ? "#A7F3D0" : "#FDE68A"}`,
                }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: gate.clear ? "var(--green)" : "#D97706" }}
                >
                  {gate.clear ? "Gate clear" : "Gate not yet clear"}
                </p>
              </div>

              {/* Agent checklists */}
              <ul className="flex flex-col gap-3">
                {gate.agents.map((agent) => (
                  <li key={agent.name}>
                    <p
                      className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {agent.displayName}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {agent.artefacts.map((artefact) => (
                        <li key={artefact.name} className="flex items-center gap-2 text-xs">
                          <span style={{ color: artefact.approved ? "var(--green)" : "var(--border)" }}>
                            {artefact.approved ? "●" : "○"}
                          </span>
                          <span style={{ color: artefact.approved ? "var(--navy)" : "var(--text-muted)" }}>
                            {artefact.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              {nextPhase === undefined ? (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Final phase of this persona.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAdvance}
                    disabled={!gate.clear || !nextPhaseAvailable || isAdvancing}
                    className="mt-1 w-full rounded-xl py-2.5 text-xs font-semibold transition-colors disabled:opacity-40"
                    style={
                      gate.clear && nextPhaseAvailable
                        ? { background: "var(--coral)", color: "#fff" }
                        : { background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                    }
                    title={
                      !nextPhaseAvailable
                        ? `${nextPhase} phase agents are not yet available`
                        : !gate.clear
                          ? "Approve every artefact above first"
                          : undefined
                    }
                  >
                    {isAdvancing
                      ? "Advancing..."
                      : `Advance to ${nextPhase[0].toUpperCase() + nextPhase.slice(1)}`}
                  </button>

                  {advanceError && (
                    <p className="text-xs" style={{ color: "#DC2626" }}>
                      {advanceError}
                    </p>
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
