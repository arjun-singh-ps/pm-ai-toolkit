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

/**
 * The four monitoring-reactive agents that can be set to proactive mode per programme.
 * `built: false` means the agent exists in the product brief but isn't implemented yet —
 * show it in the toggle UI as disabled so users can see what's coming.
 */
export const MONITORING_AGENTS: { name: string; displayName: string; built: boolean }[] = [
  { name: "delivery-intelligence", displayName: "Delivery Intelligence", built: true  },
  { name: "signal-watch",          displayName: "Signal Watch",          built: true  },
  { name: "delivery-heartbeat",    displayName: "Delivery Heartbeat",    built: true  },
  { name: "cost-compass",          displayName: "Cost Compass",          built: true  },
  { name: "performance-pulse",     displayName: "Performance Pulse",     built: false },
];

/**
 * Synthetic first message sent by ChatPanel when a session is brand new.
 * The agent engine detects this and generates a contextual opening briefing
 * instead of treating it as a normal user turn. Stored in the session but
 * filtered from the chat display — the user never sees or types this string.
 */
export const WELCOME_INIT_MARKER = "__PM_TOOLKIT_WELCOME_INIT__";
