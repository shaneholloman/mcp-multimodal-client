import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePromptLogger } from "../usePromptLogger";
import { useLogStore } from "@/stores/log-store";

vi.mock("@/stores/log-store");

describe("usePromptLogger", () => {
  const mockAddLog = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useLogStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addLog: mockAddLog,
    });
  });

  it("should log success with all parameters", () => {
    const { result } = renderHook(() => usePromptLogger());
    const params = { param1: "value1" };
    const logResult = { response: "test response" };

    result.current.logSuccess("View Prompt", "testPrompt", params, logResult);

    expect(mockAddLog).toHaveBeenCalledWith({
      type: "prompt",
      operation: "View Prompt",
      status: "success",
      name: "testPrompt",
      params,
      result: logResult,
    });
  });

  it("should log success without optional parameters", () => {
    const { result } = renderHook(() => usePromptLogger());

    result.current.logSuccess("Execute Prompt", "testPrompt");

    expect(mockAddLog).toHaveBeenCalledWith({
      type: "prompt",
      operation: "Execute Prompt",
      status: "success",
      name: "testPrompt",
    });
  });

  it("should log error with Error object", () => {
    const { result } = renderHook(() => usePromptLogger());
    const error = new Error("Test error");
    const params = { param1: "value1" };

    result.current.logError("View Prompt", "testPrompt", error, params);

    expect(mockAddLog).toHaveBeenCalledWith({
      type: "prompt",
      operation: "View Prompt",
      status: "error",
      name: "testPrompt",
      params,
      error: "Test error",
    });
  });

  it("should log error with string message", () => {
    const { result } = renderHook(() => usePromptLogger());
    const errorMessage = "Something went wrong";

    result.current.logError("Execute Prompt", "testPrompt", errorMessage);

    expect(mockAddLog).toHaveBeenCalledWith({
      type: "prompt",
      operation: "Execute Prompt",
      status: "error",
      name: "testPrompt",
      error: errorMessage,
    });
  });

  it("should log custom entry", () => {
    const { result } = renderHook(() => usePromptLogger());
    const customEntry = {
      operation: "View Prompt" as const,
      status: "success" as const,
      name: "testPrompt",
      params: { param1: "value1" },
      result: { response: "test" },
    };

    result.current.log(customEntry);

    expect(mockAddLog).toHaveBeenCalledWith({
      type: "prompt",
      ...customEntry,
    });
  });
});
