// Settings page: MCP integrations (add/enable/disable/delete) and regulatory
// framework reference. Per-programme settings live on the programme screen itself.

import { REGULATORY_FRAMEWORKS } from "@/lib/constants";
import { IntegrationsPanel } from "@/components/settings/IntegrationsPanel";

/** Settings page: MCP integrations and regulatory framework reference. */
export default function SettingsPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Settings</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Configure tool integrations available to all agents, and review available regulatory frameworks.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
              MCP integrations
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Connect Jira, Confluence, SharePoint, or any MCP-compatible server. Enabled integrations
              are passed to every agent when it runs — Claude can use them to pull live data (Jira
              tickets, Confluence pages, etc.) while generating artefacts. The MCP server URL must
              be publicly accessible; internal instances behind a VPN need a hosted proxy.
            </p>
          </div>
          <IntegrationsPanel />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-400">
            Regulatory frameworks
          </h2>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            Available frameworks a programme can select at setup. The Governance Guardian agent
            reviews artefacts against whichever of these the programme has selected.
          </p>
          <ul className="flex flex-wrap gap-2">
            {REGULATORY_FRAMEWORKS.map((framework) => (
              <li
                key={framework}
                className="rounded-full border border-black/10 px-3 py-1 text-sm text-zinc-700 dark:border-white/10 dark:text-zinc-300"
              >
                {framework}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
