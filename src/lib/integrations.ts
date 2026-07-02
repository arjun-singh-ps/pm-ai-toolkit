// Server-only functions for reading and writing mcp_integrations rows.
// Called by API routes (never imported by client components).

import { getSupabaseServiceClient } from "@/lib/supabase";
import type { McpIntegration, McpIntegrationType } from "@/types/mcpIntegration";

/** Returns all MCP integrations, ordered by created_at ascending. */
export async function listIntegrations(): Promise<McpIntegration[]> {
  const { data, error } = await getSupabaseServiceClient()
    .from("mcp_integrations")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as McpIntegration[];
}

/** Returns only enabled integrations — used by the agent engine at call time. */
export async function getActiveIntegrations(): Promise<McpIntegration[]> {
  const { data, error } = await getSupabaseServiceClient()
    .from("mcp_integrations")
    .select("*")
    .eq("enabled", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as McpIntegration[];
}

/** Creates a new MCP integration. Returns the created row. */
export async function createIntegration(params: {
  name: string;
  type: McpIntegrationType;
  server_url: string;
  auth_token: string | null;
}): Promise<McpIntegration> {
  const { data, error } = await getSupabaseServiceClient()
    .from("mcp_integrations")
    .insert(params)
    .select()
    .single();

  if (error) throw error;
  return data as McpIntegration;
}

/** Toggles an integration's enabled state. Returns the updated row. */
export async function setIntegrationEnabled(id: string, enabled: boolean): Promise<McpIntegration> {
  const { data, error } = await getSupabaseServiceClient()
    .from("mcp_integrations")
    .update({ enabled })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as McpIntegration;
}

/** Deletes an integration. Throws if not found. */
export async function deleteIntegration(id: string): Promise<void> {
  const { error } = await getSupabaseServiceClient()
    .from("mcp_integrations")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
