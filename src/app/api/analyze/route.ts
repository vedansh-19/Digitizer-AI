import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { images, mode, language = "English" } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);

    let imageParts: any[] = [];
    let uploadedFiles: string[] = [];
    
    // For large base64 files like PDFs, write to temp file and use Gemini File API
    for (let i = 0; i < images.length; i++) {
      const b64 = images[i];
      if (!b64 || typeof b64 !== "string") continue;
      
      const match = b64.match(/^data:(.*);base64,(.*)$/);
      if (!match) continue;
      
      const mimeType = match[1];
      const base64Data = match[2];
      
      const buffer = Buffer.from(base64Data, "base64");
      const sizeMB = buffer.length / (1024 * 1024);
      
      if (sizeMB > 15) {
        // Upload via File API for large files
        const ext = mimeType.split("/")[1] || "tmp";
        const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}_${i}.${ext}`);
        fs.writeFileSync(tempFilePath, buffer);
        
        try {
          const uploadResult = await fileManager.uploadFile(tempFilePath, {
            mimeType: mimeType,
            displayName: `Upload ${i}`,
          });
          
          let fileState = await fileManager.getFile(uploadResult.file.name);
          while (fileState.state === "PROCESSING") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            fileState = await fileManager.getFile(uploadResult.file.name);
          }
          
          if (fileState.state === "FAILED") {
            throw new Error("Video processing failed.");
          }
          
          uploadedFiles.push(uploadResult.file.name);
          imageParts.push({
            fileData: {
              mimeType: uploadResult.file.mimeType,
              fileUri: uploadResult.file.uri,
            }
          });
        } finally {
          fs.unlinkSync(tempFilePath);
        }
      } else {
        // Use inline data for small files
        imageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }
    }

    let prompt = "";
    
    if (mode === "lecture") {
      prompt = `You are an expert academic assistant. I am providing you with the audio/transcript of a lecture.
CRITICAL INSTRUCTION: You MUST reply entirely in ${language}. Do not use any other language in your response.

Extract the following information and return it EXACTLY as a raw JSON object (do not wrap in markdown \`\`\`json block). Ensure all keys and string values are in ${language}.
{
  "title": "Title of the lecture or topic",
  "summary": "High-level summary of the recording",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "notes": "Detailed, well-structured notes extracted from the lecture",
  "actionItems": ["Homework 1", "Readings to do"],
  "quiz": [
    {
      "question": "A relevant multiple-choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The exact text of the correct option"
    }
  ],
  "flashcards": [
    {
      "front": "Key concept or question from the lecture",
      "back": "Explanation or answer"
    }
  ]
}`;
    } else {
      prompt = `You are an expert academic assistant. I am providing you with images of handwritten or typed notes.
CRITICAL INSTRUCTION: You MUST reply entirely in ${language}. Do not use any other language in your response.

Extract the following information and return it EXACTLY as a raw JSON object (do not wrap in markdown \`\`\`json block). Ensure all keys and string values are in ${language}.
{
  "title": "Title of the lecture or topic",
  "summary": "High-level summary of the recording",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "notes": "Detailed, well-structured notes extracted from the lecture",
  "actionItems": ["Homework 1", "Readings to do"],
  "quiz": [
    {
      "question": "A relevant multiple-choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The exact text of the correct option"
    }
  ],
  "flashcards": [
    {
      "front": "Key concept or question from the lecture",
      "back": "Explanation or answer"
    }
  ]
}`;
    }

    const MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"];
    let result;
    let lastError;

    for (const modelName of MODELS) {
      const currentModel = genAI.getGenerativeModel({ model: modelName });
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          result = await currentModel.generateContent([prompt, ...imageParts]);
          break;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.httpErrorCode?.status;
          if (status === 503 || status === 429) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            console.log(`Model ${modelName} attempt ${attempt + 1} failed (${status}), retrying in ${Math.round(delay)}ms...`);
            await new Promise(r => setTimeout(r, delay));
          } else {
            throw err;
          }
        }
      }
      if (result) break;
      console.log(`All retries exhausted for ${modelName}, trying next model...`);
    }

    // Cleanup uploaded files from Gemini
    for (const name of uploadedFiles) {
      try {
        await fileManager.deleteFile(name);
      } catch (e) {
        console.error("Failed to delete file from Gemini:", e);
      }
    }

    if (!result) {
      throw lastError || new Error("All models are currently unavailable. Please try again in a minute.");
    }
    
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown JSON block
    let cleanJsonStr = text.trim();
    if (cleanJsonStr.startsWith("```json")) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\n?/, "");
      cleanJsonStr = cleanJsonStr.replace(/\n?```$/, "");
    }
    
    let parsed;
    try {
      parsed = JSON.parse(cleanJsonStr);
    } catch (e) {
      console.error("Failed to parse JSON:", cleanJsonStr);
      throw new Error("AI returned invalid JSON format");
    }

    return NextResponse.json({ result: parsed });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze document" }, { status: 500 });
  }
}
