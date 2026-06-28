// Three-panel shell for a single programme: sidebar (left), header + page
// content (centre), tabbed artefacts/KPIs/gate panel (right).

import { notFound } from "next/navigation";
import { getProgramme } from "@/lib/programmes";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { RightPanel } from "@/components/shell/RightPanel";

interface ProgrammeLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/** Loads the programme and wraps every /programme/[id]/* route in the three-panel shell. */
export default async function ProgrammeLayout({ children, params }: ProgrammeLayoutProps) {
  const { id } = await params;
  const programme = await getProgramme(id);

  if (!programme) {
    notFound();
  }

  return (
    <div className="flex flex-1">
      <Sidebar programme={programme} />
      <div className="flex flex-1 flex-col">
        <Header programme={programme} />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black">{children}</main>
      </div>
      <RightPanel programmeId={programme.id} />
    </div>
  );
}
