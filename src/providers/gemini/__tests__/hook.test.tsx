import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGeminiProvider } from "../hook";
import { useLlmRegistry } from "@/features/llm-registry";
import { useLogStore } from "@/stores/log-store";
import { geminiProvider } from "../provider";
import { generateLlmResponse } from "../implementation";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

// Mock dependencies
vi.mock("@/features/llm-registry", () => ({
  useLlmRegistry: vi.fn(),
}));

vi.mock("@/stores/log-store", () => ({
  useLogStore: vi.fn(),
}));

vi.mock("../implementation", () => ({
  generateLlmResponse: vi.fn(),
}));

describe("useGeminiProvider", () => {
  const mockRegisterProvider = vi.fn();
  const mockUnregisterProvider = vi.fn();
  const mockAddLog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useLlmRegistry as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      registerProvider: mockRegisterProvider,
      unregisterProvider: mockUnregisterProvider,
    });

    (useLogStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addLog: mockAddLog,
    });
  });

  it("should register provider on mount", () => {
    renderHook(() => useGeminiProvider());

    expect(mockRegisterProvider).toHaveBeenCalledWith(
      geminiProvider,
      expect.objectContaining({
        id: geminiProvider.id,
        name: geminiProvider.name,
        executePrompt: expect.any(Function),
        isLoading: false,
        error: null,
      })
    );
  });

  it("should unregister provider on unmount", () => {
    const { unmount } = renderHook(() => useGeminiProvider());

    unmount();

    expect(mockUnregisterProvider).toHaveBeenCalledWith(geminiProvider.id);
  });

  it("should handle executePrompt success", async () => {
    const mockResponse = { response: "test response" };
    const mockMessages: PromptMessage[] = [
      { role: "user", content: { type: "text", text: "test" } },
    ];

    vi.mocked(generateLlmResponse).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGeminiProvider());

    let response;
    await act(async () => {
      response = await result.current.executePrompt({
        name: "test",
        messages: mockMessages,
      });
    });

    expect(response).toBe(mockResponse.response);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockAddLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "prompt",
        operation: "Execute Prompt",
        status: "success",
      })
    );
  });

  it("should handle executePrompt error", async () => {
    const mockError = new Error("test error");
    const mockMessages: PromptMessage[] = [
      { role: "user", content: { type: "text", text: "test" } },
    ];

    vi.mocked(generateLlmResponse).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useGeminiProvider());

    let error;
    await act(async () => {
      try {
        await result.current.executePrompt({
          name: "test",
          messages: mockMessages,
        });
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(mockError.message);
    expect(mockAddLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "prompt",
        operation: "Execute Prompt",
        status: "error",
        error: mockError.message,
      })
    );
  });

  it("should validate messages", async () => {
    const { result } = renderHook(() => useGeminiProvider());

    let error;
    await act(async () => {
      try {
        await result.current.executePrompt({
          name: "test",
          messages: [],
        });
      } catch (e) {
        error = e;
      }
    });

    expect(error).toEqual(new Error("No valid content found in messages"));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("No valid content found in messages");
    expect(mockAddLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "prompt",
        operation: "Execute Prompt",
        status: "error",
        error: "No valid content found in messages",
      })
    );
  });
});
