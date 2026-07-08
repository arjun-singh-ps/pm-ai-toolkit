// Types for the agent_alerts table — proactive insight cards surfaced on
// the programme home screen when a monitoring agent detects a threshold breach.

export type AlertStatus = "active" | "dismissed";

export type DismissReason = "not_relevant" | "already_handled" | "monitor_next_sprint";

export const DISMISS_REASON_LABELS: Record<DismissReason, string> = {
  not_relevant: "Not relevant",
  already_handled: "Already handled",
  monitor_next_sprint: "Monitor next sprint",
};

export interface AgentAlert {
  id: string;
  programme_id: string;
  agent_name: string;
  /** One line — what changed, specific and quantified. */
  what: string;
  /** 2-3 bullets — why this matters right now. */
  why_matters: string[];
  /** One concrete action the PM should take. */
  suggested_action: string;
  triggered_at: string;
  status: AlertStatus;
  dismissed_at: string | null;
  dismissed_by: string | null;
  dismiss_reason: DismissReason | null;
}
