import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: Request) {
  try {
    const { image, mode, youtubeUrl, language = "English" } = await req.json();
    if (!image && !youtubeUrl) {
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
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let imageParts: any[] = [];
    let transcriptText = "";

    if (youtubeUrl) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
        transcriptText = transcript.map(t => t.text).join(" ");
      } catch (err: any) {
        throw new Error("Could not fetch YouTube transcript. The video might not have captions enabled or is restricted.");
      }
    } else if (image) {
      const base64Data = image.split(",")[1];
      const mimeType = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
      
      imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType
          },
        },
      ];
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
  "additionalInfo": "Any other context, formulas, diagrams described in text, or side notes"
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
  ]
}`;
    }

    let result;
    if (youtubeUrl) {
      const fullPrompt = transcriptText 
        ? `${prompt}\n\nHere is the video transcript to analyze:\n${transcriptText}`
        : `${prompt}\n\nPlease analyze this YouTube video natively: ${youtubeUrl}`;
      result = await model.generateContent(fullPrompt);
    } else {
      result = await model.generateContent([prompt, ...imageParts]);
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
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
  }
}
