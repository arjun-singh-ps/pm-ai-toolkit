// Stores the user's one-time project context in the browser (localStorage).
// No server/database involved yet, so this never leaves the user's machine.

const STORAGE_KEY = "pm-toolkit:project-context";

/** Reads the saved project context, or an empty string if none is set. */
export function getProjectContext(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

/** Saves the project context for reuse across all future prompt generations. */
export function setProjectContext(context: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, context);
}
