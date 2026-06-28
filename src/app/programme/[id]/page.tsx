// Default centre-panel content for a programme: prompts the user to select
// an agent from the sidebar once agent chat exists.

/** Placeholder centre panel shown until an agent is selected. */
export default function ProgrammePage() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center text-zinc-500 dark:text-zinc-400">
      Select an agent from the sidebar to begin.
    </div>
  );
}
