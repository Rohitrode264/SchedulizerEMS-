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

  const result = await model.generateContent(prompt);
  const output = result.response.text();

  try {
    return JSON.parse(output);
  } catch {
    console.error("Gemini output not valid JSON:", output);
    return output;
  }
}