// Right panel of the three-panel shell: Artefacts / KPIs / Gate tabs.
// Artefacts and Gate are wired to real data; KPIs remains an honest
// empty-state placeholder until a KPI-writing agent exists.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Artefact } from "@/types/artefact";

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
}

/** Tabbed right panel: Artefacts (approve drafts) and Gate (phase checklist) are wired to real data. */
export function RightPanel({ programmeId, phase }: RightPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("artefacts");
  const [artefacts, setArtefacts] = useState<Artefact[]>([]);
  const [gate, setGate] = useState<{ clear: boolean; agents: GateAgentChecklist[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function loadData() {
    try {
      const [artefactsResponse, gateResponse] = await Promise.all([
        fetch(`/api/artefacts?programmeId=${programmeId}`),
        fetch(`/api/gate/${phase}?programmeId=${programmeId}`),
      ]);
      const artefactsData = await artefactsResponse.json();
      const gateData = await gateResponse.json();
      setArtefacts(artefactsData.artefacts ?? []);
      setGate(gateData);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
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
      }
    } finally {
      setApprovingId(null);
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
                  {artefact.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleApprove(artefact.id)}
                      disabled={approvingId === artefact.id}
                      className="mt-2 rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
                    >
                      {approvingId === artefact.id ? "Approving..." : "Approve"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ))}

        {activeTab === "kpis" && "No KPI data recorded for this programme yet."}

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

              <button
                type="button"
                disabled
                title="Forge phase agents are not yet available"
                className="mt-1 self-start rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-zinc-400 opacity-50 dark:border-white/10"
              >
                Advance to Forge
              </button>
            </div>
          ))}
      </div>
    </aside>
  );
}
