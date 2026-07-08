// Three-panel programme shell — desktop: sidebar + centre + right panel.
// Mobile: full-width centre, with agent list and status panel behind a
// Monzo-style bottom navigation bar.

import { notFound } from "next/navigation";
import { getProgramme } from "@/lib/programmes";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { RightPanel } from "@/components/shell/RightPanel";
import { MobileBottomNav } from "@/components/shell/MobileBottomNav";

interface ProgrammeLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProgrammeLayout({ children, params }: ProgrammeLayoutProps) {
  const { id } = await params;
  const programme = await getProgramme(id);

  if (!programme) notFound();

  const sidebar = <Sidebar programme={programme} />;
  const rightPanel = (
    <RightPanel
      programmeId={programme.id}
      phase={programme.active_phase}
      persona={programme.persona}
    />
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-shrink-0">
        {sidebar}
      </div>

      {/* ── Centre column ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile compact header */}
        <div
          className="flex lg:hidden items-center gap-3 px-4 py-3"
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-white"
            style={{ background: "var(--coral)" }}
          >
            PM
          </div>
          <p
            className="flex-1 truncate text-sm font-semibold"
            style={{ color: "var(--navy)" }}
          >
            {programme.name}
          </p>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              background: programme.persona === "legacy" ? "var(--coral-light)" : "#EDE9FE",
              color: programme.persona === "legacy" ? "var(--coral)" : "#7C3AED",
            }}
          >
            {programme.active_phase}
          </span>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header programme={programme} />
        </div>

        <main
          className="flex-1 overflow-y-auto pb-20 lg:pb-0"
          style={{ background: "var(--bg)" }}
        >
          {children}
        </main>
      </div>

      {/* ── Desktop right panel ── */}
      <div className="hidden lg:flex flex-shrink-0">
        {rightPanel}
      </div>

      {/* ── Mobile bottom nav ── */}
      <MobileBottomNav
        programmeId={programme.id}
        sidebarContent={sidebar}
        rightPanelContent={rightPanel}
      />
    </div>
  );
}
