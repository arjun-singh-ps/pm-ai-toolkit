import { describe, expect, it } from "vitest";
import {
  getAgent,
  listAgentsForPhase,
  FOUNDATION_AGENTS,
  FORGE_AGENTS,
  AMPLIFY_AGENTS,
} from "@/agents/registry";

describe("agent registry", () => {
  it("contains all 7 Foundation agents in build order", () => {
    expect(FOUNDATION_AGENTS.map((agent) => agent.name)).toEqual([
      "scope-sprint",
      "estate-mapping",
      "infrastructure-blueprint",
      "knowledge-forge",
      "backlog-architecture",
      "delivery-intelligence",
      "launch-readiness",
    ]);
  });

  it("forms a strict linear dependency chain", () => {
    FOUNDATION_AGENTS.forEach((agent, index) => {
      if (index === 0) {
        expect(agent.dependsOnAgents).toEqual([]);
      } else {
        expect(agent.dependsOnAgents).toEqual([FOUNDATION_AGENTS[index - 1].name]);
      }
    });
  });

  it("getAgent finds an existing agent and returns null for an unknown one", () => {
    expect(getAgent("scope-sprint")?.displayName).toBe("Scope Sprint");
    expect(getAgent("does-not-exist")).toBeNull();
  });

  it("listAgentsForPhase returns all 7 Foundation agents for the legacy persona", () => {
    expect(listAgentsForPhase("legacy", "foundation")).toHaveLength(7);
    expect(listAgentsForPhase("agentic", "envision")).toHaveLength(0);
  });

  it("contains all 3 Forge agents in build order", () => {
    expect(FORGE_AGENTS.map((agent) => agent.name)).toEqual([
      "pilot-ignition",
      "signal-watch",
      "scale-blueprint",
    ]);
  });

  it("Forge's first agent has no dependency, then forms a strict linear chain", () => {
    expect(FORGE_AGENTS[0].dependsOnAgents).toEqual([]);
    FORGE_AGENTS.slice(1).forEach((agent, index) => {
      expect(agent.dependsOnAgents).toEqual([FORGE_AGENTS[index].name]);
    });
  });

  it("listAgentsForPhase returns all 3 Forge agents for the legacy persona", () => {
    expect(listAgentsForPhase("legacy", "forge")).toHaveLength(3);
  });

  it("contains all 6 Amplify agents in build order", () => {
    expect(AMPLIFY_AGENTS.map((agent) => agent.name)).toEqual([
      "backlog-pulse",
      "context-flywheel",
      "factory-build",
      "launch-runway",
      "delivery-heartbeat",
      "evolution-engine",
    ]);
  });

  it("Amplify's first agent has no dependency, then forms a strict linear chain", () => {
    expect(AMPLIFY_AGENTS[0].dependsOnAgents).toEqual([]);
    AMPLIFY_AGENTS.slice(1).forEach((agent, index) => {
      expect(agent.dependsOnAgents).toEqual([AMPLIFY_AGENTS[index].name]);
    });
  });

  it("listAgentsForPhase returns all 6 Amplify agents for the legacy persona", () => {
    expect(listAgentsForPhase("legacy", "amplify")).toHaveLength(6);
  });
});
