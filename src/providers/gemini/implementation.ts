import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { GenerateContentRequest } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface GeminiCandidate {
  content: {
    parts: Array<{
      text: string;
    }>;
    role: string;
  };
  finishReason: string;
  index: number;
  safetyRatings: Array<{
    category: string;
    probability: string;
  }>;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: string;
}

export interface LlmResponse {
  response: string;
  error?: string;
}

export interface GeminiConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateLlmResponse(
  messages: PromptMessage[],
  config: GeminiConfig = {}
): Promise<LlmResponse> {
  try {
    if (!messages.length) {
      throw new Error("No valid content found in messages");
    }

    const model = genAI.getGenerativeModel({
      model: config.model || "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      },
    });

    // Format messages into a clear prompt structure
    const formattedMessages: GenerateContentRequest = {
      contents: messages
        .map((msg) => {
          let text = "";
          if (msg.content.type === "text" && msg.content.text) {
            text = msg.content.text;
          } else if (msg.content.type === "resource" && msg.content.resource) {
            text = `Resource ${msg.content.resource.uri}:\n${msg.content.resource.text}`;
          }
          return {
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text }],
          };
        })
        .filter((content) => content.parts[0].text),
    };

    if (!formattedMessages.contents.length) {
      throw new Error("No valid content found in messages");
    }

    // Send the prompt and get response
    const result = await model.generateContent(formattedMessages);
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
