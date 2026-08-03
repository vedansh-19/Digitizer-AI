import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image, mode } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
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

    // Prepare image for Gemini API
    const base64Data = image.split(",")[1];
    const mimeType = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
    
    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        },
      },
    ];

    let prompt = "";
    if (mode === "notes") {
      prompt = `
You are an expert at transcribing, organizing, and explaining messy handwritten notes, PDFs, and documents from whiteboards, blackboards, or notebooks.
Analyze the attached document and extract the information into a structured JSON format.
Ensure you provide a detailed explanation of the concepts.
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
You are an expert pharmacist and medical assistant skilled at reading messy doctor's prescriptions and medical reports.
Analyze the attached document and extract the details into a structured JSON format.
Provide a detailed explanation of the prescribed items or report findings.
Follow this JSON schema strictly, without any markdown formatting like \`\`\`json:
{
  "doctorName": "Name of the doctor if visible",
  "patientName": "Name of the patient if visible",
  "date": "Date of the prescription if visible",
  "medicines": [
    {
      "name": "Name of the medicine",
      "dosage": "Dosage (e.g., 500mg)",
      "frequency": "Frequency (e.g., twice a day)",
      "duration": "Duration (e.g., 5 days)"
    }
  ],
  "detailedExplanation": "A detailed explanation of the medicines, what they are used for, potential side effects, and any medical advice given",
  "summary": "Any general instructions or advice written",
  "additionalInfo": "Any other details like follow-up date, clinic name, etc."
}`;
    }

    const result = await model.generateContent([prompt, ...imageParts]);
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
