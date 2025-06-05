import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ reply: "Erreur lors de la communication avec OpenAI." }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({ reply: data.choices[0].message.content });
} 