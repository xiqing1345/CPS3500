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
      messages,
      max_tokens: 300,
    });

    const choices = response?.choices;
    if (!choices || choices.length === 0) {
      return NextResponse.json({ error: "No completion returned from OpenAI" }, { status: 502 });
    }

    const text = choices[0]?.message?.content || "";
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("chat api error", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
