// Renders one chat message (user or assistant) in the agent chat panel.
// Monzo-style: coral user bubbles, white agent cards, clean typography.

import type { DisplayMessage } from "@/lib/chatSessions";

/** A single chat bubble, styled differently for user vs. agent messages. */
export function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: "var(--coral)",
                color: "#fff",
              }
            : {
                background: "var(--surface)",
                color: "var(--navy)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }
        }
      >
        {message.text}
      </div>
    </div>
  );
}
