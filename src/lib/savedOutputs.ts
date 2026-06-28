// Stores the last output the user explicitly chose to save for each
// template, in browser localStorage. This is a lightweight stand-in for the
// Supabase audit trail described in CLAUDE.md, until auth/Supabase are set up.

export interface SavedOutput {
  output: string;
  savedAt: string;
}

function storageKey(slug: string): string {
  return `pm-toolkit:last-saved:${slug}`;
}

/** Returns the last output saved for this template slug, or null if none exists. */
export function getLastSaved(slug: string): SavedOutput | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(slug));
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as SavedOutput;
}

/** Saves (overwriting any previous) output for this template slug, with a timestamp. */
export function saveLastOutput(slug: string, output: string): SavedOutput {
  const record: SavedOutput = { output, savedAt: new Date().toISOString() };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(record));
  }

  return record;
}
