// Decimal-safe cost calculation from Claude token usage. Uses decimal.js
// rather than floating point, per CLAUDE.md's "all financial calculations
// use Decimal" rule — JS floats accumulate rounding error across repeated
// small multiplications/additions, which is unacceptable for cost tracking.

import Decimal from "decimal.js";

// Approximate published Claude Sonnet pricing per million tokens. Verify
// against Anthropic's current pricing page before relying on these for real
// spend reporting — pricing can change.
const INPUT_COST_PER_MILLION_TOKENS = "3.00";
const OUTPUT_COST_PER_MILLION_TOKENS = "15.00";
// Prompt caching (agentEngine.ts uses the default 5-minute ephemeral cache):
// a cache write costs 1.25x base input price, a cache read (hit) costs 0.1x.
const CACHE_WRITE_COST_PER_MILLION_TOKENS = "3.75";
const CACHE_READ_COST_PER_MILLION_TOKENS = "0.30";

/** Returns the cost in USD for a Claude call, as a 6-decimal-place string suitable for a numeric(10,6) column. */
export function calculateCostUsd(
  tokensIn: number,
  tokensOut: number,
  cacheCreationTokens = 0,
  cacheReadTokens = 0
): string {
  const inputCost = new Decimal(tokensIn).dividedBy(1_000_000).times(INPUT_COST_PER_MILLION_TOKENS);
  const outputCost = new Decimal(tokensOut).dividedBy(1_000_000).times(OUTPUT_COST_PER_MILLION_TOKENS);
  const cacheWriteCost = new Decimal(cacheCreationTokens)
    .dividedBy(1_000_000)
    .times(CACHE_WRITE_COST_PER_MILLION_TOKENS);
  const cacheReadCost = new Decimal(cacheReadTokens)
    .dividedBy(1_000_000)
    .times(CACHE_READ_COST_PER_MILLION_TOKENS);
  return inputCost.plus(outputCost).plus(cacheWriteCost).plus(cacheReadCost).toFixed(6);
}
