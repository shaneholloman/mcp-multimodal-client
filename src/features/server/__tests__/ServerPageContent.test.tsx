import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServerPageContent } from "../components/ServerPageContent";
import type { ServerState, ServerActions } from "../hooks/useServer";
import { McpProvider } from "@/contexts/McpContext";

const mockServerState: ServerState = {
  isConnected: true,
  isConnecting: false,
  hasError: false,
  error: null,
  tools: [],
  prompts: [],
  resources: [],
  hasListToolsCapability: true,
  hasListPromptsCapability: true,
  hasListResourcesCapability: true,
  serverInfo: {
    name: "Test Server",
    version: "1.0.0",
    protocolVersion: "1",
    capabilities: {
      tools: { listChanged: true },
      prompts: { listChanged: true },
      resources: { listChanged: true },
    },
  },
};

const mockServerActions: ServerActions = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  fetchTools: vi.fn(),
  executeTool: vi.fn(),
  fetchPrompts: vi.fn(),
  selectPrompt: vi.fn(),
  getPromptDetails: vi.fn(),
  executePrompt: vi.fn(),
  fetchResources: vi.fn(),
  readResource: vi.fn(),
};

const mockUseServer = vi.fn(() => ({
  state: mockServerState,
  actions: mockServerActions,
}));

// Mock all required contexts
vi.mock("../hooks/useServer", () => ({
  useServer: () => mockUseServer(),
}));

vi.mock("@/contexts/LlmProviderContext", () => ({
  GlobalLlmProvider: ({ children }: { children: React.ReactNode }) => children,
  useGlobalLlm: () => ({
    executePrompt: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/features/llm-registry", () => ({
  LlmRegistryProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useLlmRegistry: () => ({
    providers: [],
    activeProvider: null,
    setActiveProvider: vi.fn(),
    getProviderConfig: vi.fn(),
    getProviderInstance: vi.fn(),
    registerProvider: vi.fn(),
    unregisterProvider: vi.fn(),
    providerConfig: {},
    updateProviderConfig: vi.fn(),
  }),
}));

vi.mock("@/providers/gemini", () => ({
  GeminiProvider: ({ children }: { children: React.ReactNode }) => children,
  useGemini: () => ({
    executePrompt: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe("ServerPageContent", () => {
  const mockServerId = "test-server";
  const mockServerName = "Test Server";

  const renderComponent = () => {
    return render(
      <McpProvider>
        <ServerPageContent
          serverId={mockServerId}
          serverName={mockServerName}
        />
      </McpProvider>
    );
  };

  it("renders the tools section when tools are available", () => {
    mockUseServer.mockReturnValueOnce({
      state: {
        ...mockServerState,
        tools: [
          {
            name: "test-tool",
            description: "A test tool",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      },
      actions: mockServerActions,
    });

    renderComponent();
    expect(screen.getByRole("button", { name: "Tools" })).toBeInTheDocument();
  });

  it("renders empty tools section when no tools are available", () => {
    mockUseServer.mockReturnValueOnce({
      state: {
        ...mockServerState,
        hasListToolsCapability: false,
        tools: [],
      },
      actions: mockServerActions,
    });

    renderComponent();
    expect(screen.getByText("No tools loaded")).toBeInTheDocument();
  });

  it("renders error state when there is an error", () => {
    mockUseServer.mockReturnValueOnce({
      state: {
        ...mockServerState,
        hasError: true,
        error: new Error("Connection error"),
      },
      actions: mockServerActions,
    });

    renderComponent();
    const errorContainers = screen.getAllByTestId("status-container-danger");
    expect(errorContainers.length).toBeGreaterThan(0);
    errorContainers.forEach((container) => {
      expect(container).toHaveTextContent(/connection error/i);
      expect(container).toHaveTextContent(/failed to connect to server/i);
    });
  });

  it("shows refresh button when tools capability exists without listChanged", () => {
    mockUseServer.mockReturnValue({
      state: {
        ...mockServerState,
        serverInfo: {
          ...mockServerState.serverInfo!,
          capabilities: {
            tools: { listChanged: false },
            prompts: { listChanged: true },
            resources: { listChanged: true },
          },
        },
      },
      actions: mockServerActions,
    });

    renderComponent();
    const refreshIcon = screen.getByTestId("tools-refresh-button");
    expect(refreshIcon).toBeInTheDocument();
  });

  it("hides prompts and resources sections when server lacks capabilities", () => {
    mockUseServer.mockReturnValueOnce({
      state: {
        ...mockServerState,
        hasListPromptsCapability: false,
        hasListResourcesCapability: false,
      },
      actions: mockServerActions,
    });

    renderComponent();
    expect(
      screen.queryByRole("button", { name: "Prompts" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Resources" })
    ).not.toBeInTheDocument();
  });

  it("shows prompts and resources sections when server has capabilities", () => {
    mockUseServer.mockReturnValueOnce({
      state: mockServerState,
      actions: mockServerActions,
    });

    renderComponent();
    expect(screen.getByRole("button", { name: "Prompts" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resources" })
    ).toBeInTheDocument();
  });
});
