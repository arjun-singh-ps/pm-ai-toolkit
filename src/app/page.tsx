// Landing page: lists existing programmes and lets the user create a new one.

import Link from "next/link";
import { listProgrammes } from "@/lib/programmes";
import { CreateProgrammeForm } from "@/components/CreateProgrammeForm";

export const dynamic = "force-dynamic";

/** Landing page: programme list + create-programme form. */
export default async function Home() {
  const programmes = await listProgrammes();

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Programmes</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Select a programme to continue, or create a new one below.
          </p>
        </div>

        {programmes.length > 0 && (
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
        )}

        <div>
          <h2 className="mb-4 text-lg font-medium text-black dark:text-zinc-50">New programme</h2>
          <CreateProgrammeForm />
        </div>
      </main>
    </div>
  );
}
