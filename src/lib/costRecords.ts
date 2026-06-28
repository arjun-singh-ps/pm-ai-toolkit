// Data-access layer for the cost_records table.

import { getSupabaseServiceClient } from "@/lib/supabase";
import { calculateCostUsd } from "@/lib/cost";

/** Records the token usage and decimal-safe cost of one Claude call. */
export async function recordCost(
  programmeId: string,
  agentName: string,
  tokensIn: number,
  tokensOut: number
): Promise<void> {
  const { error } = await getSupabaseServiceClient().from("cost_records").insert({
    programme_id: programmeId,
    agent_name: agentName,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost_usd: calculateCostUsd(tokensIn, tokensOut),
  });

  if (error) {
    throw new Error(`Failed to record cost: ${error.message}`);
  }
}
