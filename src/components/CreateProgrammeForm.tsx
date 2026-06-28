// Client form for creating a new programme from the landing page.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGULATORY_FRAMEWORKS } from "@/lib/constants";
import type { Persona } from "@/types/programme";

/** Lets the user create a programme (name, client, persona, regulatory frameworks) and navigates into it. */
export function CreateProgrammeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [persona, setPersona] = useState<Persona>("legacy");
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Toggles one regulatory framework in the selected list. */
  function toggleFramework(framework: string) {
    setFrameworks((current) =>
      current.includes(framework)
        ? current.filter((item) => item !== framework)
        : [...current, framework]
    );
  }

  /** Submits the new programme and navigates to its shell once created. */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, client: client || undefined, persona, regulatoryFrameworks: frameworks }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to create programme.");
        return;
      }

      router.push(`/programme/${data.programme.id}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-black dark:text-zinc-50">
          Programme name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-md border border-black/10 bg-white p-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="client" className="text-sm font-medium text-black dark:text-zinc-50">
          Client (optional)
        </label>
        <input
          id="client"
          value={client}
          onChange={(event) => setClient(event.target.value)}
          className="rounded-md border border-black/10 bg-white p-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-black dark:text-zinc-50">Persona</legend>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="radio"
            name="persona"
            checked={persona === "legacy"}
            onChange={() => setPersona("legacy")}
          />
          Modernising Legacy Journey
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="radio"
            name="persona"
            checked={persona === "agentic"}
            onChange={() => setPersona("agentic")}
          />
          Agentic Delivery (not yet available)
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-black dark:text-zinc-50">
          Regulatory frameworks (optional)
        </legend>
        <div className="flex flex-wrap gap-3">
          {REGULATORY_FRAMEWORKS.map((framework) => (
            <label key={framework} className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={frameworks.includes(framework)}
                onChange={() => toggleFramework(framework)}
              />
              {framework}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || persona === "agentic"}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {isSubmitting ? "Creating..." : "Create programme"}
      </button>
    </form>
  );
}
