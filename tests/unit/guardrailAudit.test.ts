// Automated first-pass checks for the four-field guardrail framework.
// These tests do NOT replace the human audit in docs/guardrails/AUDIT.md —
// they catch complete field absence (FAIL) but cannot detect generic content (PARTIAL).
// Run on demand: npx vitest run tests/unit/guardrailAudit.test.ts
// After guardrail rewrites are applied, promote to the standard test suite as a CI gate.

import { describe, it, expect } from "vitest";
import {
  FOUNDATION_AGENTS,
  FORGE_AGENTS,
  AMPLIFY_AGENTS,
  ENVISION_AGENTS,
  SHAPE_AGENTS,
  INCUBATE_AGENTS,
  PROVE_AGENTS,
  SCALE_AGENTS,
  CROSS_CUTTING_AGENTS,
} from "@/agents/registry";
import { COMMON_AGENT_INSTRUCTIONS } from "@/agents/sharedInstructions";
import type { AgentConfig } from "@/agents/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALL_AGENTS: AgentConfig[] = [
  ...CROSS_CUTTING_AGENTS,
  ...FOUNDATION_AGENTS,
  ...FORGE_AGENTS,
  ...AMPLIFY_AGENTS,
  ...ENVISION_AGENTS,
  ...SHAPE_AGENTS,
  ...INCUBATE_AGENTS,
  ...PROVE_AGENTS,
  ...SCALE_AGENTS,
];

/** Returns the portion of a systemPrompt that is agent-specific (strips common text). */
function agentSpecific(agent: AgentConfig): string {
  return agent.systemPrompt.replace(COMMON_AGENT_INSTRUCTIONS, "").trim();
}

/**
 * Field 1 — Never.
 * Agent-specific section must contain at least one "never" or "must not" prohibition
 * beyond what COMMON_AGENT_INSTRUCTIONS already provides.
 * Note: COMMON already says "never refuse to continue" — this strips it, so any remaining
 * "never" is agent-specific.
 */
function hasNeverField(agent: AgentConfig): boolean {
  const s = agentSpecific(agent);
  return /\bnever\b|\bmust not\b/i.test(s);
}

/**
 * Field 2 — Always check.
 * Agent-specific section must name an explicit verification step before generating.
 * Patterns: "before producing/generating/drafting/recording",
 * "only record/produce when/if/after", "if no [data/artefact/framework] exists".
 */
function hasAlwaysCheckField(agent: AgentConfig): boolean {
  const s = agentSpecific(agent);
  return (
    /\bbefore (producing|generating|drafting|recording|writing|adding)\b/i.test(s) ||
    /\bonly (record|produce|generate|call|add).{0,60}(when|if|after|until)\b/i.test(s) ||
    /\bif (no |there is no|nothing|the programme has no|no artefact|no framework|no data|no spend)\b/i.test(s) ||
    /\bmust (check|verify|confirm)\b/i.test(s) ||
    /\bconfirm (that|the|which|whether)\b/i.test(s)
  );
}

/**
 * Field 3 — Audience.
 * Agent-specific section must name at least one specific audience role and the decision
 * that output feeds. Generic "programme manager" alone does not count — it must be
 * qualified or accompanied by other named roles.
 */
function hasAudienceField(agent: AgentConfig): boolean {
  const s = agentSpecific(agent).toLowerCase();
  const specificRoles = [
    "steering committee",
    "steerco",
    "board",
    "programme board",
    "risk committee",
    "sponsor",
    "delivery team",
    "operations team",
    "pioneer users",
    "user group",
    "all-hands",
    "end users",
    "cro",
    "cfo",
    "cto",
    "chief",
    "investment committee",
    "compliance team",
    "legal team",
    "dpo",
    "engineering team",
    "technical lead",
    "technical architect",
    "qa lead",
    "change manager",
    "change director",
    "hr",
    "all stakeholders",
    "auditor",
    "regulator",
    "senior sponsor",
    "programme manager who", // qualified, not bare
    "budget holder",
    "release committee",
    "model risk",
    "governance board",
  ];
  // Scale advisers explicitly mark their audience
  if (agent.phase === "scale" && /\badviser\b/i.test(s)) return true;
  return specificRoles.some((role) => s.includes(role));
}

/**
 * Field 4 — Good output.
 * For artefact-producing agents: must contain a concrete structural indicator
 * (schema, required-field list, or rejection/comparison example).
 * Scale advisers (produces: []) are exempt from this field.
 */
function hasGoodOutputField(agent: AgentConfig): boolean {
  if (agent.produces.length === 0) return true; // Scale advisers exempt
  const s = agentSpecific(agent);
  return (
    /each (entry|item|row|record|artefact|section) (should|must) include\b/i.test(s) ||
    /must (include|contain|cover|state|name|show|have)\b/i.test(s) ||
    /ID,\s*(description|owner)/i.test(s) ||
    /\(1\).+\(2\).+\(3\)/s.test(s) || // numbered list of required components
    /a bad .+\na good /i.test(s) || // rejection + good example
    /a well-formed/i.test(s) ||
    /score and a (one-paragraph|brief|short)/i.test(s) ||
    /at least one row per/i.test(s) ||
    /three columns:/i.test(s)
  );
}

