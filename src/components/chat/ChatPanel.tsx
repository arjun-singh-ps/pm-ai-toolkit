// Client chat panel: loads history for one agent, sends new messages, and
// shows a readable line whenever an artefact gets recorded.

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { DisplayMessage } from "@/lib/chatSessions";
import { ARTEFACT_RECORDED_EVENT } from "@/lib/clientEvents";
import { WELCOME_INIT_MARKER } from "@/lib/constants";
import type { AgentAlert } from "@/types/agentAlert";

interface ChatPanelProps {
  programmeId: string;
  agentName: string;
  agentDisplayName: string;
  /** When set, shows a pre-brief banner and injects alert context into the opening briefing. */
  alertContext?: AgentAlert | null;
}

/** Chat UI for one agent: history, message input, and inline artefact-recorded notices. */
export function ChatPanel({ programmeId, agentName, agentDisplayName, alertContext }: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  function scrollToTop() {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch(`/api/agents/${agentName}/session?programmeId=${programmeId}`);
        const data = await response.json();
        const loaded: DisplayMessage[] = data.messages ?? [];

        if (cancelled) return;

        if (loaded.length === 0) {
          // New session — auto-generate the opening briefing.
          setIsLoadingHistory(false);
          setIsSending(true);
          const chatResponse = await fetch(`/api/agents/${agentName}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              programmeId,
              message: WELCOME_INIT_MARKER,
              ...(alertContext ? { alertId: alertContext.id } : {}),
            }),
          });
          const chatData = await chatResponse.json();
          if (!cancelled && chatResponse.ok) {
            // Show the welcome but hide the synthetic init trigger.
            setMessages([
              { role: "user", text: WELCOME_INIT_MARKER },
              { role: "assistant", text: chatData.reply ?? "" },
            ]);
          }
          if (!cancelled) setIsSending(false);
        } else {
          setMessages(loaded);
          setIsLoadingHistory(false);
        }
      } catch {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [programmeId, agentName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Sends the current input as a new user message and appends the agent's reply. */
  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || isSending) {
      return;
    }

    const userText = input;
    setInput("");
    setError(null);
    setMessages((current) => [...current, { role: "user", text: userText }]);
    setIsSending(true);

    try {
      const response = await fetch(`/api/agents/${agentName}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmeId,
          message: userText,
          ...(alertContext ? { alertId: alertContext.id } : {}),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to get a response.");
        return;
      }

      const recordedArtefacts: string[] = data.recordedArtefacts ?? [];
      const recordedAlerts: number = data.recordedAlerts ?? 0;
      const artefactLines = recordedArtefacts.map((name) => `📄 Recorded artefact: ${name}`);
      const alertLine =
        recordedAlerts > 0
          ? `🔔 ${recordedAlerts} alert${recordedAlerts > 1 ? "s" : ""} recorded — check the programme home screen`
          : null;
      const replyText = [data.reply, ...artefactLines, alertLine].filter(Boolean).join("\n\n");
      setMessages((current) => [...current, { role: "assistant", text: replyText }]);

      if (recordedArtefacts.length > 0) {
        // Tell the sibling RightPanel (Artefacts/Gate tabs) to refetch, and
        // refresh server components (e.g. the Sidebar's lock/status dots) —
        // neither happens automatically since ChatPanel and RightPanel have
        // no direct prop path between them.
        window.dispatchEvent(new Event(ARTEFACT_RECORDED_EVENT));
        router.refresh();
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  }

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>
      {alertContext && (
        <div
          className="mx-4 mt-3 rounded-xl px-3 py-2.5"
          style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
          }}
        >
          <p className="text-xs font-semibold" style={{ color: "#D97706" }}>
            ⚡ Opened from a {agentDisplayName} alert
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "#92400E" }}>{alertContext.what}</p>
        </div>
      )}

      <div ref={scrollContainerRef} className="relative flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {isLoadingHistory ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading conversation…</p>
        ) : (
          messages
            .filter((m) => m.text !== WELCOME_INIT_MARKER)
            .map((message, index) => <MessageBubble key={index} message={message} />)
        )}
        {isSending && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {messages.length === 0 ? `${agentDisplayName} is preparing your briefing…` : `${agentDisplayName} is thinking…`}
          </p>
        )}
        <div ref={bottomRef} />

        {/* Floating scroll shortcuts — absolute within this relative scroll container, so
            they stay pinned to its viewport corner instead of scrolling with the messages. */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={scrollToTop}
            title="Scroll to top"
            aria-label="Scroll to top"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm transition-opacity hover:opacity-80"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              color: "var(--navy)",
            }}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={scrollToBottom}
            title="Scroll to latest message"
            aria-label="Scroll to latest message"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm transition-opacity hover:opacity-80"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              color: "var(--navy)",
            }}
          >
            ↓
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mx-4 mb-2 rounded-xl p-3 text-sm"
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#B91C1C",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 p-3"
        style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <textarea
          rows={4}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${agentDisplayName}…`}
          className="flex-1 resize-y rounded-2xl px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--navy)",
            minHeight: "5.5rem",
          }}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="flex-shrink-0 self-end rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--coral)" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
