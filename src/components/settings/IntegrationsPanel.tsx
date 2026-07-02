// Client component: list and manage MCP integrations in the Settings page.
// Fetches from /api/integrations, allows add / enable-toggle / delete.

"use client";

import { useEffect, useState } from "react";
import type { McpIntegration, McpIntegrationType } from "@/types/mcpIntegration";

const TYPE_LABELS: Record<McpIntegrationType, string> = {
  jira: "Jira",
  confluence: "Confluence",
  sharepoint: "SharePoint",
  custom: "Custom MCP",
};

const TYPE_COLORS: Record<McpIntegrationType, string> = {
  jira: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  confluence: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  sharepoint: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  custom: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const EMPTY_FORM = { name: "", type: "jira" as McpIntegrationType, server_url: "", auth_token: "" };

/** Interactive panel for managing MCP server integrations. */
export function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState<McpIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/integrations");
      const data = await res.json();
      setIntegrations(data.integrations ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          server_url: form.server_url,
          auth_token: form.auth_token || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to add integration.");
        return;
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    setTogglingId(id);
    try {
      await fetch(`/api/integrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      await load();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/integrations/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading integrations...</p>
      ) : integrations.length === 0 && !showForm ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No integrations configured yet. Add one below to give every agent live access to
          your tools.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {integrations.map((integration) => (
            <li
              key={integration.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-black/10 p-4 dark:border-white/10"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-black dark:text-zinc-50">
                    {integration.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[integration.type]}`}
                  >
                    {TYPE_LABELS[integration.type]}
                  </span>
                  {!integration.enabled && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {integration.server_url}
                </p>
                {integration.auth_token && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Auth token set</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleToggle(integration.id, !integration.enabled)}
                  disabled={togglingId === integration.id}
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5"
                >
                  {togglingId === integration.id
                    ? "..."
                    : integration.enabled
                      ? "Disable"
                      : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(integration.id)}
                  disabled={deletingId === integration.id}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {deletingId === integration.id ? "..." : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={(e) => void handleAdd(e)} className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm font-medium text-black dark:text-zinc-50">Add integration</p>

          {formError && (
            <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500" htmlFor="int-name">Name</label>
            <input
              id="int-name"
              type="text"
              required
              placeholder="e.g. Our Jira"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500" htmlFor="int-type">Type</label>
            <select
              id="int-type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as McpIntegrationType }))}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {(Object.entries(TYPE_LABELS) as [McpIntegrationType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500" htmlFor="int-url">MCP server URL</label>
            <input
              id="int-url"
              type="url"
              required
              placeholder="https://your-mcp-server.example.com"
              value={form.server_url}
              onChange={(e) => setForm((f) => ({ ...f, server_url: e.target.value }))}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600"
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Must be publicly accessible — Anthropic&apos;s servers connect to this URL, not your browser.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500" htmlFor="int-token">
              Auth token <span className="text-zinc-400">(optional)</span>
            </label>
            <input
              id="int-token"
              type="password"
              placeholder="Bearer token or API key"
              value={form.auth_token}
              onChange={(e) => setForm((f) => ({ ...f, auth_token: e.target.value }))}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
            >
              {isSaving ? "Adding..." : "Add integration"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null); }}
              className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-600 hover:bg-black/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="self-start rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          + Add integration
        </button>
      )}
    </div>
  );
}
