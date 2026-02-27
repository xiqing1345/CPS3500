import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly personal portfolio assistant. Keep answers clear, concise, and helpful for website visitors.",
        },
        ...messages,
      ],
      max_tokens: 300,
    });

    const text = response?.choices?.[0]?.message?.content || "";
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("assistant api error", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
