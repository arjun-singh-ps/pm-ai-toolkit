// Landing page: lists active programmes, optionally shows archived ones,
// and lets the user create a new one.

import Link from "next/link";
import { listProgrammes, listArchivedProgrammes } from "@/lib/programmes";
import { CreateProgrammeForm } from "@/components/CreateProgrammeForm";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ showArchived?: string }>;
}

/** Landing page: active programme list, optional archived section, create form. */
export default async function Home({ searchParams }: HomeProps) {
  const { showArchived } = await searchParams;
  const showingArchived = showArchived === "true";

  const [programmes, archivedProgrammes] = await Promise.all([
    listProgrammes(),
    showingArchived ? listArchivedProgrammes() : Promise.resolve([]),
  ]);

  const archivedCount = showingArchived
    ? archivedProgrammes.length
    : (await listArchivedProgrammes()).length;

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Programmes</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Select a programme to continue, or create a new one below.
          </p>
        </div>

        {programmes.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {programmes.map((programme) => (
              <li key={programme.id}>
                <Link
                  href={`/programme/${programme.id}`}
                  className="block rounded-lg border border-black/10 bg-white p-4 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/20"
                >
                  <h2 className="font-medium text-black dark:text-zinc-50">{programme.name}</h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">
                    {programme.persona === "legacy" ? "Modernising Legacy Journey" : "Agentic Delivery"}
                    {" · "}
                    {programme.active_phase}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No active programmes yet — create one below.
          </p>
        )}

        {/* Archived programmes toggle */}
        {archivedCount > 0 && (
          <div>
            <Link
              href={showingArchived ? "/" : "/?showArchived=true"}
              className="text-sm text-zinc-400 underline-offset-2 hover:underline dark:text-zinc-500"
            >
              {showingArchived
                ? "Hide archived programmes"
                : `View ${archivedCount} archived programme${archivedCount > 1 ? "s" : ""}`}
            </Link>

            {showingArchived && archivedProgrammes.length > 0 && (
              <ul className="mt-3 flex flex-col gap-3">
                {archivedProgrammes.map((programme) => (
                  <li key={programme.id}>
                    <Link
                      href={`/programme/${programme.id}`}
                      className="block rounded-lg border border-black/10 bg-white p-4 opacity-60 transition-colors hover:border-black/20 hover:opacity-80 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/20"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="font-medium text-black dark:text-zinc-50">{programme.name}</h2>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          Archived
                        </span>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">
                        {programme.persona === "legacy" ? "Modernising Legacy Journey" : "Agentic Delivery"}
                        {" · "}
                        {programme.active_phase}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div>
          <h2 className="mb-4 text-lg font-medium text-black dark:text-zinc-50">New programme</h2>
          <CreateProgrammeForm />
        </div>
      </main>
    </div>
  );
}
