import { GoogleGenerativeAI } from "@google/generative-ai";
import { sysprompt } from "../utils/systemPrompt";

const genAI = new GoogleGenerativeAI("AIzaSyCLhuFgKKIIBAJYx6jU2bk95-zpU8ZpfFE");

// Retry wrapper — handles 429 rate limit with exponential backoff
async function callWithRetry(fn: () => Promise<any>, retries = 3, delayMs = 10000): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("Too Many Requests");
      if (isRateLimit && attempt < retries) {
        console.warn(
          `[Gemini] Rate limited (429). Retrying in ${delayMs / 1000}s... (attempt ${attempt}/${retries})`
        );
        await new Promise((res) => setTimeout(res, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
}

export async function generateTimetable(data: object) {
  // gemini-2.5-flash: 15 RPM free tier vs 2 RPM for pro — far better rate limits
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  System prompt:
  ${sysprompt}

  User data:
  ${JSON.stringify(data, null, 2)}
  `;

  let result;
  try {
    result = await callWithRetry(() => model.generateContent(prompt));
  } catch (error: any) {
    const status = error?.status || error?.httpStatus;
    const msg = error?.message || error?.statusText || JSON.stringify(error);
    if (status === 429 || msg?.includes("429")) {
      throw new Error(
        `Gemini rate limit exceeded after retries. Please wait a minute and try again.`
      );
    }
    throw new Error(`Gemini API call failed (${status ?? "unknown"}): ${msg}`);
  }

  const output = result.response.text();

  // Try direct JSON parse first
  try {
    return JSON.parse(output);
  } catch {
    // Strip markdown fences if Gemini wrapped the response
    const stripped = output
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/```\s*$/im, "")
      .trim();
    try {
      return JSON.parse(stripped);
    } catch {
      console.error("Gemini output not valid JSON:", output.substring(0, 500));
      return output;
    }
  }
}