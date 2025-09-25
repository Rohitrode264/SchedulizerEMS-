import OpenAI from "openai";
import { sysprompt } from "../utils/systemPrompt";
import { JsonObject } from "@prisma/client/runtime/library";

function purifyToJson<T = any>(rawStr: string): T {
  // 1. Remove Markdown fences like ```json ... ```
  let cleaned = rawStr.replace(/^```(?:json)?|```$/gim, "").trim();

  // 2. Replace escaped newlines and tabs with real ones
  cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

  // 3. Replace escaped quotes \" with "
  cleaned = cleaned.replace(/\\"/g, '"');

  // 4. Trim again just in case
  cleaned = cleaned.trim();

  // 5. Parse to JSON
  return JSON.parse(cleaned) as T;
}

const client = new OpenAI({
  apiKey: "AIzaSyA64nBK64o0z8ckBKIJXzyusBaC11GMud4",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});
  
export async function generateTimetable(data:JsonObject) {
    const response = await client.chat.completions.create({
      model: "gemini-2.5-pro",
      messages: [
        { role: "system", content: sysprompt },
        { role: "user", content: JSON.stringify(data, null, 2) },
      ],
      // temperature: 0.1,
    // reasoning_effort:"medium"
    });



    console.log(response);

    // choices[0] might not exist, so guard it
    const output: string = response.choices?.[0]?.message?.content ?? "";
  
    if (!output) {
      throw new Error("No output returned from OpenAI.");
    }
  
    let timetableJson: any;
    try {
      timetableJson = JSON.parse(output);
    } catch {
      console.error("OpenAI output was not valid JSON, got:\n", output);
    }
  
    return timetableJson || output;
  }