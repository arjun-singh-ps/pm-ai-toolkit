import { describe, expect, it } from "vitest";
import { formatArtefactSummary } from "@/agents/cross-cutting/artefactSummary";
import type { Artefact } from "@/types/artefact";

function fakeArtefact(overrides: Partial<Artefact> = {}): Artefact {
  return {
    id: "a1",
    programme_id: "p1",
    artefact_name: "Programme Charter",
    phase: "foundation",
    activity: "scope-sprint",
    agent_name: "scope-sprint",
    version: 1,
    status: "draft",
    content: { title: "Programme Charter", sections: [{ heading: "Overview", body: "Some text." }] },
    created_at: new Date().toISOString(),
    approved_at: null,
    approved_by: null,
    ...overrides,
  };
}

describe("formatArtefactSummary", () => {
  it("returns null when there are no artefacts yet", () => {
    expect(formatArtefactSummary([])).toBeNull();
  });

  it("includes the artefact name, status, version, and agent", () => {
    const summary = formatArtefactSummary([fakeArtefact()]);
    expect(summary).toContain("Programme Charter (draft, v1, from scope-sprint)");
    expect(summary).toContain("Overview");
    expect(summary).toContain("Some text.");
  });

  it("sorts approved artefacts before drafts/in-progress", () => {
    const draft = fakeArtefact({ id: "a1", artefact_name: "Draft One", status: "draft" });
    const approved = fakeArtefact({ id: "a2", artefact_name: "Approved One", status: "approved" });
    const summary = formatArtefactSummary([draft, approved]);
    expect(summary!.indexOf("Approved One")).toBeLessThan(summary!.indexOf("Draft One"));
  });

  it("truncates section bodies beyond 500 characters with a marker", () => {
    const longBody = "x".repeat(600);
    const summary = formatArtefactSummary([
      fakeArtefact({ content: { title: "T", sections: [{ heading: "H", body: longBody }] } }),
    ]);
    expect(summary).toContain("[truncated]");
    expect(summary).not.toContain("x".repeat(600));
  });

  it("handles artefacts with no sections gracefully", () => {
    const summary = formatArtefactSummary([fakeArtefact({ content: { title: "T", sections: [] } })]);
    expect(summary).toContain("(no content)");
  });
});
