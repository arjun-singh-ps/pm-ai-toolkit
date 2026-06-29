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
import { pilotIgnitionAgent } from "@/agents/modernisation/forge/pilotIgnition";
import { signalWatchAgent } from "@/agents/modernisation/forge/signalWatch";
import { scaleBlueprintAgent } from "@/agents/modernisation/forge/scaleBlueprint";
import { backlogPulseAgent } from "@/agents/modernisation/amplify/backlogPulse";
import { contextFlywheelAgent } from "@/agents/modernisation/amplify/contextFlywheel";
import { factoryBuildAgent } from "@/agents/modernisation/amplify/factoryBuild";
import { launchRunwayAgent } from "@/agents/modernisation/amplify/launchRunway";
import { deliveryHeartbeatAgent } from "@/agents/modernisation/amplify/deliveryHeartbeat";
import { evolutionEngineAgent } from "@/agents/modernisation/amplify/evolutionEngine";
import { governanceGuardianAgent } from "@/agents/cross-cutting/governanceGuardian";

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

/** Forge-phase agents, same linear-dependency convention as Foundation. */
export const FORGE_AGENTS: AgentConfig[] = [pilotIgnitionAgent, signalWatchAgent, scaleBlueprintAgent];

/** Amplify-phase agents, same linear-dependency convention as Foundation and Forge. */
export const AMPLIFY_AGENTS: AgentConfig[] = [
  backlogPulseAgent,
  contextFlywheelAgent,
  factoryBuildAgent,
  launchRunwayAgent,
  deliveryHeartbeatAgent,
  evolutionEngineAgent,
];

/**
 * Cross-cutting agents: available regardless of phase, surfaced via the
 * header button rather than the phase-scoped sidebar. `phase:
 * "cross-cutting"` on these configs never matches a real
 * programme.active_phase, so listAgentsForPhase below never returns them —
 * any future "list a programme's available agents" code must filter
 * `phase === "cross-cutting"` directly, not reuse listAgentsForPhase.
 */
export const CROSS_CUTTING_AGENTS: AgentConfig[] = [governanceGuardianAgent];

const ALL_AGENTS: AgentConfig[] = [
  ...FOUNDATION_AGENTS,
  ...FORGE_AGENTS,
  ...AMPLIFY_AGENTS,
  ...CROSS_CUTTING_AGENTS,
];

const REGISTRY: Record<string, AgentConfig> = Object.fromEntries(
  ALL_AGENTS.map((agent) => [agent.name, agent])
);

/** Looks up one agent config by its stable name, or null if it doesn't exist (yet). */
export function getAgent(name: string): AgentConfig | null {
  return REGISTRY[name] ?? null;
}

/** Returns every agent config for a given persona + phase, in build order. */
export function listAgentsForPhase(persona: Persona, phase: string): AgentConfig[] {
  return ALL_AGENTS.filter((agent) => agent.persona === persona && agent.phase === phase);
}
