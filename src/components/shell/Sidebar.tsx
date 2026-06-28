// Left sidebar of the three-panel programme shell: persona indicator,
// programme name, and the phase/activity navigator with real lock/progress
// status per agent.

import Link from "next/link";
import { listAgentsForPhase } from "@/agents/registry";
import { canRunAgent, type ArtefactStatusRow } from "@/lib/gating";
import { listArtefactsForProgramme } from "@/lib/artefacts";
import type { Programme } from "@/types/programme";

interface SidebarProps {
  programme: Programme;
}

const PERSONA_LABEL: Record<Programme["persona"], string> = {
  legacy: "Modernising Legacy Journey",
  agentic: "Agentic Delivery",
};

const DOT_COLOR: Record<"locked" | "pending" | "in_progress" | "approved", string> = {
  locked: "bg-zinc-300 dark:bg-zinc-700",
  pending: "bg-zinc-300 dark:bg-zinc-700",
  in_progress: "bg-blue-500",
  approved: "bg-green-500",
};

/** Renders the persona/programme header and the phase's agent navigator, with each agent's real lock/progress status. */
export async function Sidebar({ programme }: SidebarProps) {
  const agents = listAgentsForPhase(programme.persona, programme.active_phase);
  const artefacts = await listArtefactsForProgramme(programme.id);

  const fromCache = async (_programmeId: string, names: string[]): Promise<ArtefactStatusRow[]> =>
    artefacts
      .filter((artefact) => names.includes(artefact.artefact_name))
      .map((artefact) => ({ artefact_name: artefact.artefact_name, status: artefact.status }));

  const agentRows = await Promise.all(
    agents.map(async (agent) => {
      const gate = await canRunAgent(programme.id, agent.name, fromCache);
      const produced = artefacts.filter((artefact) => artefact.agent_name === agent.name);
      const allApproved =
        agent.produces.length > 0 &&
        agent.produces.every(
          (spec) => produced.find((row) => row.artefact_name === spec.name)?.status === "approved"
        );

      const status = !gate.allowed ? "locked" : allApproved ? "approved" : produced.length > 0 ? "in_progress" : "pending";

      return { agent, status: status as keyof typeof DOT_COLOR, locked: !gate.allowed, reason: gate.reason };
    })
  );

  return (
    <aside className="flex w-[220px] flex-shrink-0 flex-col gap-6 border-r border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-400">{PERSONA_LABEL[programme.persona]}</p>
        <h1 className="mt-1 font-medium text-black dark:text-zinc-50">{programme.name}</h1>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-zinc-400">{programme.active_phase}</p>
        <ul className="flex flex-col gap-1">
          {agentRows.map(({ agent, status, locked, reason }) => {
            const dot = <span className={`h-2 w-2 rounded-full ${DOT_COLOR[status]}`} />;

            if (locked) {
              return (
                <li
                  key={agent.name}
                  title={reason}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-400 dark:text-zinc-600"
                >
                  {dot}
                  {agent.displayName}
                </li>
              );
            }

            return (
              <li key={agent.name}>
                <Link
                  href={`/programme/${programme.id}/agents/${agent.name}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5"
                >
                  {dot}
                  {agent.displayName}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
