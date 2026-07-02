// TypeScript type for a row in the mcp_integrations table.

export type McpIntegrationType = "jira" | "confluence" | "sharepoint" | "custom";

export interface McpIntegration {
  id: string;
  name: string;
  type: McpIntegrationType;
  server_url: string;
  auth_token: string | null;
  enabled: boolean;
  created_at: string;
}
