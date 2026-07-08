// Slide-in drawer for mobile navigation — renders both the trigger button and
// the panel, sharing state internally. Works with server-component children
// because Next.js passes the rendered output as the children prop.

"use client";

import { useState } from "react";

interface MobileDrawerProps {
  side?: "left" | "right";
  triggerContent: React.ReactNode;
  triggerClassName?: string;
  panelLabel?: string;
  children: React.ReactNode;
}

/** Mobile slide-in drawer: trigger button + backdrop + panel. Hidden on lg+ screens. */
export function MobileDrawer({
  side = "left",
  triggerContent,
  triggerClassName,
  panelLabel,
  children,
}: MobileDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
        aria-label={panelLabel ?? (side === "left" ? "Open agents" : "Open panel")}
      >
        {triggerContent}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className={`absolute top-0 h-full w-[300px] overflow-y-auto bg-white shadow-2xl dark:bg-zinc-950 ${
              side === "left" ? "left-0" : "right-0"
            }`}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
              {panelLabel && (
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {panelLabel}
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