// ── Suite 1: basic schema (always enforced) ───────────────────────────────────

describe("Agent registry — basic schema", () => {
  it("total registered agent count matches expected", () => {
    // 4 cross-cutting + 7 foundation + 3 forge + 6 amplify
    // + 2 envision + 3 shape + 3 incubate + 3 prove + 4 scale = 35
    expect(ALL_AGENTS).toHaveLength(35);
  });

  it.each(ALL_AGENTS)("$name has a non-trivial systemPrompt (>200 chars)", (agent) => {
    expect(agent.systemPrompt.length).toBeGreaterThan(200);
  });

  it.each(ALL_AGENTS)(
    "$name has a systemPrompt that differs from COMMON_AGENT_INSTRUCTIONS alone",
    (agent) => {
      const specific = agentSpecific(agent);
      expect(specific.length).toBeGreaterThan(50);
    }
  );

  it.each(ALL_AGENTS)(
    "$name is either a scale adviser (produces:[]) or produces at least one artefact",
    (agent) => {
      const isScaleAdviser = agent.phase === "scale";
      expect(isScaleAdviser || agent.produces.length > 0).toBe(true);
    }
  );

  it.each(ALL_AGENTS)("$name has a stable name matching kebab-case", (agent) => {
    expect(agent.name).toMatch(/^[a-z0-9-]+$/);
  });

  it.each(ALL_AGENTS)(
    "$name cross-cutting agents use phase:'cross-cutting' sentinel",
    (agent) => {
      if (CROSS_CUTTING_AGENTS.includes(agent)) {
        expect(agent.phase).toBe("cross-cutting");
      }
    }
  );
});

// ── Suite 2: four-field guardrail checks ────────────────────────────────────
// These tests reflect the current state of the agents. Most will FAIL until the
// rewrites from docs/guardrails/AUDIT.md are applied. Running them on demand
// gives a live view of which agents have been updated.

describe("Field 1 — Never (agent-specific prohibition)", () => {
  it.each(ALL_AGENTS)(
    "$name has an agent-specific 'never' or 'must not' prohibition",
    (agent) => {
      const pass = hasNeverField(agent);
      expect(
        pass,
        `${agent.name} (${agent.phase}): no agent-specific 'never' prohibition found. ` +
          `Add a 'Never:' section before \${COMMON_AGENT_INSTRUCTIONS}. ` +
          `See docs/guardrails/AUDIT.md §3 for the proposed rewrite.`
      ).toBe(true);
    }
  );
});

describe("Field 2 — Always check (verification before generating)", () => {
  it.each(ALL_AGENTS)(
    "$name has an explicit check or pre-condition before generating",
    (agent) => {
      const pass = hasAlwaysCheckField(agent);
      expect(
        pass,
        `${agent.name} (${agent.phase}): no explicit pre-generation check found. ` +
          `Add a 'Before generating:' section. ` +
          `See docs/guardrails/AUDIT.md §3 for the proposed rewrite.`
      ).toBe(true);
    }
  );
});

describe("Field 3 — Audience (named role and decision)", () => {
  it.each(ALL_AGENTS)("$name names a specific audience beyond 'programme manager'", (agent) => {
    const pass = hasAudienceField(agent);
    expect(
      pass,
      `${agent.name} (${agent.phase}): no named audience role found. ` +
        `Add an 'Audience:' section naming who uses this output and what decision it feeds. ` +
        `See docs/guardrails/AUDIT.md §3 for the proposed rewrite.`
    ).toBe(true);
  });
});

describe("Field 4 — Good output (schema or rejection example)", () => {
  it.each(ALL_AGENTS.filter((a) => a.produces.length > 0))(
    "$name defines concrete output structure for at least one artefact",
    (agent) => {
      const pass = hasGoodOutputField(agent);
      expect(
        pass,
        `${agent.name} (${agent.phase}): no concrete output schema or rejection example found. ` +
          `Add a 'Good output:' section with required fields, a schema, or a bad/good example. ` +
          `See docs/guardrails/AUDIT.md §3 for the proposed rewrite.`
      ).toBe(true);
    }
  );
});

// ── Suite 3: banking-context non-negotiables ──────────────────────────────────

describe("Banking-context: financial agents must prohibit floating-point accumulation", () => {
  const financialAgents = ALL_AGENTS.filter(
    (a) =>
      a.name === "cost-compass" ||
      a.name === "performance-pulse" ||
      a.produces.some((p) => p.name.toLowerCase().includes("cost"))
  );

  it.each(financialAgents)(
    "$name prohibits floating-point financial calculation OR uses decimal language",
    (agent) => {
      const s = agentSpecific(agent).toLowerCase();
      const hasDecimalReference =
        s.includes("decimal") ||
        s.includes("floating-point") ||
        s.includes("floating point") ||
        s.includes("two decimal") ||
        s.includes("exact figure");
      expect(
        hasDecimalReference,
        `${agent.name}: financial agent with no decimal/floating-point guardrail. ` +
          `Add a prohibition on floating-point arithmetic. ` +
          `See docs/guardrails/AUDIT.md §3 for the proposed rewrite.`
      ).toBe(true);
    }
  );
});

