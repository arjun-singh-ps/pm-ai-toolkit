// Client chat panel: loads history for one agent, sends new messages, and
// shows a readable line whenever an artefact gets recorded.

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { DisplayMessage } from "@/lib/chatSessions";
import { ARTEFACT_RECORDED_EVENT } from "@/lib/clientEvents";

interface ChatPanelProps {
  programmeId: string;
  agentName: string;
  agentDisplayName: string;
}

/** Chat UI for one agent: history, message input, and inline artefact-recorded notices. */
export function ChatPanel({ programmeId, agentName, agentDisplayName }: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch(`/api/agents/${agentName}/session?programmeId=${programmeId}`);
        const data = await response.json();
        if (!cancelled) {
          setMessages(data.messages ?? []);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
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
        body: JSON.stringify({ programmeId, message: userText }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to get a response.");
        return;
      }

      const recordedArtefacts: string[] = data.recordedArtefacts ?? [];
      const artefactLines = recordedArtefacts.map((name) => `📄 Recorded artefact: ${name}`);
      const replyText = [data.reply, ...artefactLines].filter(Boolean).join("\n\n");
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
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {isLoadingHistory ? (
          <p className="text-sm text-zinc-400">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-400">Start the conversation with {agentDisplayName} below.</p>
        ) : (
          messages.map((message, index) => <MessageBubble key={index} message={message} />)
        )}
        {isSending && <p className="text-sm text-zinc-400">{agentDisplayName} is thinking…</p>}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-black/10 p-3 dark:border-white/10">
        <textarea
          rows={2}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${agentDisplayName}...`}
          className="flex-1 resize-none rounded-md border border-black/10 bg-white p-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="self-end rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Send
        </button>
      </form>
    </div>
  );
}
