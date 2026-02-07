import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { SyntheticAgent } from "@/lib/agent";
import type { ChatMessage } from "@/lib/types";

const chatPayload = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().optional(),
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
        createdAt: z.string().optional(),
      }),
    )
    .min(1),
});

const agent = new SyntheticAgent();

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { messages } = chatPayload.parse(json);
    const normalized: ChatMessage[] = messages.map((entry) => ({
      id: entry.id ?? nanoid(),
      role: entry.role,
      content: entry.content,
      createdAt: entry.createdAt ?? new Date().toISOString(),
    }));

    const turn = agent.process(normalized);

    return NextResponse.json(turn);
  } catch (error) {
    console.error("Agent error", error);
    return NextResponse.json(
      {
        error: "Agent failed to generate a response.",
      },
      { status: 500 },
    );
  }
}
