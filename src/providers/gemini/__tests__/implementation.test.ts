import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateLlmResponse } from "../implementation";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

const generateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    constructor() {
      return {
        getGenerativeModel: () => ({
          generateContent,
        }),
      };
    }
  },
}));

describe("generateLlmResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use the correct Gemini model", async () => {
    const mockResponse = "Test response";
    generateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponse,
      },
    });

    const messages: PromptMessage[] = [
      {
        role: "user",
        content: {
          type: "text",
          text: "Test message",
        },
      },
    ];

    await generateLlmResponse(messages, {
      model: "gemini-2.0-flash-exp",
      temperature: 0.7,
      maxTokens: 100,
    });

    expect(generateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: "user",
          parts: [{ text: "Test message" }],
        },
      ],
    });
  });

  it("should successfully generate a response from text message", async () => {
    const mockResponse = "This is a test response";
    generateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponse,
      },
    });

    const messages: PromptMessage[] = [
      {
        role: "user",
        content: {
          type: "text",
          text: "Hello, world!",
        },
      },
    ];

    const result = await generateLlmResponse(messages);

    expect(generateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: "user",
          parts: [{ text: "Hello, world!" }],
        },
      ],
    });
    expect(result).toEqual({
      response: mockResponse,
    });
  });

  it("should handle resource type messages", async () => {
    const mockResponse = "Response to resource";
    generateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponse,
      },
    });

    const messages: PromptMessage[] = [
      {
        role: "assistant",
        content: {
          type: "resource",
          resource: {
            uri: "test.txt",
            text: "Resource content",
          },
        },
      },
    ];

    const result = await generateLlmResponse(messages);

    expect(generateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: "model",
          parts: [{ text: "Resource test.txt:\nResource content" }],
        },
      ],
    });
    expect(result).toEqual({
      response: mockResponse,
    });
  });

  it("should handle multiple messages", async () => {
    const mockResponse = "Response to multiple messages";
    generateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponse,
      },
    });

    const messages: PromptMessage[] = [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "System message",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: "User message",
        },
      },
    ];

    const result = await generateLlmResponse(messages);

    expect(generateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: "model",
          parts: [{ text: "System message" }],
        },
        {
          role: "user",
          parts: [{ text: "User message" }],
        },
      ],
    });
    expect(result).toEqual({
      response: mockResponse,
    });
  });

  it("should handle empty response from API", async () => {
    generateContent.mockResolvedValueOnce({
      response: {
        text: () => "",
      },
    });

    const messages: PromptMessage[] = [
      {
        role: "user",
        content: {
          type: "text",
          text: "Test message",
        },
      },
    ];

    const result = await generateLlmResponse(messages);

    expect(result).toEqual({
      response: "",
      error: "No response received from Gemini",
    });
  });

  it("should handle API errors", async () => {
    generateContent.mockRejectedValueOnce(new Error("API Error"));

    const messages: PromptMessage[] = [
      {
        role: "user",
        content: {
          type: "text",
          text: "Test message",
        },
      },
    ];

    const result = await generateLlmResponse(messages);

    expect(result).toEqual({
      response: "",
      error: "API Error",
    });
  });

  it("should handle empty messages array", async () => {
    const messages: PromptMessage[] = [];

    const result = await generateLlmResponse(messages);

    expect(result).toEqual({
      response: "",
      error: "No valid content found in messages",
    });
  });

  it("should handle messages with invalid content", async () => {
    const messages: PromptMessage[] = [
      {
        role: "user",
        content: {
          type: "text",
          text: "",
        },
      },
    ];

    const result = await generateLlmResponse(messages);

    expect(result).toEqual({
      response: "",
      error: "No valid content found in messages",
    });
  });

  it("should handle messages with mixed valid and invalid content", async () => {
    const mockResponse = "Response to valid message";
    generateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponse,
      },
    });

    const messages: PromptMessage[] = [
      {
        role: "user",
        content: {
          type: "text",
          text: "",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: "Valid message",
        },
      },
    ];

    const result = await generateLlmResponse(messages);

    expect(generateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: "user",
          parts: [{ text: "Valid message" }],
        },
      ],
    });
    expect(result).toEqual({
      response: mockResponse,
    });
  });
});
