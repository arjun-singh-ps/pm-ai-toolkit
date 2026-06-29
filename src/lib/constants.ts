// Shared constants used across the agent/artefact architecture.

import type { Persona } from "@/types/programme";

/** Regulatory frameworks selectable at programme setup, per CLAUDE.md's Governance Guardian spec. */
export const REGULATORY_FRAMEWORKS = [
  "PRA",
  "FCA",
  "ECB/SSM",
  "SR 11-7",
  "EBA Guidelines",
  "DORA",
  "ISO 42001",
  "Client Custom",
] as const;

/** The phase a new programme starts in, per persona. */
export const INITIAL_PHASE_BY_PERSONA: Record<Persona, string> = {
  legacy: "foundation",
  agentic: "envision",
};

/** The phase that follows each phase, once its gate is clear. */
export const NEXT_PHASE: Record<string, string> = {
  foundation: "forge",
  forge: "amplify",
};
