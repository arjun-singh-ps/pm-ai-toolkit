import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/agentEngine";
import { getAgent } from "@/agents/registry";
import type { Programme } from "@/types/programme";

const scopeSprintAgent = getAgent("scope-sprint")!;

function fakeProgramme(overrides: Partial<Programme> = {}): Programme {
  return {
    id: "p1",
    name: "Test Programme",
    client: null,
    persona: "legacy",
    active_phase: "foundation",
    regulatory_frameworks: [],
    notes: "",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("buildSystemPrompt", () => {
  it("includes programme name, persona, and phase", () => {
    const prompt = buildSystemPrompt(scopeSprintAgent, fakeProgramme());
    expect(prompt).toContain("Programme name: Test Programme");
    expect(prompt).toContain("Persona: legacy");
    expect(prompt).toContain("Phase: foundation");
  });

  it("includes the agent's own system prompt", () => {
    const prompt = buildSystemPrompt(scopeSprintAgent, fakeProgramme());
    expect(prompt).toContain("You are Scope Sprint");
  });

  it("omits optional fields when not set, and includes them when set", () => {
    const withoutExtras = buildSystemPrompt(scopeSprintAgent, fakeProgramme());
    expect(withoutExtras).not.toContain("Client:");
    expect(withoutExtras).not.toContain("Programme notes:");

    const withExtras = buildSystemPrompt(
      scopeSprintAgent,
      fakeProgramme({ client: "Acme Bank", notes: "Mid-implementation phase." })
    );
    expect(withExtras).toContain("Client: Acme Bank");
    expect(withExtras).toContain("Programme notes: Mid-implementation phase.");
  });
});
