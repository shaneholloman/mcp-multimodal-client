import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useLlmRegistry,
  LlmRegistryProvider,
} from "../contexts/LlmRegistryContext";

describe("LlmRegistryContext", () => {
  it("should throw error when used outside provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => {
      renderHook(() => useLlmRegistry());
    }).toThrow("useLlmRegistry must be used within a LlmRegistryProvider");
    consoleError.mockRestore();
  });

  it("should provide registry context when used within provider", () => {
    const { result } = renderHook(() => useLlmRegistry(), {
      wrapper: LlmRegistryProvider,
    });

    expect(result.current.providers).toEqual([]);
    expect(typeof result.current.registerProvider).toBe("function");
    expect(typeof result.current.unregisterProvider).toBe("function");
    expect(typeof result.current.getProviderInstance).toBe("function");
  });

  it("should register and unregister providers", () => {
    const { result } = renderHook(() => useLlmRegistry(), {
      wrapper: LlmRegistryProvider,
    });

    const mockProvider = {
      id: "test-provider",
      name: "Test Provider",
      description: "A test provider",
      configSchema: {},
    };

    const mockInstance = {
      id: "test-provider",
      name: "Test Provider",
      executePrompt: vi.fn(),
      isLoading: false,
      error: null,
    };

    act(() => {
      result.current.registerProvider(mockProvider, mockInstance);
    });
    expect(result.current.providers).toContainEqual(mockProvider);
    expect(result.current.getProviderInstance("test-provider")).toBe(
      mockInstance
    );

    act(() => {
      result.current.unregisterProvider("test-provider");
    });
    expect(result.current.providers).not.toContainEqual(mockProvider);
    expect(result.current.getProviderInstance("test-provider")).toBeNull();
  });
});
