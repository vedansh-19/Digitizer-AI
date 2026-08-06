import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { images, mode, language = "English" } = await req.json();
    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    let imageParts: any[] = [];
    let uploadedFiles: string[] = [];
    
    for (const image of images) {
      const base64Data = image.split(",")[1];
      const mimeType = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
      
      if (mimeType === "application/pdf") {
        // Handle PDF with FileManager for large files
        const buffer = Buffer.from(base64Data, 'base64');
        const tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`);
        fs.writeFileSync(tempFilePath, buffer);
        
        try {
          const uploadResponse = await fileManager.uploadFile(tempFilePath, {
            mimeType: "application/pdf",
          });
          
          let file = await fileManager.getFile(uploadResponse.file.name);
          while (file.state === FileState.PROCESSING) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            file = await fileManager.getFile(uploadResponse.file.name);
          }
          
          if (file.state === FileState.FAILED) {
            throw new Error("PDF processing failed on Gemini servers.");
          }
          
          imageParts.push({
            fileData: {
              fileUri: uploadResponse.file.uri,
              mimeType: uploadResponse.file.mimeType
            }
          });
          uploadedFiles.push(uploadResponse.file.name);
        } finally {
          // Cleanup temp file on disk
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      } else {
        imageParts.push({
          inlineData: {
            data: base64Data,
            mimeType
          },
        });
      }
    }

    let prompt = "";
    if (mode === "notes") {
      prompt = `
You are an expert at transcribing, organizing, and explaining messy handwritten notes, PDFs, and documents from whiteboards, blackboards, or notebooks.
Analyze the attached document and extract the information into a structured JSON format.
Ensure you provide a detailed explanation of the concepts.
CRITICAL INSTRUCTION: Do NOT hallucinate or invent information. If the document is unreadable, empty, or contains no useful text, you must return an error or clearly state in the summary that the document could not be read.
CRITICAL LANGUAGE INSTRUCTION: You MUST generate the ENTIRE JSON response exclusively in ${language}. Do not use any other language.
Follow this JSON schema strictly, without any markdown formatting like \`\`\`json:
{
  "title": "Main topic or title of the notes",
  "topics": [
    {
      "heading": "Subheading or topic section",
      "points": ["Point 1", "Point 2"]
    }
  ],
  "detailedExplanation": "A very detailed, comprehensive explanation of all the concepts covered in the notes/document",
  "summary": "A brief summary of what the notes/document are about",
  "additionalInfo": "Any other context, formulas, diagrams described in text, or side notes",
  "flashcards": [
    {
      "front": "Question or term based on the notes",
      "back": "Answer or definition"
    }
  ]
}`;
    } else {
      prompt = `
You are an expert academic assistant and transcriptionist.
Analyze the attached audio lecture recording or document and extract the information into a structured JSON format.
Ensure you provide a high-level summary, detailed notes, key points, action items (like homework), and a quiz.
CRITICAL INSTRUCTION: Do NOT hallucinate or invent information. Rely STRICTLY on the provided transcript or audio. If the input is empty or incomprehensible, state that it could not be read.
CRITICAL LANGUAGE INSTRUCTION: You MUST generate the ENTIRE JSON response exclusively in ${language}. Do not use any other language.
Follow this JSON schema strictly, without any markdown formatting like \`\`\`json:
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

    let result;
    try {
      result = await model.generateContent([prompt, ...imageParts]);
    } finally {
      // Cleanup files from Gemini
      for (const name of uploadedFiles) {
        try {
          await fileManager.deleteFile(name);
        } catch (e) {
          console.error("Failed to delete file from Gemini:", e);
        }
      }
    }
    
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown JSON block
    let cleanJsonStr = text.trim();
    if (cleanJsonStr.startsWith("\`\`\`json")) {
      cleanJsonStr = cleanJsonStr.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    }
    if (cleanJsonStr.startsWith("\`\`\`")) {
      cleanJsonStr = cleanJsonStr.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
    }
    
    const parsedData = JSON.parse(cleanJsonStr);
    
    return NextResponse.json({ result: parsedData });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze document" }, { status: 500 });
  }
}
