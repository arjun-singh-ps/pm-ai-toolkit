// Data-access layer for the chat_sessions table. One session per
// (programme, agent) pair this milestone — messages are stored as the exact
// MessageParam[] shape the Anthropic SDK expects, so they can be replayed
// straight back into a new messages.create() call.

import type Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServiceClient } from "@/lib/supabase";
import type { AgentConfig } from "@/agents/types";

export type ChatMessage = Anthropic.Messages.MessageParam;

export interface ChatSession {
  id: string;
  programme_id: string;
  agent_name: string;
  phase: string;
  activity: string;
  messages: ChatMessage[];
  created_at: string;
}

/** Loads the existing session for (programme, agent), or creates an empty one if none exists. */
export async function loadOrCreateSession(
  programmeId: string,
  agent: AgentConfig
): Promise<ChatSession> {
  const client = getSupabaseServiceClient();

  const { data: existing, error: lookupError } = await client
    .from("chat_sessions")
    .select("*")
    .eq("programme_id", programmeId)
    .eq("agent_name", agent.name)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Failed to load chat session: ${lookupError.message}`);
  }

  if (existing) {
    return existing as ChatSession;
  }

  const { data: created, error: insertError } = await client
    .from("chat_sessions")
    .insert({ programme_id: programmeId, agent_name: agent.name, phase: agent.phase, activity: agent.name, messages: [] })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create chat session: ${insertError.message}`);
  }

  return created as ChatSession;
}

export interface DisplayMessage {
  role: "user" | "assistant";
  text: string;
}

/**
 * Converts the raw Anthropic message history into a simple list the chat UI
 * can render directly — drops synthetic tool_result turns (those are the
 * engine talking to itself, not the human) and summarises any tool_use into
 * a readable line.
 */
export function toDisplayMessages(messages: ChatMessage[]): DisplayMessage[] {
  const display: DisplayMessage[] = [];

  for (const message of messages) {
    if (typeof message.content === "string") {
      if (message.role === "user" || message.role === "assistant") {
        display.push({ role: message.role, text: message.content });
      }
      continue;
    }

    if (message.role !== "assistant") {
      continue;
    }

    const textParts: string[] = [];
    for (const block of message.content) {
      if (block.type === "text") {
        textParts.push(block.text);
      } else if (block.type === "tool_use" && block.name === "record_artefact") {
        const input = block.input as { artefactName?: string };
        textParts.push(`📄 Recorded artefact: ${input.artefactName ?? "unknown"}`);
      }
    }

    if (textParts.length > 0) {
      display.push({ role: "assistant", text: textParts.join("\n\n") });
    }
  }

  return display;
}

/** Persists the full message history for a session. */
export async function saveSessionMessages(sessionId: string, messages: ChatMessage[]): Promise<void> {
  const { error } = await getSupabaseServiceClient()
    .from("chat_sessions")
    .update({ messages })
    .eq("id", sessionId);

  if (error) {
    throw new Error(`Failed to save chat session: ${error.message}`);
  }
}
