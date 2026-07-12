// Client form for creating a new programme from the landing page.
// Monzo-style inputs, coral submit button, persona as styled radio cards.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGULATORY_FRAMEWORKS } from "@/lib/constants";
import type { Persona } from "@/types/programme";

const inputClass = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2";
const inputStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--navy)",
};
const labelClass = "text-xs font-semibold uppercase tracking-wider";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass} style={{ color: "var(--text-muted)" }}>
          Programme name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Core Banking Modernisation"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="client" className={labelClass} style={{ color: "var(--text-muted)" }}>
          Client (optional)
        </label>
        <input
          id="client"
          value={client}
          onChange={(event) => setClient(event.target.value)}
          placeholder="e.g. Barclays"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Persona selector */}
      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass} style={{ color: "var(--text-muted)" }}>
          Persona
        </legend>
        <div className="flex flex-col gap-2">
          {(
            [
              { value: "legacy", label: "Modernising Legacy Journey", available: true },
              { value: "agentic", label: "Agentic Delivery", available: true },
            ] as const
          ).map(({ value, label, available }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-all"
              style={{
                background: persona === value ? "var(--coral-light)" : "var(--bg)",
                border: `1px solid ${persona === value ? "var(--coral)" : "var(--border)"}`,
                opacity: available ? 1 : 0.5,
              }}
            >
              <input
                type="radio"
                name="persona"
                checked={persona === value}
                onChange={() => available && setPersona(value)}
                disabled={!available}
                className="accent-[var(--coral)]"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                  {label}
                </p>
                {!available && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Coming soon
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Regulatory frameworks */}
      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass} style={{ color: "var(--text-muted)" }}>
          Regulatory frameworks (optional)
        </legend>
        <div className="flex flex-wrap gap-2">
          {REGULATORY_FRAMEWORKS.map((framework) => (
            <label
              key={framework}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={
                frameworks.includes(framework)
                  ? { background: "var(--coral)", color: "#fff" }
                  : {
                      background: "var(--bg)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }
              }
            >
              <input
                type="checkbox"
                checked={frameworks.includes(framework)}
                onChange={() => toggleFramework(framework)}
                className="sr-only"
              />
              {framework}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--coral)" }}
      >
        {isSubmitting ? "Creating…" : "Create programme"}
      </button>
    </form>
  );
}
