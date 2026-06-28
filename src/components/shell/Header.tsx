// Centre panel header: breadcrumb + the 4 cross-cutting agent buttons.
// The buttons are disabled this milestone — their backing agent logic
// (Governance Guardian, Cost Compass, Roadmap Architect, Comms Architect)
// hasn't been built yet.

import type { Programme } from "@/types/programme";

interface HeaderProps {
  programme: Programme;
}

const CROSS_CUTTING_BUTTONS = ["Governance Guardian", "Cost Compass", "Roadmap Architect", "Comms Architect"];

/** Renders the breadcrumb and the (currently disabled) cross-cutting agent buttons. */
export function Header({ programme }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {programme.name} / {programme.active_phase}
      </p>
      <div className="flex gap-2">
        {CROSS_CUTTING_BUTTONS.map((label) => (
          <button
            key={label}
            type="button"
            disabled
            title="Coming in a later milestone"
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-400 opacity-50 dark:border-white/10 dark:text-zinc-600"
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
