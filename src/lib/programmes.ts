// Data-access layer for the programmes table. API routes and server
// components both call these instead of touching Supabase directly.

import { getSupabaseServiceClient } from "@/lib/supabase";
import { INITIAL_PHASE_BY_PERSONA } from "@/lib/constants";
import type { CreateProgrammeInput, Programme } from "@/types/programme";

/** Returns every programme, most recently created first. */
export async function listProgrammes(): Promise<Programme[]> {
  const { data, error } = await getSupabaseServiceClient()
    .from("programmes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list programmes: ${error.message}`);
  }

  return data as Programme[];
}

/** Returns one programme by id, or null if it doesn't exist. */
export async function getProgramme(id: string): Promise<Programme | null> {
  const { data, error } = await getSupabaseServiceClient()
    .from("programmes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch programme ${id}: ${error.message}`);
  }

  return data as Programme | null;
}

/** Creates a programme, setting its starting phase from the chosen persona. */
export async function createProgramme(input: CreateProgrammeInput): Promise<Programme> {
  const { data, error } = await getSupabaseServiceClient()
    .from("programmes")
    .insert({
      name: input.name,
      client: input.client ?? null,
      persona: input.persona,
      active_phase: INITIAL_PHASE_BY_PERSONA[input.persona],
      regulatory_frameworks: input.regulatoryFrameworks ?? [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create programme: ${error.message}`);
  }

  return data as Programme;
}

/** Updates editable fields on a programme (e.g. notes, active_phase). */
export async function updateProgramme(
  id: string,
  patch: Partial<Pick<Programme, "notes" | "active_phase" | "regulatory_frameworks">>
): Promise<Programme> {
  const { data, error } = await getSupabaseServiceClient()
    .from("programmes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update programme ${id}: ${error.message}`);
  }

  return data as Programme;
}
