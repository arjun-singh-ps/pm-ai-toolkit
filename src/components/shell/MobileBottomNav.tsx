// Mobile bottom navigation bar — Monzo-app style fixed footer.
// Shows on small screens only; hidden on lg+.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileDrawer } from "@/components/shell/MobileDrawer";

interface MobileBottomNavProps {
  programmeId: string;
  sidebarContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
}

/** Fixed bottom nav: Overview | Agents (drawer) | Artefacts | Panel (drawer) */
export function MobileBottomNav({ programmeId, sidebarContent, rightPanelContent }: MobileBottomNavProps) {
  const pathname = usePathname();
  const isHome = pathname === `/programme/${programmeId}`;
  const isHistory = pathname === `/programme/${programmeId}/history`;

  const base = "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors";
  const active = "text-[var(--coral)]";
  const inactive = "text-[var(--text-muted)]";

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 pb-safe"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -4px 20px rgba(0,0,0,.08)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Overview */}
      <Link href={`/programme/${programmeId}`} className={`${base} ${isHome ? active : inactive}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7a1 1 0 0 0 1.414 1.414L4 10.414V17a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3h2v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-7-7Z" />
        </svg>
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      {/* Agents drawer */}
      <MobileDrawer
        side="left"
        panelLabel="Agents"
        triggerContent={
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
            </svg>
            <span className="text-[10px] font-medium">Agents</span>
          </>
        }
        triggerClassName={`${base} ${inactive}`}
      >
        {sidebarContent}
      </MobileDrawer>

      {/* Artefacts */}
      <Link href={`/programme/${programmeId}/history`} className={`${base} ${isHistory ? active : inactive}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Zm2 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7Z" clipRule="evenodd" />
        </svg>
        <span className="text-[10px] font-medium">Artefacts</span>
      </Link>

      {/* Panel drawer (artefacts/gate/kpis) */}
      <MobileDrawer
        side="right"
        panelLabel="Status"
        triggerContent={
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-medium">Gate</span>
          </>
        }
        triggerClassName={`${base} ${inactive}`}
      >
        {rightPanelContent}
      </MobileDrawer>
    </nav>
  );
}
