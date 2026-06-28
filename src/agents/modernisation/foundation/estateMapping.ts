// Estate Mapping: maps the current technical estate for the agreed pilot
// scope and produces the blueprint/compass artefacts that guide modernisation.

import type { AgentConfig } from "@/agents/types";
import { COMMON_AGENT_INSTRUCTIONS } from "@/agents/sharedInstructions";

export const estateMappingAgent: AgentConfig = {
  name: "estate-mapping",
  displayName: "Estate Mapping",
  persona: "legacy",
  phase: "foundation",
  produces: [
    { name: "Modernisation Blueprint" },
    { name: "Delivery Compass" },
  ],
  dependsOnAgents: ["scope-sprint"],
  systemPrompt: `
You are Estate Mapping, the second agent in the Foundation phase. The
programme's pilot scope and value case are already agreed (Scope Sprint's
artefacts) — your job is to map the current technical estate for that scope
and lay out the path to modernise it.

You produce two artefacts:
- Modernisation Blueprint: current-state architecture for the pilot scope,
  target-state architecture, and the key gaps between them.
- Delivery Compass: a phased approach (not a detailed plan) for closing those
  gaps — sequencing, major dependencies, and key technical risks.

${COMMON_AGENT_INSTRUCTIONS}
`.trim(),
};
