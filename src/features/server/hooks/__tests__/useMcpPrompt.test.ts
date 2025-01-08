import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMcpPrompt } from "../useMcpPrompt";
import { useMcp } from "@/contexts/McpContext";

vi.mock("@/contexts/McpContext");

describe("useMcpPrompt", () => {
  const mockClient = {
    getPrompt: vi.fn(),
  };

  const mockConnectedState = {
    client: mockClient,
    connectionStatus: "connected" as const,
  };

  const mockDisconnectedState = {
    client: null,
    connectionStatus: "disconnected" as const,
  };

  const mockPendingState = {
    client: mockClient,
    connectionStatus: "pending" as const,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should indicate availability when client is connected", () => {
    (useMcp as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clients: {
        testServer: mockConnectedState,
      },
    });

    const { result } = renderHook(() =>
      useMcpPrompt({ serverId: "testServer" })
    );
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("should indicate unavailability when client is disconnected", () => {
    (useMcp as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clients: {
        testServer: mockDisconnectedState,
      },
    });

    const { result } = renderHook(() =>
      useMcpPrompt({ serverId: "testServer" })
    );
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should indicate loading state when client is pending", () => {
    (useMcp as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clients: {
        testServer: mockPendingState,
      },
    });

    const { result } = renderHook(() =>
      useMcpPrompt({ serverId: "testServer" })
    );
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it("should get prompt details successfully", async () => {
    (useMcp as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clients: {
        testServer: mockConnectedState,
      },
    });

    const mockPromptResponse = {
      name: "testPrompt",
      description: "Test description",
      type: "test",
      input: {
        schema: {
          type: "object",
          properties: {
            param1: { type: "string" },
          },
        },
      },
      messages: [
        {
          role: "user",
          content: { type: "text", text: "test" },
        },
      ],
    };

    mockClient.getPrompt.mockResolvedValueOnce(mockPromptResponse);

    const { result } = renderHook(() =>
      useMcpPrompt({ serverId: "testServer" })
    );
    const prompt = await result.current.getPrompt("testPrompt", {
      param1: "value1",
    });

    expect(prompt).toEqual({
      name: "testPrompt",
      description: "Test description",
      type: "test",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string" },
        },
      },
      messages: [
        {
          role: "user",
          content: { type: "text", text: "test" },
        },
      ],
    });

    expect(mockClient.getPrompt).toHaveBeenCalledWith({
      name: "testPrompt",
      arguments: { param1: "value1" },
    });
  });

  it("should throw error when client is not available", async () => {
    (useMcp as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clients: {
        testServer: mockDisconnectedState,
      },
    });

    const { result } = renderHook(() =>
      useMcpPrompt({ serverId: "testServer" })
    );
    await expect(result.current.getPrompt("testPrompt")).rejects.toThrow(
      "No MCP client available"
    );
  });
});
