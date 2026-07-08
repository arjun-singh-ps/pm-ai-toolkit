// Data-access layer for the agent_alerts table, plus the pure formatting
// function used to inject an alert's context into an agent's system prompt.

import { getSupabaseServiceClient } from "@/lib/supabase";
import type { AgentAlert, DismissReason } from "@/types/agentAlert";

/** Returns all active (non-dismissed) alerts for a programme, newest first. */
export async function listActiveAlerts(programmeId: string): Promise<AgentAlert[]> {
  const { data, error } = await getSupabaseServiceClient()
    .from("agent_alerts")
    .select("*")
    .eq("programme_id", programmeId)
    .eq("status", "active")
    .order("triggered_at", { ascending: false });

  if (error) throw new Error(`Failed to list alerts: ${error.message}`);
  return data as AgentAlert[];
}

/** Returns one alert by id, or null. */
export async function getAgentAlert(id: string): Promise<AgentAlert | null> {
  const { data, error } = await getSupabaseServiceClient()
    .from("agent_alerts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch alert ${id}: ${error.message}`);
  return data as AgentAlert | null;
}

/** Creates a new active alert. Called by agentEngine when a monitoring agent calls record_alert. */
export async function createAgentAlert(
  programmeId: string,
  agentName: string,
  what: string,
  whyMatters: string[],
  suggestedAction: string
): Promise<AgentAlert> {
  if (!what.trim()) throw new Error("Alert 'what' cannot be empty.");
  if (whyMatters.length === 0) throw new Error("Alert must have at least one 'why_matters' bullet.");

  const { data, error } = await getSupabaseServiceClient()
    .from("agent_alerts")
    .insert({
      programme_id: programmeId,
      agent_name: agentName,
      what: what.trim(),
      why_matters: whyMatters.map((b) => b.trim()).filter(Boolean),
      suggested_action: suggestedAction.trim(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create alert: ${error.message}`);
  return data as AgentAlert;
}

/** Dismisses an alert with a reason. Returns the updated alert. */
export async function dismissAlert(
  id: string,
  dismissedBy: string,
  reason: DismissReason
): Promise<AgentAlert> {
  const { data, error } = await getSupabaseServiceClient()
    .from("agent_alerts")
    .update({
      status: "dismissed",
      dismissed_at: new Date().toISOString(),
      dismissed_by: dismissedBy,
      dismiss_reason: reason,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to dismiss alert ${id}: ${error.message}`);
  return data as AgentAlert;
}

/**
 * Formats an alert into a system-prompt injection string. Pure function — no
 * Supabase calls — so it can be tested independently and called inside the
 * welcome-init branch of agentEngine without an extra async hop.
 */
export function formatAlertForSystemPrompt(alert: AgentAlert): string {
  const bullets = alert.why_matters.map((b) => `- ${b}`).join("\n");
  return [
    "--- Proactive alert context (user opened this agent from an insight card) ---",
    `What was flagged: ${alert.what}`,
    `Why it matters:\n${bullets}`,
    `Suggested action: ${alert.suggested_action}`,
    "Address this alert directly in your opening briefing. Lead with what you found, confirm the data with the programme manager, and recommend the next step. Do not start with a generic introduction.",
    "---",
  ].join("\n");
}
