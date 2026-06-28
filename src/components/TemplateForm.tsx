"use client";

import { useEffect, useState } from "react";
import { fillTemplate } from "@/lib/fillTemplate";
import { getProjectContext } from "@/lib/projectContext";
import { getLastSaved, saveLastOutput, type SavedOutput } from "@/lib/savedOutputs";
import type { PromptTemplate } from "@/types/prompt";

interface TemplateFormProps {
  template: PromptTemplate;
}

/**
 * Renders one input per template variable. "Preview prompt" substitutes
 * values into {{placeholders}} locally, prefixed with the user's saved
 * project context. "Generate with Claude" sends that same prompt to the
 * /api/generate route. "Save to history" stores the output the user
 * explicitly approves, so it can be retrieved again later.
 */
export function TemplateForm({ template }: TemplateFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<SavedOutput | null>(null);

  useEffect(() => {
    setLastSaved(getLastSaved(template.slug));
  }, [template.slug]);

  function handleChange(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function buildPrompt(): string {
    const context = getProjectContext().trim();
    const filled = fillTemplate(template.body, values);
    return context ? `Project context: ${context}\n\n${filled}` : filled;
  }

  function handlePreview(event: React.FormEvent) {
    event.preventDefault();
    setPreview(buildPrompt());
    setOutput(null);
    setError(null);
  }

  async function handleGenerate() {
    const prompt = buildPrompt();
    setPreview(prompt);
    setOutput(null);
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to generate output.");
        return;
      }

      setOutput(data.output);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave() {
    if (!output) {
      return;
    }

    setLastSaved(saveLastOutput(template.slug, output));
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handlePreview} className="flex flex-col gap-4">
        {template.variables.map((variable) => (
          <div key={variable.name} className="flex flex-col gap-1">
            <label
              htmlFor={variable.name}
              className="text-sm font-medium text-black dark:text-zinc-50"
            >
              {variable.label}
            </label>
            <textarea
              id={variable.name}
              name={variable.name}
              required
              rows={2}
              value={values[variable.name] ?? ""}
              onChange={(event) => handleChange(variable.name, event.target.value)}
              className="rounded-md border border-black/10 bg-white p-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        ))}

        <div className="flex gap-3">
          <button
            type="submit"
            className="self-start rounded-full border border-black/10 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            Preview prompt
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isGenerating ? "Generating..." : "Generate with Claude"}
          </button>
        </div>
      </form>

      {preview && !output && (
        <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-400">
            Preview
          </h2>
          <pre className="whitespace-pre-wrap text-sm text-black dark:text-zinc-50">
            {preview}
          </pre>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {output && (
        <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
              ⚠ AI-generated output — review before use
            </h2>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-black/10 px-4 py-1 text-xs font-medium text-black transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
            >
              Save to history
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-black dark:text-zinc-50">
            {output}
          </pre>
        </div>
      )}

      {lastSaved && (
        <div className="rounded-lg border border-dashed border-black/10 bg-zinc-50 p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-400">
            Last saved — {new Date(lastSaved.savedAt).toLocaleString()}
          </h2>
          <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {lastSaved.output}
          </pre>
        </div>
      )}
    </div>
  );
}
