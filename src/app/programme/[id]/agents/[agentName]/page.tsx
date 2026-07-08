// Per-agent chat page: shows the chat UI if the agent's dependencies are
// satisfied, otherwise an honest "locked" state explaining why.
// When opened via ?alertId=, the alert context is injected into the agent's
// opening briefing and shown as a pre-brief banner in the chat.

import { notFound } from "next/navigation";
import { getAgent } from "@/agents/registry";
import { getProgramme } from "@/lib/programmes";
import { canRunAgent } from "@/lib/gating";
import { getAgentAlert } from "@/lib/agentAlerts";
import { ChatPanel } from "@/components/chat/ChatPanel";
import type { AgentAlert } from "@/types/agentAlert";

interface AgentChatPageProps {
  params: Promise<{ id: string; agentName: string }>;
  searchParams: Promise<{ alertId?: string }>;
}

/** Renders one agent's chat, gated by canRunAgent. Pre-briefs from an alert when alertId is present. */
export default async function AgentChatPage({ params, searchParams }: AgentChatPageProps) {
  const { id, agentName } = await params;
  const { alertId } = await searchParams;

  const agent = getAgent(agentName);
  if (!agent) notFound();

  const programme = await getProgramme(id);
  if (!programme) notFound();

  const gate = await canRunAgent(id, agentName);

  let alertContext: AgentAlert | null = null;
  if (alertId && gate.allowed) {
    alertContext = await getAgentAlert(alertId);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
        <h2 className="font-medium text-black dark:text-zinc-50">{agent.displayName}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Produces: {agent.produces.map((spec) => spec.name).join(", ")}
        </p>
      </div>

      {gate.allowed ? (
        <ChatPanel
          programmeId={id}
          agentName={agent.name}
          agentDisplayName={agent.displayName}
          alertContext={alertContext}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-zinc-500 dark:text-zinc-400">
          🔒 {gate.reason}
        </div>
      )}
    </div>
  );
}
