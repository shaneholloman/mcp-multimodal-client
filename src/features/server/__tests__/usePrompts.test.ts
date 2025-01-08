import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrompts } from "../hooks/usePrompts";

// Mock dependencies
vi.mock("@/stores/log-store", () => ({
  useLogStore: () => ({
    addLog: vi.fn(),
  }),
}));

vi.mock("@/contexts/LlmProviderContext", () => ({
  useGlobalLlm: () => ({
    executePrompt: vi.fn(),
    isLoading: false,
  }),
}));

const mockShow = vi.fn();
const mockHide = vi.fn();

vi.mock("../hooks/useModal", () => ({
  useModal: () => ({
    open: mockShow,
    close: mockHide,
    isOpen: false,
    mode: null,
    options: undefined,
  }),
}));

describe("usePrompts", () => {
  const mockPrompt = {
    name: "Test Prompt",
    description: "A test prompt",
    type: "test",
    inputSchema: {
      type: "object" as const,
      properties: {
        param1: {
          type: "string",
          description: "Test parameter",
        },
      },
      required: ["param1"],
    },
  };

  const mockProps = {
    onExecutePrompt: vi.fn(),
    onGetPromptDetails: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockProps.onGetPromptDetails.mockResolvedValue(mockPrompt);
  });

  it("handles execute prompt correctly", async () => {
    const { result } = renderHook(() => usePrompts(mockProps));

    await result.current.handleExecutePrompt(mockPrompt);

    expect(mockProps.onGetPromptDetails).toHaveBeenCalledWith(mockPrompt.name);
    expect(mockShow).toHaveBeenCalledWith("execute", {
      title: `Execute Prompt: ${mockPrompt.name}`,
      description: mockPrompt.description,
      parameters: mockPrompt.inputSchema?.properties,
      onSubmit: expect.any(Function),
    });
  });

  it("handles view prompt correctly", async () => {
    const { result } = renderHook(() => usePrompts(mockProps));

    await result.current.handleViewPrompt(mockPrompt);

    expect(mockProps.onGetPromptDetails).toHaveBeenCalledWith(mockPrompt.name);
    expect(mockShow).toHaveBeenCalledWith("view", {
      title: `View Prompt: ${mockPrompt.name}`,
      description: mockPrompt.description,
      parameters: mockPrompt.inputSchema?.properties,
      onSubmit: expect.any(Function),
    });
  });

  it("handles loading state correctly", async () => {
    const { result, rerender } = renderHook(() => usePrompts(mockProps));

    expect(result.current.isLoading).toBe(false);

    // Create a promise that we can control
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockProps.onGetPromptDetails.mockReturnValue(promise);

    // Start the execution
    const executePromise = result.current.handleExecutePrompt(mockPrompt);

    // Rerender to update the loading state
    rerender();
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise
    resolvePromise!(mockPrompt);
    await executePromise;

    // Rerender to update the loading state
    rerender();
    expect(result.current.isLoading).toBe(false);
  });
});
