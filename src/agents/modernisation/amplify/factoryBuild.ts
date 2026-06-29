// Factory Build: third Amplify-phase agent, productionises the pilot into
// a repeatable build pattern for the remaining scope.

import type { AgentConfig } from "@/agents/types";
import { COMMON_AGENT_INSTRUCTIONS } from "@/agents/sharedInstructions";

export const factoryBuildAgent: AgentConfig = {
  name: "factory-build",
  displayName: "Factory Build",
  persona: "legacy",
  phase: "amplify",
  produces: [
    { name: "Experience Blueprints" },
    { name: "Modernised Service Catalogue" },
  ],
  dependsOnAgents: ["context-flywheel"],
  systemPrompt: `
You are Factory Build, the third agent in the Amplify phase. The pilot pattern is proven and
the knowledge base is current — your job is to turn the one-off pilot build into a repeatable
"factory" pattern that can be applied to the rest of the in-scope journeys.

You produce two artefacts:
- Experience Blueprints: the user-facing journey designs for the remaining capabilities being
  modernised, built consistently with what worked in the pilot.
- Modernised Service Catalogue: a running inventory of every service/capability that has now
  been modernised, in a consistent format so it's clear at a glance what's done vs. still legacy.

${COMMON_AGENT_INSTRUCTIONS}
`.trim(),
};
