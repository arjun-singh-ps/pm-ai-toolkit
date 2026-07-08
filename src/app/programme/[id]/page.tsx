// Default centre-panel content for a programme: edit programme notes and
// regulatory frameworks, and prompts the user to select an agent.

import { notFound } from "next/navigation";
import { getProgramme } from "@/lib/programmes";
import { ProgrammeNotesForm } from "@/components/ProgrammeNotesForm";
import { ProgrammeFrameworksForm } from "@/components/ProgrammeFrameworksForm";

interface ProgrammePageProps {
  params: Promise<{ id: string }>;
}

/** Default programme view: notes editor, regulatory framework editor, and a hint to pick an agent. */
export default async function ProgrammePage({ params }: ProgrammePageProps) {
  const { id } = await params;
  const programme = await getProgramme(id);

  if (!programme) {
    notFound();
  }

  return (
    <div>
      <ProgrammeNotesForm programmeId={programme.id} initialNotes={programme.notes} />
      <ProgrammeFrameworksForm
        programmeId={programme.id}
        initialFrameworks={programme.regulatory_frameworks}
      />
    </div>
  );
}
