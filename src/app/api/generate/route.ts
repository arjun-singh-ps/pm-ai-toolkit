// API route: receives a fully-substituted prompt from the browser and
// forwards it to Claude server-side, so the API key never reaches the client.

import { NextResponse } from "next/server";
import { generateFromPrompt } from "@/lib/claude";

interface GenerateRequestBody {
  prompt: string;
}

/** Handles POST /api/generate. Expects { prompt: string } and returns { output: string }. */
export async function POST(request: Request) {
  const body = (await request.json()) as GenerateRequestBody;

  if (!body.prompt || typeof body.prompt !== "string") {
    return NextResponse.json(
      { error: "Request body must include a non-empty 'prompt' string." },
      { status: 400 }
    );
  }

  try {
    const output = await generateFromPrompt(body.prompt);
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Claude generation failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to generate output. Please try again." },
      { status: 502 }
    );
  }
}
