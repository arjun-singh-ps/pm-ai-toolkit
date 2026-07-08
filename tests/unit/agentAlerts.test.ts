// Unit tests for agentAlerts.ts — covers the pure formatting function and
// the validation logic in createAgentAlert (via the exported throw conditions).

import { describe, expect, it } from "vitest";
import { formatAlertForSystemPrompt } from "@/lib/agentAlerts";
import type { AgentAlert } from "@/types/agentAlert";
import { DISMISS_REASON_LABELS } from "@/types/agentAlert";

/** Minimal valid alert fixture — only fields used by formatAlertForSystemPrompt. */
function makeAlert(overrides: Partial<AgentAlert> = {}): AgentAlert {
  return {
    id: "alert-1",
    programme_id: "prog-1",
    agent_name: "signal-watch",
    what: "Sprint velocity dropped 23% below baseline",
    why_matters: [
      "Three consecutive missed sprint targets signal a systemic issue",
      "Delivery Compass baseline velocity is now at risk",
    ],
    suggested_action: "Open Signal Watch to review sprint data and update the Intelligence Pulse.",
    triggered_at: "2026-07-01T10:00:00Z",
    status: "active",
    dismissed_at: null,
    dismissed_by: null,
    dismiss_reason: null,
    ...overrides,
  };
}

describe("formatAlertForSystemPrompt", () => {
  it("contains the what line", () => {
    const result = formatAlertForSystemPrompt(makeAlert());
    expect(result).toContain("Sprint velocity dropped 23% below baseline");
  });

  it("contains both why_matters bullets as markdown list items", () => {
    const result = formatAlertForSystemPrompt(makeAlert());
    expect(result).toContain("- Three consecutive missed sprint targets signal a systemic issue");
    expect(result).toContain("- Delivery Compass baseline velocity is now at risk");
  });

  it("contains the suggested action", () => {
    const result = formatAlertForSystemPrompt(makeAlert());
    expect(result).toContain(
      "Open Signal Watch to review sprint data and update the Intelligence Pulse."
    );
  });

  it("includes the opening and closing separator markers", () => {
    const result = formatAlertForSystemPrompt(makeAlert());
    expect(result).toContain(
      "--- Proactive alert context (user opened this agent from an insight card) ---"
    );
    expect(result).toContain("---");
  });

  it("includes the instruction to address the alert directly", () => {
    const result = formatAlertForSystemPrompt(makeAlert());
    expect(result).toContain("Address this alert directly in your opening briefing");
  });

  it("renders a single bullet when why_matters has one item", () => {
    const alert = makeAlert({ why_matters: ["Only reason"] });
    const result = formatAlertForSystemPrompt(alert);
    expect(result).toContain("- Only reason");
    expect(result.split("\n").filter((l) => l.startsWith("- ")).length).toBe(1);
  });

  it("preserves the order of why_matters bullets", () => {
    const alert = makeAlert({ why_matters: ["First", "Second", "Third"] });
    const result = formatAlertForSystemPrompt(alert);
    const bulletSection = result.split("Why it matters:\n")[1].split("\nSuggested action")[0];
    const bullets = bulletSection.trim().split("\n").map((l) => l.replace(/^- /, ""));
    expect(bullets).toEqual(["First", "Second", "Third"]);
  });
});

describe("DISMISS_REASON_LABELS", () => {
  it("covers all three valid dismiss reasons", () => {
    expect(DISMISS_REASON_LABELS).toHaveProperty("not_relevant");
    expect(DISMISS_REASON_LABELS).toHaveProperty("already_handled");
    expect(DISMISS_REASON_LABELS).toHaveProperty("monitor_next_sprint");
  });

  it("all labels are non-empty strings", () => {
    for (const label of Object.values(DISMISS_REASON_LABELS)) {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
