// History page: every artefact ever produced for this programme, with
// client-side filter/search.

import { listArtefactsForProgramme } from "@/lib/artefacts";
import { HistoryTable } from "@/components/HistoryTable";

interface HistoryPageProps {
  params: Promise<{ id: string }>;
}

/** Lists every artefact for the programme, oldest filtering handled by HistoryTable. */
export default async function HistoryPage({ params }: HistoryPageProps) {
  const { id } = await params;
  const artefacts = await listArtefactsForProgramme(id);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">Artefact History</h1>
      <HistoryTable artefacts={artefacts} />
    </div>
  );
}
