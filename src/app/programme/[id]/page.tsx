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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Proactive alerts — fetches its own data; renders nothing when empty */}
      <AgentAlertsPanel programmeId={programme.id} />

      {/* Proactive-mode reminder banner */}
      {activeProactiveAgents.length > 0 && (
        <div
          className="mb-4 rounded-2xl px-4 py-3"
          style={{ background: "var(--coral-light)", border: "1px solid var(--coral)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--coral)" }}>
            ⚡ Proactive agents active
          </p>
          <p className="mt-0.5 text-sm" style={{ color: "var(--navy)" }}>
            {activeProactiveAgents.map((a) => a.displayName).join(", ")} — open{" "}
            {activeProactiveAgents.length === 1 ? "this agent" : "these agents"} to see{" "}
            {activeProactiveAgents.length === 1 ? "its" : "their"} latest assessment.
          </p>
        </div>
      )}

      {/* Settings cards */}
      <div className="flex flex-col gap-4">
        <div
          className="rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <ProgrammeNotesForm programmeId={programme.id} initialNotes={programme.notes} />
        </div>

        <div
          className="rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="p-6 pb-0">
            <h2 className="font-semibold" style={{ color: "var(--navy)" }}>
              Programme settings
            </h2>
          </div>
          <ProgrammeFrameworksForm
            programmeId={programme.id}
            initialFrameworks={programme.regulatory_frameworks}
          />
          <ProactiveAgentsForm
            programmeId={programme.id}
            initialProactiveAgents={proactiveAgentNames}
          />
        </div>

        <div
          className="rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <ProgrammeDocumentsForm programmeId={programme.id} />
        </div>

        <ArchiveProgrammeButton programmeId={programme.id} archived={programme.archived ?? false} />
      </div>
    </div>
  );
}
