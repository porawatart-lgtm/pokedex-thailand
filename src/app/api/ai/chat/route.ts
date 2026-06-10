import { NextRequest, NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      message: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    const { message, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const response = await aiChat(message, history);
    return NextResponse.json({ data: { response } });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
