// Server-only: builds Cost Compass's context from the programme's cost_records.
// Aggregates spend by agent so the agent can discuss real numbers without
// needing to query the database itself.

import { getSupabaseServiceClient } from "@/lib/supabase";
import Decimal from "decimal.js";

interface CostRow {
  agent_name: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: string;
  created_at: string;
}

interface AgentSummary {
  agentName: string;
  calls: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: Decimal;
  firstCall: string;
  lastCall: string;
}

/** Fetches and formats this programme's cost records for Cost Compass's context. */
export async function buildCostCompassContext(programmeId: string): Promise<string | null> {
  const { data, error } = await getSupabaseServiceClient()
    .from("cost_records")
    .select("agent_name, tokens_in, tokens_out, cost_usd, created_at")
    .eq("programme_id", programmeId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load cost records: ${error.message}`);
  }

  const rows = (data ?? []) as CostRow[];
  if (rows.length === 0) {
    return "## Cost data\n\nNo spend recorded yet for this programme. Conversations have not started or no tokens have been used.";
  }

  // Aggregate by agent name using Decimal for correctness.
  const byAgent = new Map<string, AgentSummary>();
  for (const row of rows) {
    const existing = byAgent.get(row.agent_name);
    if (existing) {
      existing.calls += 1;
      existing.tokensIn += row.tokens_in;
      existing.tokensOut += row.tokens_out;
      existing.costUsd = existing.costUsd.plus(new Decimal(row.cost_usd));
      existing.lastCall = row.created_at;
    } else {
      byAgent.set(row.agent_name, {
        agentName: row.agent_name,
        calls: 1,
        tokensIn: row.tokens_in,
        tokensOut: row.tokens_out,
        costUsd: new Decimal(row.cost_usd),
        firstCall: row.created_at,
        lastCall: row.created_at,
      });
    }
  }

  const totals = [...byAgent.values()].reduce(
    (acc, s) => ({
      calls: acc.calls + s.calls,
      tokensIn: acc.tokensIn + s.tokensIn,
      tokensOut: acc.tokensOut + s.tokensOut,
      costUsd: acc.costUsd.plus(s.costUsd),
    }),
    { calls: 0, tokensIn: 0, tokensOut: 0, costUsd: new Decimal(0) }
  );

  // Sort by cost descending so the most expensive agents appear first.
  const sorted = [...byAgent.values()].sort((a, b) =>
    b.costUsd.minus(a.costUsd).toNumber()
  );

  const agentLines = sorted
    .map(
      (s) =>
        `  - ${s.agentName}: ${s.calls} call(s), ` +
        `${s.tokensIn.toLocaleString()} tokens in, ${s.tokensOut.toLocaleString()} tokens out, ` +
        `$${s.costUsd.toFixed(4)} USD` +
        ` (${s.firstCall.slice(0, 10)} → ${s.lastCall.slice(0, 10)})`
    )
    .join("\n");

  const firstDate = rows[0].created_at.slice(0, 10);
  const lastDate = rows[rows.length - 1].created_at.slice(0, 10);

  return (
    `## Cost data (${firstDate} to ${lastDate})\n\n` +
    `Total: ${totals.calls} API call(s), ` +
    `${totals.tokensIn.toLocaleString()} tokens in, ` +
    `${totals.tokensOut.toLocaleString()} tokens out, ` +
    `$${totals.costUsd.toFixed(4)} USD\n\n` +
    `By agent (most expensive first):\n${agentLines}`
  );
}
