// Landing page: lists active programmes with Monzo-style cards, shows archived
// programmes on demand, and provides a create form.

import Link from "next/link";
import { listProgrammes, listArchivedProgrammes } from "@/lib/programmes";
import { CreateProgrammeForm } from "@/components/CreateProgrammeForm";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ showArchived?: string }>;
}

const PERSONA_LABEL: Record<string, string> = {
  legacy: "Modernising Legacy",
  agentic: "Agentic Delivery",
};

const PHASE_LABEL: Record<string, string> = {
  foundation: "Foundation",
  forge: "Forge",
  amplify: "Amplify",
  envision: "Envision",
  shape: "Shape",
  incubate: "Incubate",
  prove: "Prove",
  scale: "Scale",
};

export default async function Home({ searchParams }: HomeProps) {
  const { showArchived } = await searchParams;
  const showingArchived = showArchived === "true";

  const programmes = await listProgrammes();
  const archivedProgrammes = showingArchived ? await listArchivedProgrammes() : [];
  const archivedCount = showingArchived
    ? archivedProgrammes.length
    : (await listArchivedProgrammes()).length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--navy)" }}>
          Your programmes
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Select a programme to continue, or start a new one.
        </p>
      </div>

      {/* Active programmes */}
      {programmes.length > 0 ? (
        <ul className="flex flex-col gap-3 mb-6">
          {programmes.map((programme) => (
            <li key={programme.id}>
              <Link
                href={`/programme/${programme.id}`}
                className="group flex items-center gap-4 rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                style={{
                  background: "var(--surface)",
                  boxShadow: "var(--shadow-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Persona colour strip */}
                <div
                  className="h-10 w-1.5 flex-shrink-0 rounded-full"
                  style={{
                    background:
                      programme.persona === "legacy"
                        ? "var(--coral)"
                        : "#8B5CF6",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-semibold"
                    style={{ color: "var(--navy)" }}
                  >
                    {programme.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        background:
                          programme.persona === "legacy"
                            ? "var(--coral-light)"
                            : "#EDE9FE",
                        color:
                          programme.persona === "legacy"
                            ? "var(--coral)"
                            : "#7C3AED",
                      }}
                    >
                      {PERSONA_LABEL[programme.persona] ?? programme.persona}
                    </span>
                    <span style={{ color: "var(--text-muted)" }} className="text-xs">
                      {PHASE_LABEL[programme.active_phase] ?? programme.active_phase} phase
                    </span>
                  </div>
                </div>
                <svg
                  className="flex-shrink-0 opacity-30 transition-opacity group-hover:opacity-60"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  style={{ color: "var(--text-primary)" }}
                >
                  <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="mb-6 rounded-2xl p-8 text-center"
          style={{
            background: "var(--surface)",
            border: "1px dashed var(--border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No programmes yet. Create your first one below.
          </p>
        </div>
      )}

      {/* Archived toggle */}
      {archivedCount > 0 && (
        <div className="mb-8">
          <Link
            href={showingArchived ? "/" : "/?showArchived=true"}
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--coral)" }}
          >
            {showingArchived
              ? "Hide archived"
              : `View ${archivedCount} archived programme${archivedCount > 1 ? "s" : ""}`}
          </Link>

          {showingArchived && archivedProgrammes.length > 0 && (
            <ul className="mt-3 flex flex-col gap-3">
              {archivedProgrammes.map((programme) => (
                <li key={programme.id}>
                  <Link
                    href={`/programme/${programme.id}`}
                    className="flex items-center gap-4 rounded-2xl p-5 opacity-60 transition-all hover:opacity-80"
                    style={{
                      background: "var(--surface)",
                      boxShadow: "var(--shadow-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="h-10 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: "var(--border)" }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold" style={{ color: "var(--navy)" }}>
                          {programme.name}
                        </p>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{
                            background: "var(--bg)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          Archived
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {PERSONA_LABEL[programme.persona]} · {PHASE_LABEL[programme.active_phase]}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Create new */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--border)",
        }}
      >
        <h2 className="mb-4 font-semibold" style={{ color: "var(--navy)" }}>
          Start a new programme
        </h2>
        <CreateProgrammeForm />
      </div>
    </div>
  );
}
