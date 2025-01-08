import { render, screen } from "@testing-library/react";
import { ConfigCard } from "../../components/config-card/ConfigCard";
import {
  useAgentRegistry,
  AgentRegistryProvider,
} from "@/features/agent-registry";
import { useMcp, McpProvider } from "@/contexts/McpContext";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LiveConfig } from "../../multimodal-live-types";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

// Mock the hooks
vi.mock("@/features/agent-registry", () => ({
  useAgentRegistry: vi.fn(),
  AgentRegistryProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/contexts/McpContext", () => ({
  useMcp: vi.fn(),
  McpProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <McpProvider>
      <AgentRegistryProvider>{ui}</AgentRegistryProvider>
    </McpProvider>
  );
};

describe("ConfigCard", () => {
  const mockConfig: LiveConfig = {
    model: "test-model",
    generationConfig: {
      responseModalities: "audio",
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Test Voice",
          },
        },
      },
    },
    tools: [
      { googleSearch: {} },
      { codeExecution: {} },
      {
        functionDeclarations: [
          {
            name: "testFunction",
            description: "A test function",
          },
        ],
      },
    ],
  };

  const mockMcpState = {
    clients: {
      testServer: {
        client: null,
        resources: [],
        prompts: [],
        tools: [
          {
            name: "mcpTool",
            description: "An MCP tool",
          },
        ] as Tool[],
        loadedResources: [],
        connectionStatus: "connected" as const,
        serverType: "stdio" as const,
      },
    },
    activeClients: ["testServer"],
    executePrompt: vi.fn(),
    readResource: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAgentRegistry as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      config: mockConfig,
      agents: [],
      activeAgent: null,
      loadAgents: vi.fn(),
      saveAgent: vi.fn(),
      deleteAgent: vi.fn(),
      getAgent: vi.fn(),
      setActiveAgent: vi.fn(),
      tools: [],
      setTools: vi.fn(),
      prompt: {
        instruction: { static: "", state: "", dynamic: "" },
        input: { name: "", description: "", type: [], reference: [] },
        output: { name: "", description: "", type: [], reference: [] },
        metadata: { title: "", description: "", tag: [""], log_message: "" },
      },
    });

    (useMcp as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMcpState
    );
  });

  it("renders configuration correctly", () => {
    renderWithProviders(<ConfigCard />);

    expect(screen.getByText("test-model")).toBeInTheDocument();
    expect(screen.getByText("audio")).toBeInTheDocument();
    expect(screen.getByText("Test Voice")).toBeInTheDocument();
  });

  it("renders built-in tools correctly", () => {
    renderWithProviders(<ConfigCard />);

    expect(screen.getByText("Google Search")).toBeInTheDocument();
    expect(screen.getByText("Code Execution")).toBeInTheDocument();
    expect(screen.getByText("testFunction")).toBeInTheDocument();
    expect(screen.getByText("A test function")).toBeInTheDocument();
  });

  it("renders MCP tools correctly", () => {
    renderWithProviders(<ConfigCard />);

    expect(screen.getByText("mcpTool")).toBeInTheDocument();
    expect(screen.getByText("An MCP tool")).toBeInTheDocument();
    expect(screen.getByText("TestServer Server Tools")).toBeInTheDocument();
  });

  it("handles missing configuration gracefully", () => {
    (useAgentRegistry as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      config: {
        model: "test-model",
      } as LiveConfig,
      agents: [],
      activeAgent: null,
      loadAgents: vi.fn(),
      saveAgent: vi.fn(),
      deleteAgent: vi.fn(),
      getAgent: vi.fn(),
      setActiveAgent: vi.fn(),
      tools: [],
      setTools: vi.fn(),
      prompt: {
        instruction: { static: "", state: "", dynamic: "" },
        input: { name: "", description: "", type: [], reference: [] },
        output: { name: "", description: "", type: [], reference: [] },
        metadata: { title: "", description: "", tag: [""], log_message: "" },
      },
    });

    renderWithProviders(<ConfigCard />);

    // Use getAllByText since there may be multiple "Not set" elements
    const notSetElements = screen.getAllByText("Not set");
    expect(notSetElements.length).toBeGreaterThan(0);
  });

  it("handles empty tools list gracefully", () => {
    (useAgentRegistry as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      config: {
        ...mockConfig,
        tools: [],
      },
      agents: [],
      activeAgent: null,
      loadAgents: vi.fn(),
      saveAgent: vi.fn(),
      deleteAgent: vi.fn(),
      getAgent: vi.fn(),
      setActiveAgent: vi.fn(),
      tools: [],
      setTools: vi.fn(),
      prompt: {
        instruction: { static: "", state: "", dynamic: "" },
        input: { name: "", description: "", type: [], reference: [] },
        output: { name: "", description: "", type: [], reference: [] },
        metadata: { title: "", description: "", tag: [""], log_message: "" },
      },
    });

    (useMcp as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clients: {},
      activeClients: [],
      executePrompt: vi.fn(),
      readResource: vi.fn(),
    });

    renderWithProviders(<ConfigCard />);

    expect(screen.queryByText("Built-in Tools")).not.toBeInTheDocument();
  });
});
