import { describe, expect, it } from "vitest";
import { canRunAgent, isPhaseGateClear, type ArtefactStatusRow } from "@/lib/gating";

function fakeFetcher(rows: ArtefactStatusRow[]) {
  return async (_programmeId: string, artefactNames: string[]) =>
    rows.filter((row) => artefactNames.includes(row.artefact_name));
}

describe("canRunAgent", () => {
  it("allows an agent with no dependencies", async () => {
    const result = await canRunAgent("p1", "scope-sprint", fakeFetcher([]));
    expect(result.allowed).toBe(true);
  });

  it("blocks an agent whose dependency artefacts are not all approved", async () => {
    const result = await canRunAgent(
      "p1",
      "estate-mapping",
      fakeFetcher([
        { artefact_name: "Programme Charter", status: "approved" },
        { artefact_name: "Pilot Shortlist", status: "draft" },
        { artefact_name: "Value Scorecard", status: "approved" },
      ])
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Pilot Shortlist");
  });

  it("allows an agent once all dependency artefacts are approved", async () => {
    const result = await canRunAgent(
      "p1",
      "estate-mapping",
      fakeFetcher([
        { artefact_name: "Programme Charter", status: "approved" },
        { artefact_name: "Pilot Shortlist", status: "approved" },
        { artefact_name: "Value Scorecard", status: "approved" },
      ])
    );
    expect(result.allowed).toBe(true);
  });

  it("blocks an unknown agent name", async () => {
    const result = await canRunAgent("p1", "does-not-exist", fakeFetcher([]));
    expect(result.allowed).toBe(false);
  });
});

describe("isPhaseGateClear", () => {
  it("is not clear when no artefacts exist yet", async () => {
    const result = await isPhaseGateClear("p1", "legacy", "foundation", fakeFetcher([]));
    expect(result.clear).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it("is clear once every Foundation artefact is approved", async () => {
    const allApproved: ArtefactStatusRow[] = [
      "Programme Charter",
      "Pilot Shortlist",
      "Value Scorecard",
      "Modernisation Blueprint",
      "Delivery Compass",
      "Platform Readiness Report",
      "Intelligence Fabric",
      "Delivery Backlog",
      "Command Centre",
      "Signal Engine",
      "Quality Covenant",
      "Forge Charter",
      "Crew Blueprint",
      "Forge Compass",
    ].map((name) => ({ artefact_name: name, status: "approved" }));

    const result = await isPhaseGateClear("p1", "legacy", "foundation", fakeFetcher(allApproved));
    expect(result.clear).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("generalizes to the Forge phase's artefact set", async () => {
    const allApproved: ArtefactStatusRow[] = [
      "Pilot Intelligence Pack",
      "Steel Thread Proof",
      "Adoption Accelerator",
      "Intelligence Pulse",
      "Scale Compass",
      "Operations Playbook",
    ].map((name) => ({ artefact_name: name, status: "approved" }));

    const clearResult = await isPhaseGateClear("p1", "legacy", "forge", fakeFetcher(allApproved));
    expect(clearResult.clear).toBe(true);

    const incompleteResult = await isPhaseGateClear(
      "p1",
      "legacy",
      "forge",
      fakeFetcher(allApproved.slice(0, -1))
    );
    expect(incompleteResult.clear).toBe(false);
    expect(incompleteResult.missing).toEqual(["Operations Playbook"]);
  });
});
