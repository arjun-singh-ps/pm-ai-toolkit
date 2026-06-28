// Renders one chat message (user or assistant) in the agent chat panel.

import type { DisplayMessage } from "@/lib/chatSessions";

/** A single chat bubble, styled differently for user vs. agent messages. */
export function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
          isUser
            ? "bg-foreground text-background"
            : "border border-black/10 bg-white text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
