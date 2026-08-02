// Roadmap page: every phase in the persona's delivery journey as a timeline,
// so a PM can see where the programme stands and browse back into a
// completed phase's agents/artefacts read-only. Never changes
// programme.active_phase — that's still only done via the Gate tab.

import { notFound } from "next/navigation";
import { getProgramme } from "@/lib/programmes";
import { listArtefactsForProgramme } from "@/lib/artefacts";
import { buildRoadmap } from "@/lib/phaseRoadmap";
import { RoadmapView } from "@/components/RoadmapView";

interface RoadmapPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const { id } = await params;
  const programme = await getProgramme(id);
  if (!programme) notFound();

  const artefacts = await listArtefactsForProgramme(id);
  const phases = await buildRoadmap(id, programme.persona, programme.active_phase, artefacts);

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-bold" style={{ color: "var(--navy)" }}>
        Programme Roadmap
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        {programme.persona === "legacy" ? "Modernising Legacy Journey" : "Agentic Delivery"} — every
        phase in order. Select a completed or current phase to review its agents and artefacts;
        this is a read-only view and never changes the programme&apos;s live phase.
      </p>
      <RoadmapView programmeId={id} phases={phases} />
    </div>
  );
}
