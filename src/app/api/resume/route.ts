import { NextResponse } from "next/server";
// openai v6 exports a single OpenAI class instead of Configuration/OpenAIApi
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, mode, tone, targetRole } = body;

    // basic input validation; extend as needed
    if (
      !input || typeof input !== "string" || input.length < 20 ||
      !mode  || typeof mode  !== "string" ||
      !tone  || typeof tone  !== "string"
    ) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    const systemPrompt = `You are an assistant that helps craft text for resumes, LinkedIn summaries, or cover letters. Output should match the requested mode and tone.`;

    const userPrompt = `
    Input: ${input}
    Mode: ${mode}
    Tone: ${tone}
    Target Role: ${targetRole || ""}
    `;

    // initialize client using the new OpenAI class
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
    });

    // v6 returns properties on the response object directly, not under `.data`
    const choices = response?.choices;
    if (!choices || choices.length === 0) {
      console.error("no choices returned", response);
      return NextResponse.json({ error: "No completion returned from OpenAI" }, { status: 502 });
    }

    const text = choices[0]?.message?.content || "";
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("resume api error", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
