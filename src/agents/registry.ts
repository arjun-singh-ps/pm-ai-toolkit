// Central lookup for every agent config. The UI nav, gating logic, and chat
// API route all read agent metadata from here — never hardcode an agent list
// elsewhere.

import type { AgentConfig } from "@/agents/types";
import type { Persona } from "@/types/programme";
import { scopeSprintAgent } from "@/agents/modernisation/foundation/scopeSprint";
import { estateMappingAgent } from "@/agents/modernisation/foundation/estateMapping";
import { infrastructureBlueprintAgent } from "@/agents/modernisation/foundation/infrastructureBlueprint";
import { knowledgeForgeAgent } from "@/agents/modernisation/foundation/knowledgeForge";
import { backlogArchitectureAgent } from "@/agents/modernisation/foundation/backlogArchitecture";
import { deliveryIntelligenceAgent } from "@/agents/modernisation/foundation/deliveryIntelligence";
import { launchReadinessAgent } from "@/agents/modernisation/foundation/launchReadiness";

/**
 * Foundation-phase agents in their required completion order. This list is
 * also the dependency chain: agent N depends on agent N-1 (see each config's
 * dependsOnAgents).
 */
export const FOUNDATION_AGENTS: AgentConfig[] = [
  scopeSprintAgent,
  estateMappingAgent,
  infrastructureBlueprintAgent,
  knowledgeForgeAgent,
  backlogArchitectureAgent,
  deliveryIntelligenceAgent,
  launchReadinessAgent,
];

const REGISTRY: Record<string, AgentConfig> = Object.fromEntries(
  FOUNDATION_AGENTS.map((agent) => [agent.name, agent])
);

/** Looks up one agent config by its stable name, or null if it doesn't exist (yet). */
export function getAgent(name: string): AgentConfig | null {
  return REGISTRY[name] ?? null;
}

/** Returns every agent config for a given persona + phase, in build order. */
export function listAgentsForPhase(persona: Persona, phase: string): AgentConfig[] {
  return FOUNDATION_AGENTS.filter((agent) => agent.persona === persona && agent.phase === phase);
}
