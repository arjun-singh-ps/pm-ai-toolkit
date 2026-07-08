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
  /**
   * KPI levers this agent is responsible for capturing (e.g. "Quality of Modernisation").
   * When set, the record_kpi tool is injected alongside record_artefact and the agent
   * is expected to ask about and record specific metric values from the conversation.
   */
  kpiLevers?: string[];
  /**
   * When true, the record_alert tool is injected so the agent can surface a proactive
   * insight card on the programme home screen. Only set on monitoring-reactive agents
   * (Signal Watch, Delivery Heartbeat, Cost Compass) that may detect threshold breaches.
   */
  canRecordAlerts?: boolean;
}
