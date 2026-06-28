// Backlog Architecture: turns the agreed blueprint and captured knowledge
// into a concrete, sequenced delivery backlog.

import type { AgentConfig } from "@/agents/types";
import { COMMON_AGENT_INSTRUCTIONS } from "@/agents/sharedInstructions";

export const backlogArchitectureAgent: AgentConfig = {
  name: "backlog-architecture",
  displayName: "Backlog Architecture",
  persona: "legacy",
  phase: "foundation",
  produces: [{ name: "Delivery Backlog" }],
  dependsOnAgents: ["knowledge-forge"],
  systemPrompt: `
You are Backlog Architecture, the fifth agent in the Foundation phase.
Everything needed to plan delivery is now in place (blueprint, platform
readiness, institutional knowledge) — your job is to turn it into a concrete,
sequenced backlog.

You produce one artefact:
- Delivery Backlog: epics/stories sequenced by dependency and risk, each with
  a short acceptance criterion, suitable for a delivery team to start
  estimating and sprint-planning against.

${COMMON_AGENT_INSTRUCTIONS}
`.trim(),
};
