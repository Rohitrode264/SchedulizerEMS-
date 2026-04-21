import { GoogleGenerativeAI } from "@google/generative-ai";
import { sysprompt } from "../utils/systemPrompt";

const genAI = new GoogleGenerativeAI("AIzaSyCLhuFgKKIIBAJYx6jU2bk95-zpU8ZpfFE");

export async function generateTimetable(data: object) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = `
  System prompt:
  ${sysprompt}

  User data:
  ${JSON.stringify(data, null, 2)}
  `;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error: any) {
    const msg = error?.message || error?.statusText || JSON.stringify(error);
    throw new Error(`Gemini API call failed: ${msg}`);
  }

  const output = result.response.text();

  // Try direct parse first
  try {
    return JSON.parse(output);
  } catch {
    // Strip markdown fences if present
    const stripped = output.replace(/^```(?:json)?\s*/im, "").replace(/```\s*$/im, "").trim();
    try {
      return JSON.parse(stripped);
    } catch {
      console.error("Gemini output not valid JSON:", output.substring(0, 500));
      return output;
    }
  }
}