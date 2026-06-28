"use client";

import { useEffect, useState } from "react";
import { getProjectContext, setProjectContext } from "@/lib/projectContext";

/**
 * Lets the user set project context once (e.g. programme type, methodology,
 * delivery phase). It's automatically prepended to every prompt generation
 * so each template doesn't need to ask for the same background every time.
 */
export default function SettingsPage() {
  const [context, setContext] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setContext(getProjectContext());
  }, []);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setProjectContext(context);
    setSavedAt(new Date().toLocaleString());
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Project Context
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Set background context once (e.g. delivery methodology, regulatory
            environment, programme phase). It will be added to every prompt you
            generate, so you don&apos;t need to repeat it each time.
          </p>
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            Do not include client names, programme names, or financial data —
            this is stored only in your browser, but treat it the same as any
            other prompt input.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <textarea
            rows={6}
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="e.g. Agile delivery, regulated UK retail banking environment, mid-implementation phase."
            className="rounded-md border border-black/10 bg-white p-3 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />

          <button
            type="submit"
            className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Save context
          </button>

          {savedAt && (
            <p className="text-sm text-zinc-500">Saved at {savedAt}</p>
          )}
        </form>
      </main>
    </div>
  );
}
