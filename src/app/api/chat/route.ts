import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, context, history, language = "English" } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const systemPrompt = `You are a helpful AI assistant in an app that digitizes messy notes and transcriptions.
You have been provided with the following extracted data from a user's input:
${JSON.stringify(context, null, 2)}

Answer the user's questions based on this context. Keep your answers concise, clear, and helpful.
CRITICAL INSTRUCTION: You MUST reply entirely in ${language}. Do not use any other language in your response.`;

    const chatHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Start a chat session with the context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will answer based on the provided context." }],
        },
        ...chatHistory.slice(1) // skip the initial "Hi! I've analyzed..." message
      ],
    });

    const result = await chat.sendMessage([{ text: message }]);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat message" }, { status: 500 });
  }
}
