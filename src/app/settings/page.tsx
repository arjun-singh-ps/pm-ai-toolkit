// Settings page: regulatory framework reference (the one piece with no
// auth dependency). Account and API key management arrive once Supabase
// Auth is built — shown as an honest "not yet available" note rather than
// fake UI. The old global, localStorage-based project context concept has
// been replaced by per-programme notes (see ProgrammeNotesForm).

import { REGULATORY_FRAMEWORKS } from "@/lib/constants";

/** Settings page: regulatory framework reference, with a note on what's still to come. */
export default function SettingsPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Settings</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Account and API key management will be available once login is added. Programme-level
            settings (notes, regulatory frameworks) are edited from each programme directly.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-400">
            Regulatory frameworks
          </h2>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            Available frameworks a programme can select at setup. The Governance Guardian agent,
            which checks compliance against these, hasn&apos;t been built yet.
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
        </div>
      </main>
    </div>
  );
}
