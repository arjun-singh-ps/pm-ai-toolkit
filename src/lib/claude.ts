// Server-only Claude API client. Never import this from a "use client" file —
// it reads ANTHROPIC_API_KEY, which must never reach the browser bundle.

import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-6";
const MAX_OUTPUT_TOKENS = 2048;

let client: Anthropic | null = null;

/**
 * Returns the singleton Anthropic client. Shared by the legacy single-shot
 * generateFromPrompt below and by the agent chat engine (src/lib/agentEngine.ts).
 */
export function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local.");
  }

  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  return client;
}

/**
 * Sends a fully-substituted prompt to Claude and returns the generated text.
 * Throws if the API call fails so the caller can surface a clear error.
 */
export async function generateFromPrompt(prompt: string): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content.");
  }

  return textBlock.text;
}
