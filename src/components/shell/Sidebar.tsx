// Left sidebar: persona/programme identity and phase agent navigator.
// Monzo-style: rounded rows, coral active indicator, clean hierarchy.

import Link from "next/link";
import { listAgentsForPhase } from "@/agents/registry";
import { canRunAgent, type ArtefactStatusRow } from "@/lib/gating";
import { listArtefactsForProgramme } from "@/lib/artefacts";
import type { Programme } from "@/types/programme";

interface SidebarProps {
  programme: Programme;
}

const PERSONA_LABEL: Record<Programme["persona"], string> = {
  legacy: "Modernising Legacy",
  agentic: "Agentic Delivery",
};

export async function Sidebar({ programme }: SidebarProps) {
  const agents = listAgentsForPhase(programme.persona, programme.active_phase);
  const artefacts = await listArtefactsForProgramme(programme.id);

  const fromCache = async (_id: string, names: string[]): Promise<ArtefactStatusRow[]> =>
    artefacts
      .filter((a) => names.includes(a.artefact_name))
      .map((a) => ({ artefact_name: a.artefact_name, status: a.status }));

  const agentRows = await Promise.all(
    agents.map(async (agent) => {
      const gate = await canRunAgent(programme.id, agent.name, fromCache);
      const produced = artefacts.filter((a) => a.agent_name === agent.name);
      const allApproved =
        agent.produces.length > 0 &&
        agent.produces.every(
          (spec) => produced.find((r) => r.artefact_name === spec.name)?.status === "approved"
        );

      const status = !gate.allowed
        ? "locked"
        : allApproved
          ? "approved"
          : produced.length > 0
            ? "in_progress"
            : "pending";

      return { agent, status, locked: !gate.allowed, reason: gate.reason };
    })
  );

  const approved = agentRows.filter((r) => r.status === "approved").length;

  return (
    <aside
      className="flex w-[220px] flex-shrink-0 flex-col overflow-y-auto"
      style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Programme identity */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {PERSONA_LABEL[programme.persona]}
        </p>
        <h1 className="mt-1 text-sm font-bold leading-snug" style={{ color: "var(--navy)" }}>
          {programme.name}
        </h1>
      </div>

      {/* Phase + progress */}
      <div
        className="mx-3 mb-3 rounded-xl px-3 py-2.5"
        style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold capitalize" style={{ color: "var(--navy)" }}>
            {programme.active_phase} phase
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {approved}/{agents.length}
          </p>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${agents.length ? (approved / agents.length) * 100 : 0}%`,
              background: "var(--green)",
            }}
          />
        </div>
      </div>

      {/* Agent list */}
      <div className="flex-1 px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {agentRows.map(({ agent, status, locked, reason }) => {
            const isProactive = (programme.proactive_agents ?? []).includes(agent.name);

            const dotColor =
              status === "approved"
                ? "var(--green)"
                : status === "in_progress"
                  ? "var(--blue)"
                  : status === "locked"
                    ? "var(--border)"
                    : "var(--border)";

            if (locked) {
              return (
                <li
                  key={agent.name}
                  title={reason}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: dotColor }}
                  />
                  <span className="flex-1 truncate">{agent.displayName}</span>
                  {isProactive && (
                    <span className="text-[10px]" title="Proactive">⚡</span>
                  )}
                </li>
              );
            }

            return (
              <li key={agent.name}>
                <Link
                  href={`/programme/${programme.id}/agents/${agent.name}`}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--bg)]"
                  style={{ color: "var(--navy)" }}
                >
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: dotColor }}
                  />
                  <span className="flex-1 truncate">{agent.displayName}</span>
                  {isProactive && (
                    <span className="text-[10px]" title="Proactive">⚡</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
