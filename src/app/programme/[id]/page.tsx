// Default centre-panel content for a programme: proactive alerts, notes,
// regulatory frameworks, agent mode settings, document uploads, and archive.

import { notFound } from "next/navigation";
import { getProgramme } from "@/lib/programmes";
import { MONITORING_AGENTS } from "@/lib/constants";
import { ProgrammeNotesForm } from "@/components/ProgrammeNotesForm";
import { ProgrammeFrameworksForm } from "@/components/ProgrammeFrameworksForm";
import { ProactiveAgentsForm } from "@/components/ProactiveAgentsForm";
import { AgentAlertsPanel } from "@/components/AgentAlertsPanel";
import { ProgrammeDocumentsForm } from "@/components/ProgrammeDocumentsForm";
import { ArchiveProgrammeButton } from "@/components/ArchiveProgrammeButton";

interface ProgrammePageProps {
  params: Promise<{ id: string }>;
}

/** Default programme view: alerts, notes, regulatory frameworks, agent mode settings. */
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
      {/* Proactive alerts — fetches its own data; renders nothing when empty */}
      <AgentAlertsPanel programmeId={programme.id} />

      {/* Proactive-mode reminder banner — shows which agents are configured as proactive */}
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
      <ProgrammeDocumentsForm programmeId={programme.id} />
      <ArchiveProgrammeButton programmeId={programme.id} archived={programme.archived ?? false} />

      {/* Bottom padding so the last section isn't flush against the panel edge */}
      <div className="h-12" />
    </div>
  );
}
