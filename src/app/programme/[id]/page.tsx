// Default centre-panel content for a programme: edit programme notes,
// regulatory frameworks, and agent modes. Also shows a proactive-agent
// reminder banner when any monitoring agents are in proactive mode.

import { notFound } from "next/navigation";
import { getProgramme } from "@/lib/programmes";
import { MONITORING_AGENTS } from "@/lib/constants";
import { ProgrammeNotesForm } from "@/components/ProgrammeNotesForm";
import { ProgrammeFrameworksForm } from "@/components/ProgrammeFrameworksForm";
import { ProactiveAgentsForm } from "@/components/ProactiveAgentsForm";

interface ProgrammePageProps {
  params: Promise<{ id: string }>;
}

/** Default programme view: notes, regulatory frameworks, agent mode settings, and proactive banner. */
export default async function ProgrammePage({ params }: ProgrammePageProps) {
  const { id } = await params;
  const programme = await getProgramme(id);

  if (!programme) {
    notFound();
  }

  const proactiveAgentNames = programme.proactive_agents ?? [];
  const activeProactiveAgents = MONITORING_AGENTS.filter(
    (a) => a.built && proactiveAgentNames.includes(a.name)
  );

  return (
    <div>
      {activeProactiveAgents.length > 0 && (
        <div className="mx-8 mt-8 rounded-lg border border-black/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="text-sm font-medium text-black dark:text-zinc-50">
            ⚡ Proactive agents active
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {activeProactiveAgents.map((a) => a.displayName).join(", ")} — open{" "}
            {activeProactiveAgents.length === 1 ? "this agent" : "these agents"} to see{" "}
            {activeProactiveAgents.length === 1 ? "its" : "their"} latest assessment of your
            programme.
          </p>
        </div>
      )}

      <ProgrammeNotesForm programmeId={programme.id} initialNotes={programme.notes} />
      <ProgrammeFrameworksForm
        programmeId={programme.id}
        initialFrameworks={programme.regulatory_frameworks}
      />
      <ProactiveAgentsForm
        programmeId={programme.id}
        initialProactiveAgents={proactiveAgentNames}
      />
    </div>
  );
}
