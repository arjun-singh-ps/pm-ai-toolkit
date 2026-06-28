import { describe, expect, it } from "vitest";
import { getAgent, listAgentsForPhase, FOUNDATION_AGENTS } from "@/agents/registry";

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
});
