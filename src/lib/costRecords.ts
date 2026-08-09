// Data-access layer for the cost_records table.

import { getSupabaseServiceClient } from "@/lib/supabase";
import { calculateCostUsd } from "@/lib/cost";

/**
 * Records the token usage and decimal-safe cost of one Claude call.
 * `tokensIn` is stored as the full input-side token count — regular input
 * plus any cache write/read tokens — so it still reflects the true size of
 * context processed even when most of it was served from cache. `cost_usd`
 * is priced per-category (cache writes/reads are billed differently from a
 * normal input token — see cost.ts), so it stays accurate regardless of the
 * cache hit rate.
 */
export async function recordCost(
  programmeId: string,
  agentName: string,
  tokensIn: number,
  tokensOut: number,
  cacheCreationTokens = 0,
  cacheReadTokens = 0
): Promise<void> {
  const { error } = await getSupabaseServiceClient().from("cost_records").insert({
    programme_id: programmeId,
    agent_name: agentName,
    tokens_in: tokensIn + cacheCreationTokens + cacheReadTokens,
    tokens_out: tokensOut,
    cost_usd: calculateCostUsd(tokensIn, tokensOut, cacheCreationTokens, cacheReadTokens),
  });

  if (error) {
    throw new Error(`Failed to record cost: ${error.message}`);
  }
}
