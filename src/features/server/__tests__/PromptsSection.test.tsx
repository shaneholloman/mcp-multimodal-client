import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PromptsSection } from "../components/sections/PromptsSection";
import { useMcp } from "@/contexts/McpContext";
import { useGlobalLlm } from "@/contexts/LlmProviderContext";
import { useLogStore } from "@/stores/log-store";

vi.mock("@/contexts/McpContext");
vi.mock("@/contexts/LlmProviderContext");
vi.mock("@/stores/log-store");

describe("PromptsSection", () => {
  const mockPrompt = {
    name: "testPrompt",
    description: "Test prompt description",
    type: "test",
    inputSchema: {
      type: "object" as const,
      properties: {
        param1: { type: "string", description: "Test parameter" },
      },
      required: ["param1"],
    },
  };

  const mockMcpClient = { getPrompt: vi.fn(), isAvailable: true };
  const mockAddLog = vi.fn();
  const mockExecutePrompt = vi.fn();
  const mockFetchPrompts = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useGlobalLlm as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      executePrompt: vi.fn(),
      isLoading: false,
    });

    (useLogStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      logs: [],
      maxLogs: 500,
      addLog: mockAddLog,
      clearLogs: vi.fn(),
      setMaxLogs: vi.fn(),
    });

    (useMcp as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clients: {
        testServer: {
          client: mockMcpClient,
          connectionStatus: "connected" as const,
        },
      },
      isAvailable: true,
    });
  });

  it("should view prompt details successfully", async () => {
    // Setup
    const promptResponse = {
      name: "testPrompt",
      description: "Test prompt description",
      type: "test",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string", description: "Test parameter" },
        },
        required: ["param1"],
      },
    };

    mockMcpClient.getPrompt.mockResolvedValue(promptResponse);

    // Render
    render(
      <PromptsSection
        prompts={[mockPrompt]}
        onExecutePrompt={mockExecutePrompt}
        onFetchPrompts={mockFetchPrompts}
        isLoading={false}
        hasListPromptsCapability={true}
        error={false}
        onGetPromptDetails={mockMcpClient.getPrompt}
      />
    );

    // Find the prompt card to verify it exists
    expect(screen.getByTestId("prompt-card-testPrompt")).toBeInTheDocument();

    // Find and click view button
    const viewButton = screen.getByRole("button", { name: /View Prompt/i });
    fireEvent.click(viewButton);

    // Wait for the modal to appear
    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    // Verify prompt details are displayed
    const modalDescription = screen.getByTestId("prompt-modal-description");
    expect(modalDescription).toHaveTextContent("Test prompt description");

    // Verify the modal title
    expect(screen.getByText("View Prompt: testPrompt")).toBeInTheDocument();

    // Verify the getPrompt was called
    expect(mockMcpClient.getPrompt).toHaveBeenCalledWith("testPrompt");
  });

  it("should handle errors", async () => {
    // Setup
    mockMcpClient.getPrompt.mockRejectedValue(
      new Error("Failed to get prompt details")
    );

    // Render
    render(
      <PromptsSection
        prompts={[mockPrompt]}
        isLoading={false}
        hasListPromptsCapability={true}
        error={false}
        onExecutePrompt={mockExecutePrompt}
        onGetPromptDetails={mockMcpClient.getPrompt}
      />
    );

    // Find the prompt card to verify it exists
    expect(screen.getByTestId("prompt-card-testPrompt")).toBeInTheDocument();

    // Find and click view button
    const viewButton = screen.getByRole("button", { name: /View Prompt/i });
    fireEvent.click(viewButton);

    // Assert error was logged
    await waitFor(() => {
      expect(mockAddLog).toHaveBeenCalledWith({
        type: "prompt",
        operation: "View Prompt",
        status: "error",
        name: "testPrompt",
        error: "Failed to get prompt details",
      });
    });
  });
});
