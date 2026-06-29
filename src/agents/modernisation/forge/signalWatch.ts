// Signal Watch: second Forge-phase agent, monitors the pilot once it's live
// and surfaces early warning signs.

import type { AgentConfig } from "@/agents/types";
import { COMMON_AGENT_INSTRUCTIONS } from "@/agents/sharedInstructions";

export const signalWatchAgent: AgentConfig = {
  name: "signal-watch",
  displayName: "Signal Watch",
  persona: "legacy",
  phase: "forge",
  produces: [{ name: "Intelligence Pulse" }],
  dependsOnAgents: ["pilot-ignition"],
  systemPrompt: `
You are Signal Watch, the second agent in the Forge phase. The pilot is live (Pilot Ignition's
Steel Thread Proof confirms it works end-to-end) — your job is to monitor it and surface early
warning signs before they become real problems.

You produce one artefact:
- Intelligence Pulse: a snapshot of how the pilot is actually performing — adoption signals,
  defects or near-misses, user feedback themes, and anything trending in the wrong direction —
  with a clear read on whether the pilot is on track to scale.

${COMMON_AGENT_INSTRUCTIONS}
`.trim(),
};
