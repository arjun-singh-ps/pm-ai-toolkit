import { describe, expect, it } from "vitest";
import { buildRoadmap, PHASE_ORDER } from "@/lib/phaseRoadmap";
import type { Artefact } from "@/types/artefact";

function fakeArtefact(overrides: Partial<Artefact> & Pick<Artefact, "artefact_name" | "agent_name" | "status">): Artefact {
  return {
    id: overrides.artefact_name,
    programme_id: "p1",
    phase: "foundation",
    activity: "",
    version: 1,
    content: {},
    created_at: new Date(0).toISOString(),
    approved_at: null,
    approved_by: null,
    ...overrides,
  };
}

describe("PHASE_ORDER", () => {
  it("orders each persona's phases in delivery sequence", () => {
    expect(PHASE_ORDER.legacy).toEqual(["foundation", "forge", "amplify"]);
    expect(PHASE_ORDER.agentic).toEqual(["envision", "shape", "incubate", "prove", "scale"]);
  });
});

describe("buildRoadmap", () => {
  it("marks phases before the active one as completed and later ones as upcoming", async () => {
    const roadmap = await buildRoadmap("p1", "legacy", "forge", []);
    const byPhase = Object.fromEntries(roadmap.map((p) => [p.phase, p.status]));

    expect(byPhase.foundation).toBe("completed");
    expect(byPhase.forge).toBe("current");
    expect(byPhase.amplify).toBe("upcoming");
  });

  it("marks an agent approved only once every artefact it produces is approved", async () => {
    const artefacts = [
      fakeArtefact({ artefact_name: "Programme Charter", agent_name: "scope-sprint", status: "approved" }),
      fakeArtefact({ artefact_name: "Pilot Shortlist", agent_name: "scope-sprint", status: "approved" }),
      fakeArtefact({ artefact_name: "Value Scorecard", agent_name: "scope-sprint", status: "draft" }),
    ];

    const roadmap = await buildRoadmap("p1", "legacy", "foundation", artefacts);
    const foundation = roadmap.find((p) => p.phase === "foundation")!;
    const scopeSprint = foundation.agents.find((a) => a.name === "scope-sprint")!;

    expect(scopeSprint.status).toBe("in_progress");
  });

  it("marks a later agent locked until its dependency's artefacts are all approved", async () => {
    const roadmap = await buildRoadmap("p1", "legacy", "foundation", []);
    const foundation = roadmap.find((p) => p.phase === "foundation")!;
    const estateMapping = foundation.agents.find((a) => a.name === "estate-mapping")!;

    expect(estateMapping.status).toBe("locked");
  });

  it("still surfaces a completed phase's agents as approved for browsing after the programme has moved on", async () => {
    const artefactToAgent: Record<string, string> = {
      "Programme Charter": "scope-sprint",
      "Pilot Shortlist": "scope-sprint",
      "Value Scorecard": "scope-sprint",
      "Modernisation Blueprint": "estate-mapping",
      "Delivery Compass": "estate-mapping",
      "Platform Readiness Report": "infrastructure-blueprint",
      "Intelligence Fabric": "knowledge-forge",
      "Delivery Backlog": "backlog-architecture",
      "Command Centre": "delivery-intelligence",
      "Signal Engine": "delivery-intelligence",
      "Quality Covenant": "delivery-intelligence",
      "RAID Register": "delivery-intelligence",
      "Forge Charter": "launch-readiness",
      "Crew Blueprint": "launch-readiness",
      "Forge Compass": "launch-readiness",
    };
    const allFoundationApproved = Object.entries(artefactToAgent).map(([name, agentName]) =>
      fakeArtefact({ artefact_name: name, agent_name: agentName, status: "approved" })
    );

    const roadmap = await buildRoadmap("p1", "legacy", "forge", allFoundationApproved);
    const foundation = roadmap.find((p) => p.phase === "foundation")!;

    expect(foundation.status).toBe("completed");
    expect(foundation.approvedCount).toBe(foundation.totalCount);
  });
});
