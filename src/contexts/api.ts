import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generateLlmResponse(
  messages: PromptMessage[]
): Promise<{ response: string; error?: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Format messages into a clear prompt structure
    const prompt = messages
      .map((msg) => {
        let content = "";
        if (msg.content.type === "text" && msg.content.text) {
          content = msg.content.text;
        } else if (msg.content.type === "resource" && msg.content.resource) {
          content = `Resource ${msg.content.resource.uri}:\n${msg.content.resource.text}`;
        }
        return content ? `${msg.role.toUpperCase()}: ${content}` : "";
      })
      .filter(Boolean)
      .join("\n\n");

    if (!prompt) {
      throw new Error("No valid content found in messages");
    }

    // Send the prompt and get response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (!text) {
      throw new Error("No response received from Gemini");
    }

    return {
      response: text,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      response: "",
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
