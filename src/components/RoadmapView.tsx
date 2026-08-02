// Client-side timeline + phase browser for the Roadmap page. Selecting a
// completed or current phase shows its agents read-only; upcoming phases
// aren't selectable since they have no reachable agents yet. Never mutates
// programme.active_phase — that only changes via the Gate tab's Advance
// button.

"use client";

import { useState } from "react";
import Link from "next/link";
import type { RoadmapPhase } from "@/lib/phaseRoadmap";

interface RoadmapViewProps {
  programmeId: string;
  phases: RoadmapPhase[];
}

const AGENT_STATUS_DOT: Record<string, string> = {
  approved: "var(--green)",
  in_progress: "var(--blue)",
  pending: "var(--border)",
  locked: "var(--border)",
};

const AGENT_STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  in_progress: "In progress",
  pending: "Not started",
  locked: "Locked",
};

function phaseLabel(phase: string): string {
  return phase[0].toUpperCase() + phase.slice(1);
}

export function RoadmapView({ programmeId, phases }: RoadmapViewProps) {
  const defaultSelected = phases.find((p) => p.status === "current")?.phase ?? phases[0]?.phase;
  const [selected, setSelected] = useState<string | undefined>(defaultSelected);

  const selectedPhase = phases.find((p) => p.phase === selected);

  return (
    <div className="flex flex-col gap-6">
      {/* Timeline */}
      <div className="flex items-start overflow-x-auto pb-2">
        {phases.map((p, index) => {
          const clickable = p.status !== "upcoming";
          const isSelected = p.phase === selected;

          return (
            <div key={p.phase} className="flex items-start flex-shrink-0">
              {index > 0 && (
                <div
                  className="mt-4 h-0.5 w-8 sm:w-14"
                  style={{ background: p.status === "upcoming" ? "var(--border)" : "var(--green)" }}
                />
              )}
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && setSelected(p.phase)}
                title={clickable ? undefined : "This phase hasn't started yet"}
                className="flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-colors disabled:cursor-not-allowed"
                style={{ background: isSelected ? "var(--coral-light)" : "transparent" }}
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background:
                      p.status === "completed"
                        ? "var(--green)"
                        : p.status === "current"
                          ? "var(--coral)"
                          : "var(--bg)",
                    color: p.status === "upcoming" ? "var(--text-muted)" : "#fff",
                    border: p.status === "upcoming" ? "1px solid var(--border)" : "none",
                  }}
                >
                  {p.status === "completed" ? "✓" : index + 1}
                </span>
                <span
                  className="text-xs font-semibold whitespace-nowrap"
                  style={{ color: p.status === "upcoming" ? "var(--text-muted)" : "var(--navy)" }}
                >
                  {phaseLabel(p.phase)}
                </span>
                <span className="text-[10px] whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  {p.status === "current" ? "Current" : p.status === "completed" ? "Complete" : "Not started"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected phase detail */}
      {selectedPhase && (
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
              {phaseLabel(selectedPhase.phase)} phase
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {selectedPhase.approvedCount}/{selectedPhase.totalCount} agents complete
              {selectedPhase.status !== "current" ? " · viewing read-only, this is not the live phase" : ""}
            </p>
          </div>

          {selectedPhase.agents.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              This phase has no agents yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedPhase.agents.map((agent) => (
                <li
                  key={agent.name}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ background: AGENT_STATUS_DOT[agent.status] }}
                    />
                    <span className="truncate text-sm font-medium" style={{ color: "var(--navy)" }}>
                      {agent.displayName}
                    </span>
                  </div>
                  {agent.status === "locked" ? (
                    <span
                      className="flex-shrink-0 text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                      title={agent.reason}
                    >
                      {AGENT_STATUS_LABEL[agent.status]}
                    </span>
                  ) : (
                    <Link
                      href={`/programme/${programmeId}/agents/${agent.name}`}
                      className="flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-medium transition-colors hover:opacity-80"
                      style={{ background: "var(--surface)", color: "var(--navy)", border: "1px solid var(--border)" }}
                    >
                      Open
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
