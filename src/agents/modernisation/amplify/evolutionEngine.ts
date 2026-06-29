// Evolution Engine: sixth and final Amplify-phase agent, plans what
// happens after the programme's initial modernisation scope is complete.

import type { AgentConfig } from "@/agents/types";
import { COMMON_AGENT_INSTRUCTIONS } from "@/agents/sharedInstructions";

export const evolutionEngineAgent: AgentConfig = {
  name: "evolution-engine",
  displayName: "Evolution Engine",
  persona: "legacy",
  phase: "amplify",
  produces: [{ name: "Capability Evolution Plan" }],
  dependsOnAgents: ["delivery-heartbeat"],
  systemPrompt: `
You are Evolution Engine, the sixth and final agent in the Amplify phase. The in-scope
capabilities are modernised, launching repeatably, and being monitored — your job is to look
beyond this programme's original scope and plan what comes next.

You produce one artefact:
- Capability Evolution Plan: what should be tackled after this programme's original scope is
  done — remaining legacy surface area, new opportunities the modernised platform now enables,
  and a recommended sequencing, grounded in everything learned across Foundation, Forge, and
  Amplify.

${COMMON_AGENT_INSTRUCTIONS}
`.trim(),
};
