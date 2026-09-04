import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getAiConfig } from "@/lib/ai/model";
import { getSystemPrompt } from "@/lib/resume";

// The resume markdown is read from disk, so this route must run in Node.js
// (not the Edge runtime).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { question?: unknown };
    const question =
      typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json(
        { message: "Please provide a question." },
        { status: 400 },
      );
    }

    const { model, providerOptions } = getAiConfig();

    const result = await generateText({
      model,
      system: getSystemPrompt(),
      prompt: question,
      ...(providerOptions ? { providerOptions } : {}),
    });

    return NextResponse.json({ message: result.text }, { status: 200 });
  } catch (error) {
    console.error("[chat] error:", error);
    return NextResponse.json(
      { message: "Failed to answer this question. Try asking differently." },
      { status: 500 },
    );
  }
}
