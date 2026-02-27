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

    const websiteContext = [
      "You are the personal assistant for this portfolio website.",
      "Use the following site facts when answering visitors:",
      "- Home page includes a 'Download CV' button.",
      "- CV direct file URL is /cv.pdf.",
      "- Projects page lists demos like AI Chat Demo and AI Resume / LinkedIn Helper.",
      "- Contact page includes email, LinkedIn, and GitHub link.",
      "Response behavior:",
      "- Prefer concrete navigation help (which page/button/link to click).",
      "- For CV questions, explicitly tell users to click 'Download CV' on Home page, or open /cv.pdf directly.",
      "- Keep answers concise, friendly, and practical.",
      "- If user asks something outside known site info, say you're not fully sure and provide the best nearby guidance.",
    ].join("\n");

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: websiteContext,
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
