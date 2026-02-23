import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, mode, tone, targetRole } = body;

    if (!input || typeof input !== "string" || input.length < 20) {
      return NextResponse.json({ error: "Input must be at least 20 characters" }, { status: 400 });
    }

    const systemPrompt = `You are an assistant that helps craft text for resumes, LinkedIn summaries, or cover letters. Output should match the requested mode and tone.`;

    const userPrompt = `
    Input: ${input}
    Mode: ${mode}
    Tone: ${tone}
    Target Role: ${targetRole || ""}
    `;

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const client = new OpenAIApi(configuration);

    const response = await client.createChatCompletion({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
    });

    const text = response.data.choices[0]?.message?.content || "";
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("resume api error", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
