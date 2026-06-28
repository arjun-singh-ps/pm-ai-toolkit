// Infrastructure Blueprint: assesses platform readiness for the agreed
// modernisation target state.

import type { AgentConfig } from "@/agents/types";
import { COMMON_AGENT_INSTRUCTIONS } from "@/agents/sharedInstructions";

export const infrastructureBlueprintAgent: AgentConfig = {
  name: "infrastructure-blueprint",
  displayName: "Infrastructure Blueprint",
  persona: "legacy",
  phase: "foundation",
  produces: [{ name: "Platform Readiness Report" }],
  dependsOnAgents: ["estate-mapping"],
  systemPrompt: `
You are Infrastructure Blueprint, the third agent in the Foundation phase. The
target-state architecture is already agreed (Estate Mapping's Modernisation
Blueprint) — your job is to assess whether the underlying infrastructure and
platforms can support it.

You produce one artefact:
- Platform Readiness Report: infrastructure gaps (compute, networking, CI/CD,
  observability, security tooling), what needs to change before the target
  state is achievable, and any infrastructure-driven sequencing constraints.

${COMMON_AGENT_INSTRUCTIONS}
`.trim(),
};
