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

    const systemPrompt = `You are a helpful AI assistant in an app that digitizes messy notes and transcriptions.
You have been provided with the following extracted data from a user's input:
${JSON.stringify(context, null, 2)}

Answer the user's questions based on this context. Keep your answers concise, clear, and helpful.
CRITICAL INSTRUCTION: You MUST reply entirely in ${language}. Do not use any other language in your response.`;

    const chatHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"];
    let text = "";
    let lastError;

    for (const modelName of MODELS) {
      const model = genAI.getGenerativeModel({ model: modelName });
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
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
              ...chatHistory.slice(1)
            ],
          });
          const result = await chat.sendMessage([{ text: message }]);
          const response = await result.response;
          text = response.text();
          break;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.httpErrorCode?.status;
          if (status === 503 || status === 429) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            console.log(`Chat: Model ${modelName} attempt ${attempt + 1} failed (${status}), retrying in ${Math.round(delay)}ms...`);
            await new Promise(r => setTimeout(r, delay));
          } else {
            throw err;
          }
        }
      }
      if (text) break;
      console.log(`Chat: All retries exhausted for ${modelName}, trying next model...`);
    }

    if (!text) {
      throw lastError || new Error("All models are currently unavailable. Please try again in a minute.");
    }
    
    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat message" }, { status: 500 });
  }
}
