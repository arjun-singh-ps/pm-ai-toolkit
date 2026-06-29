// Full-content viewer for one artefact, with an Approve action — this is
// the actual "review before use" step; the Artefacts tab list alone never
// showed enough to review anything.

"use client";

import type { Artefact } from "@/types/artefact";

interface ArtefactSection {
  heading: string;
  body: string;
}

interface ArtefactModalProps {
  artefact: Artefact;
  onClose: () => void;
  onApprove: (id: string) => void;
  isApproving: boolean;
}

/** Modal overlay showing an artefact's full structured content. */
export function ArtefactModal({ artefact, onClose, onApprove, isApproving }: ArtefactModalProps) {
  const content = artefact.content as {
    title?: string;
    sections?: ArtefactSection[];
    version?: number;
    date?: string;
    programmeName?: string;
    owner?: string;
    disclaimer?: string;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-black/10 p-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-medium text-black dark:text-zinc-50">
              {content.title ?? artefact.artefact_name}
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              v{content.version ?? artefact.version}
              {content.date ? ` · ${content.date}` : ""}
              {content.owner ? ` · recorded by ${content.owner}` : ""}
              {artefact.status === "approved" && artefact.approved_by
                ? ` · approved by ${artefact.approved_by}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-black dark:hover:text-zinc-50"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!content.sections || content.sections.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No content sections.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {content.sections.map((section, index) => (
                <div key={index}>
                  <h3 className="mb-1 text-sm font-semibold text-black dark:text-zinc-50">
                    {section.heading}
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {content.disclaimer && (
            <p className="mt-6 text-xs italic text-amber-600 dark:text-amber-400">
              ⚠ {content.disclaimer}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-black/10 p-4 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            Close
          </button>
          {artefact.status !== "approved" && (
            <button
              type="button"
              onClick={() => onApprove(artefact.id)}
              disabled={isApproving}
              className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              {isApproving ? "Approving..." : "Approve"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