describe("Banking-context: compliance agents must name regulatory frameworks", () => {
  const complianceAgents = ALL_AGENTS.filter(
    (a) =>
      a.name === "governance-guardian" ||
      a.name === "governance-engine" ||
      a.name === "agent-foundations" ||
      a.produces.some(
        (p) =>
          p.name.toLowerCase().includes("compliance") ||
          p.name.toLowerCase().includes("governance") ||
          p.name.toLowerCase().includes("responsible ai")
      )
  );

  const frameworkTerms = ["pra", "fca", "dora", "sr 11-7", "eba", "iso 42001", "ecb"];

  it.each(complianceAgents)(
    "$name references at least one banking regulatory framework by name",
    (agent) => {
      const s = agent.systemPrompt.toLowerCase();
      const hasFramework = frameworkTerms.some((term) => s.includes(term));
      expect(
        hasFramework,
        `${agent.name}: compliance/governance agent with no specific regulatory framework cited. ` +
          `Must name at least one of: PRA, FCA, DORA, SR 11-7, EBA, ISO 42001, ECB/SSM. ` +
          `See docs/guardrails/AUDIT.md §3 for the proposed rewrite.`
      ).toBe(true);
    }
  );
});

describe("Banking-context: alert-capable agents must require confirmed data", () => {
  const alertAgents = ALL_AGENTS.filter((a) => a.canRecordAlerts === true);

  it.each(alertAgents)(
    "$name that can record_alert requires confirmed data before triggering",
    (agent) => {
      const s = agentSpecific(agent).toLowerCase();
      const hasConfirmationGuard =
        s.includes("never record an alert") ||
        s.includes("only (call|trigger|use) record_alert") ||
        s.includes("confirmed") ||
        s.includes("explicit");
      expect(
        hasConfirmationGuard,
        `${agent.name}: has canRecordAlerts:true but no explicit confirmation requirement ` +
          `before triggering alerts. ` +
          `See docs/guardrails/AUDIT.md §3 for the proposed rewrite.`
      ).toBe(true);
    }
  );
});

// ── Suite 4: OWASP ASI structural checks ────────────────────────────────────
// These test for the presence of guardrails that address specific ASI categories.
// They check for keyword patterns only — a human reviewer must confirm quality.

describe("ASI02 — Tool Misuse: KPI-recording agents must require explicit PM confirmation", () => {
  const kpiAgents = ALL_AGENTS.filter((a) => a.kpiLevers && a.kpiLevers.length > 0);

  it.each(kpiAgents)(
    "$name has an explicit 'only record confirmed values' guard for record_kpi",
    (agent) => {
      const s = agent.systemPrompt.toLowerCase();
      const hasGuard =
        s.includes("only record") ||
        s.includes("explicitly confirmed") ||
        s.includes("has explicitly confirmed") ||
        s.includes("confirmed with a number") ||
        s.includes("confirmed numbers") ||
        s.includes("confirmed value");
      expect(
        hasGuard,
        `${agent.name}: has kpiLevers but no explicit confirmation guard for record_kpi. ` +
          `Add: "Only record a KPI value the programme manager has explicitly confirmed."`
      ).toBe(true);
    }
  );
});

describe("ASI06 — Context Poisoning: Knowledge Forge must require source attribution", () => {
  it("knowledge-forge requires source attribution for Intelligence Fabric entries", () => {
    const agent = ALL_AGENTS.find((a) => a.name === "knowledge-forge");
    expect(agent).toBeDefined();
    const s = agentSpecific(agent!).toLowerCase();
    const hasAttributionGuard = s.includes("source") || s.includes("attribution") || s.includes("cited");
    expect(
      hasAttributionGuard,
      "knowledge-forge: Intelligence Fabric is injected as context into downstream agents. " +
        "Every entry must have source attribution to prevent context poisoning. " +
        "See docs/guardrails/AUDIT.md §3.2 agent 8 for the proposed rewrite."
    ).toBe(true);
  });
});

describe("ASI09 — Trust Exploitation: governance/compliance artefacts must include limits disclaimer", () => {
  it("governance-guardian systemPrompt contains a limits or disclaimer instruction", () => {
    const agent = ALL_AGENTS.find((a) => a.name === "governance-guardian");
    expect(agent).toBeDefined();
    const s = agentSpecific(agent!).toLowerCase();
    const hasLimits =
      s.includes("not a legal opinion") ||
      s.includes("limits") ||
      s.includes("qualified") ||
      s.includes("disclaimer") ||
      s.includes("does not substitute");
    expect(
      hasLimits,
      "governance-guardian: produces authoritative-looking compliance artefacts (ASI09). " +
        "Must include instructions to state the limits of the AI assessment. " +
        "See docs/guardrails/AUDIT.md §3.1 agent 1 for the proposed rewrite."
    ).toBe(true);
  });
});
