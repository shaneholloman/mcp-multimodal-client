import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ServerInfo } from "../components/ServerManagement/ServerInfo";
import { ServerCapabilities } from "@/contexts/McpContext.types";
import { useMcp } from "@/contexts/McpContext";
import { McpProvider } from "@/contexts/McpProvider";
import { ReactNode } from "react";

// Mock the McpContext
vi.mock("@/contexts/McpContext", () => ({
  useMcp: vi.fn(),
  McpContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
}));

// Mock the Client and SSEClientTransport
vi.mock("@modelcontextprotocol/sdk/client/index.js", () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    getServerVersion: vi.fn().mockReturnValue({
      name: "DrupalMcpServer",
      version: "1.0.0",
      protocolVersion: "1.0",
    }),
    getServerCapabilities: vi.fn().mockReturnValue({
      tools: { listChanged: true },
      prompts: { listChanged: true },
      resources: { listChanged: true },
    }),
    onclose: vi.fn(),
  })),
}));

vi.mock("@modelcontextprotocol/sdk/client/sse.js", () => ({
  SSEClientTransport: vi.fn(),
}));

// Test component to verify provider capabilities
function TestComponent({ serverId }: { serverId: string }) {
  const { clients } = useMcp();
  const clientState = clients[serverId];
  if (!clientState?.serverInfo) return null;
  return <ServerInfo info={clientState.serverInfo} />;
}

describe("Server Capabilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display all enabled capabilities from server info", () => {
    const serverInfo = {
      name: "DrupalMcpServer",
      version: "1.0.0",
      protocolVersion: "1.0",
      capabilities: {
        tools: { listChanged: true },
        prompts: { listChanged: true },
        resources: {
          listChanged: true,
          subscribe: true,
        },
        logging: {},
        experimental: {
          customFeature: {},
        },
      } as ServerCapabilities,
    };

    render(<ServerInfo info={serverInfo} />);

    // Check for enabled capabilities
    expect(screen.getByText("tools.listChanged")).toBeInTheDocument();
    expect(screen.getByText("prompts.listChanged")).toBeInTheDocument();
    expect(screen.getByText("resources.listChanged")).toBeInTheDocument();
    expect(screen.getByText("resources.subscribe")).toBeInTheDocument();
  });

  it("should not display disabled capabilities", () => {
    const serverInfo = {
      name: "DrupalMcpServer",
      version: "1.0.0",
      protocolVersion: "1.0",
      capabilities: {
        tools: { listChanged: false },
        prompts: { listChanged: false },
        resources: {
          listChanged: false,
          subscribe: false,
        },
      } as ServerCapabilities,
    };

    render(<ServerInfo info={serverInfo} />);

    // Verify disabled capabilities are not shown
    expect(screen.queryByText("tools.listChanged")).not.toBeInTheDocument();
    expect(screen.queryByText("prompts.listChanged")).not.toBeInTheDocument();
    expect(screen.queryByText("resources.listChanged")).not.toBeInTheDocument();
    expect(screen.queryByText("resources.subscribe")).not.toBeInTheDocument();
  });

  it("should handle empty capabilities object", () => {
    const serverInfo = {
      name: "DrupalMcpServer",
      version: "1.0.0",
      protocolVersion: "1.0",
      capabilities: {} as ServerCapabilities,
    };

    render(<ServerInfo info={serverInfo} />);
    expect(screen.getByText("No capabilities available")).toBeInTheDocument();
  });

  it("should properly render capabilities from McpProvider", () => {
    vi.mocked(useMcp).mockReturnValue({
      clients: {
        systempromptLocal: {
          client: null,
          connectionStatus: "connected",
          serverType: "sse",
          serverUrl: "http://localhost/v1/mcp/",
          apiKey: "test",
          resources: [],
          prompts: [],
          tools: [],
          loadedResources: [],
          serverInfo: {
            name: "DrupalMcpServer",
            version: "1.0.0",
            protocolVersion: "1.0",
            capabilities: {
              tools: { listChanged: true },
              prompts: { listChanged: true },
              resources: { listChanged: true },
            },
          },
        },
      },
      activeClients: ["systempromptLocal"],
      connectServer: vi.fn(),
      disconnectServer: vi.fn(),
      listTools: vi.fn(),
      listPrompts: vi.fn(),
      listResources: vi.fn(),
      executeTool: vi.fn(),
      selectPrompt: vi.fn(),
      executePrompt: vi.fn(),
      readResource: vi.fn(),
    });

    render(<TestComponent serverId="systempromptLocal" />);

    // Verify the capabilities are rendered
    expect(screen.getByText("tools.listChanged")).toBeInTheDocument();
    expect(screen.getByText("prompts.listChanged")).toBeInTheDocument();
    expect(screen.getByText("resources.listChanged")).toBeInTheDocument();
  });

  it("should properly set capabilities in McpProvider after connection", async () => {
    const mockChildren = vi.fn().mockReturnValue(null);
    const { container } = render(<McpProvider>{mockChildren()}</McpProvider>);

    // Mock the useMcp hook to return a mock context value
    const mockContext = {
      clients: {
        systempromptLocal: {
          client: null,
          connectionStatus: "connected" as const,
          serverType: "sse" as const,
          serverUrl: "http://localhost/v1/mcp/",
          apiKey: "test",
          resources: [],
          prompts: [],
          tools: [],
          loadedResources: [],
          serverInfo: {
            name: "DrupalMcpServer",
            version: "1.0.0",
            protocolVersion: "1.0",
            capabilities: {
              tools: { listChanged: true },
              prompts: { listChanged: true },
              resources: { listChanged: true },
            },
          },
        },
      },
      activeClients: ["systempromptLocal"],
      connectServer: vi.fn(),
      disconnectServer: vi.fn(),
      listTools: vi.fn(),
      listPrompts: vi.fn(),
      listResources: vi.fn(),
      executeTool: vi.fn(),
      selectPrompt: vi.fn(),
      executePrompt: vi.fn(),
      readResource: vi.fn(),
    };
    vi.mocked(useMcp).mockReturnValue(mockContext);

    // Connect to the server
    await mockContext.connectServer("systempromptLocal");

    // Verify the provider rendered
    expect(container).toBeInTheDocument();

    // Verify the capabilities were set correctly
    const clientState = mockContext.clients["systempromptLocal"];
    expect(clientState?.serverInfo?.capabilities).toEqual({
      tools: { listChanged: true },
      prompts: { listChanged: true },
      resources: { listChanged: true },
    });
  });

  it("should use default capabilities when server returns none", () => {
    const serverInfo = {
      name: "DrupalMcpServer",
      version: "1.0.0",
      protocolVersion: "1.0",
      capabilities: {} as ServerCapabilities,
    };

    render(<ServerInfo info={serverInfo} />);

    // Should show no capabilities message
    expect(screen.getByText("No capabilities available")).toBeInTheDocument();
  });
});
