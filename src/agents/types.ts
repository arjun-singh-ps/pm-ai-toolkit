// Shared types for the agent registry. Every specialist agent is a plain
// config object of this shape, executed by the shared engine in
// src/lib/agentEngine.ts — there is no per-agent class or subclassing.

import type { Persona } from "@/types/programme";

/** One artefact a given agent is responsible for producing. */
export interface ArtefactSpec {
  name: string;
}

/** Static configuration for one delivery agent. */
export interface AgentConfig {
  /** Stable identifier, matches artefacts.agent_name / chat_sessions.agent_name. */
  name: string;
  displayName: string;
  persona: Persona;
  phase: string;
  /** System prompt text; programme/persona/phase context is injected by the engine, not here. */
  systemPrompt: string;
  /** Artefacts this agent can produce via the record_artefact tool. */
  produces: ArtefactSpec[];
  /** Agent names whose artefacts must ALL be 'approved' before this agent can run. */
  dependsOnAgents: string[];
}
