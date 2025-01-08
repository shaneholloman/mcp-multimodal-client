import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLlmPrompt } from "../useLlmPrompt";
import { useGlobalLlm } from "@/contexts/LlmProviderContext";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

vi.mock("@/contexts/LlmProviderContext");

describe("useLlmPrompt", () => {
  const mockExecutePrompt = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useGlobalLlm as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      executePrompt: mockExecutePrompt,
      isLoading: false,
    });
  });

  it("should execute prompt successfully", async () => {
    const mockPrompt = {
      name: "testPrompt",
      messages: [
        {
          role: "user" as const,
          content: { type: "text" as const, text: "test message" },
        },
      ] as PromptMessage[],
    };

    const mockParams = { param1: "value1" };
    const mockResult = { response: "test response" };

    mockExecutePrompt.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useLlmPrompt());
    const response = await result.current.execute(mockPrompt, mockParams);

    expect(response).toBe(mockResult);
    expect(mockExecutePrompt).toHaveBeenCalledWith({
      name: mockPrompt.name,
      messages: mockPrompt.messages,
      params: mockParams,
    });
  });

  it("should throw error when messages are not available", async () => {
    const mockPrompt = {
      name: "testPrompt",
      messages: [],
    };

    const { result } = renderHook(() => useLlmPrompt());
    await expect(result.current.execute(mockPrompt, {})).rejects.toThrow(
      "No messages available in prompt"
    );
    expect(mockExecutePrompt).not.toHaveBeenCalled();
  });

  it("should expose loading state from LLM provider", () => {
    (useGlobalLlm as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      executePrompt: mockExecutePrompt,
      isLoading: true,
    });

    const { result } = renderHook(() => useLlmPrompt());
    expect(result.current.isLoading).toBe(true);
  });

  it("should handle execution errors", async () => {
    const mockPrompt = {
      name: "testPrompt",
      messages: [
        {
          role: "user" as const,
          content: { type: "text" as const, text: "test message" },
        },
      ] as PromptMessage[],
    };

    const mockError = new Error("Execution failed");
    mockExecutePrompt.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useLlmPrompt());
    await expect(result.current.execute(mockPrompt, {})).rejects.toThrow(
      mockError
    );
  });
});
