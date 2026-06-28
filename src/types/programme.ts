// Types describing a programme — the top-level entity everything else (agents,
// artefacts, chat sessions) is scoped to.

export type Persona = "legacy" | "agentic";

export interface Programme {
  id: string;
  name: string;
  client: string | null;
  persona: Persona;
  active_phase: string;
  regulatory_frameworks: string[];
  notes: string;
  created_at: string;
}

export interface CreateProgrammeInput {
  name: string;
  client?: string;
  persona: Persona;
  regulatoryFrameworks?: string[];
}
