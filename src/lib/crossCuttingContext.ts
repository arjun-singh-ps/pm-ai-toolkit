// Server-only: maps an agent name to its portfolio-wide context builder, if
// any. Imported only by agentEngine.ts (server-only) — never by
// src/agents/registry.ts, which client components import directly. This is
// what keeps each cross-cutting agent's specific data source (artefacts for
// Governance Guardian, cost_records for a future Cost Compass, etc.) out of
// both the shared engine and the client-reachable registry.

import { buildGovernanceGuardianContext } from "@/lib/governanceGuardianContext";

const CONTEXT_BUILDERS: Record<string, (programmeId: string) => Promise<string | null>> = {
  "governance-guardian": buildGovernanceGuardianContext,
};

/** Returns extra system-prompt context for agents that need it, or null for agents that don't. */
export async function getExtraContext(agentName: string, programmeId: string): Promise<string | null> {
  const builder = CONTEXT_BUILDERS[agentName];
  return builder ? builder(programmeId) : null;
}
