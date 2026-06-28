import Link from "next/link";
import { getAllTemplates } from "@/lib/prompts";

/** Homepage: lists every available prompt template for the user to browse. */
export default function Home() {
  const templates = getAllTemplates();

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Prompt Templates
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Select a template to generate a governance, risk, or reporting artefact.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {templates.map((template) => (
            <li key={template.slug}>
              <Link
                href={`/templates/${template.slug}`}
                className="block rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/20"
              >
                <h2 className="font-medium text-black dark:text-zinc-50">
                  {template.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {template.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wide text-zinc-400">
                  {template.variables.length} input
                  {template.variables.length === 1 ? "" : "s"} required
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
