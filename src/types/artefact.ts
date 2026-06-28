// Types describing an artefact — a named deliverable one agent produces,
// reviewed and approved by the user before it counts toward a phase gate.

export type ArtefactStatus = "draft" | "in_progress" | "approved";

export interface Artefact {
  id: string;
  programme_id: string;
  artefact_name: string;
  phase: string;
  activity: string;
  agent_name: string;
  version: number;
  status: ArtefactStatus;
  content: Record<string, unknown>;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}
