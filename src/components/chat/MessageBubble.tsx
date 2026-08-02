// Renders one chat message (user or assistant) in the agent chat panel.
// Monzo-style: coral user bubbles, white agent cards, clean typography.
// Agent replies are rendered as Markdown (headings, bold, lists) per
// COMMON_AGENT_INSTRUCTIONS — user messages stay plain text.

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { DisplayMessage } from "@/lib/chatSessions";

const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-3 text-sm font-bold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-2.5 text-sm font-semibold first:mt-0">{children}</h3>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code
      className="rounded px-1 py-0.5 text-[0.85em]"
      style={{ background: "rgba(0,0,0,0.06)" }}
    >
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border px-2 py-1 text-left font-semibold" style={{ borderColor: "var(--border)" }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border px-2 py-1" style={{ borderColor: "var(--border)" }}>
      {children}
    </td>
  ),
};

/** A single chat bubble, styled differently for user vs. agent messages. */
export function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
            : "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        }
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
        {isUser ? (
          message.text
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
            {message.text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
