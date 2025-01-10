import React, { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSidebarItems } from "../SidebarItems";
import { McpContext } from "../../../contexts/McpContext";
import type {
  McpClientState,
  McpContextType,
} from "../../../contexts/McpContext.types";

// Mock modules
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../contexts/McpContext", async () => {
  const actual = await vi.importActual<
    typeof import("../../../contexts/McpContext")
  >("../../../contexts/McpContext");
  return {
    ...actual,
    McpContext: React.createContext<McpContextType | null>(null),
  };
});

// Mock the config module
const mockConfig = {
  defaults: {
    serverTypes: {
      stdio: {
        icon: "solar:server-minimalistic-line-duotone",
        color: "primary",
        description: "Local stdio-based MCP server",
      },
    },
    unconnected: {
      icon: "solar:server-square-line-duotone",
      color: "secondary",
      description: "Remote MCP server (not connected)",
    },
  },
  mcpServers: {
    "systemprompt-dev": {
      command: "npx",
      args: [],
      metadata: {
        icon: "solar:programming-line-duotone",
        color: "success",
        description: "Systemprompt Agent MCP server",
      },
    },
    "systemprompt-agent-server": {
      command: "npx",
      args: [],
      metadata: {
        icon: "solar:programming-line-duotone",
        color: "success",
        description: "Systemprompt Agent MCP server",
      },
    },
  },
};

vi.mock("../../../config/mcp.config.json", () => ({
  default: mockConfig,
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const mockClients: Record<string, McpClientState> = {
    "systemprompt-dev": {
      connectionStatus: "connected",
      client: null,
      serverType: "stdio",
      serverUrl: "",
      apiKey: "",
      resources: [],
      prompts: [],
      tools: [],
      loadedResources: [],
      serverConfig: {
        key: "systemprompt-dev",
        label: "Systemprompt Dev",
        icon: mockConfig.mcpServers["systemprompt-dev"].metadata.icon,
        color: "success",
        description:
          mockConfig.mcpServers["systemprompt-dev"].metadata.description,
        serverId: "systemprompt-dev",
      },
    },
    "systemprompt-agent-server": {
      connectionStatus: "disconnected",
      client: null,
      serverType: "stdio",
      serverUrl: "",
      apiKey: "",
      resources: [],
      prompts: [],
      tools: [],
      loadedResources: [],
      serverConfig: {
        key: "systemprompt-agent-server",
        label: "Systemprompt Agent Server",
        icon: mockConfig.defaults.unconnected.icon,
        color: "secondary",
        description: mockConfig.defaults.unconnected.description,
        serverId: "systemprompt-agent-server",
      },
    },
  };

  const mockContext: McpContextType = {
    clients: mockClients,
    activeClients: ["systemprompt-dev"],
    connectServer: vi.fn(),
    disconnectServer: vi.fn(),
    selectPrompt: vi.fn(),
    executePrompt: vi.fn(),
    listResources: vi.fn(),
    listPrompts: vi.fn(),
    listTools: vi.fn(),
    executeTool: vi.fn(),
    readResource: vi.fn(),
  };

  return (
    <McpContext.Provider value={mockContext}>{children}</McpContext.Provider>
  );
};

describe("useSidebarItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all sidebar sections", () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    expect(result.current.sections).toHaveLength(4);
    expect(result.current.sections.map((s) => s.title)).toEqual([
      "Main",
      "Servers",
      "Settings",
      "Help",
    ]);
  });

  it("should render main section items correctly", () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    const mainSection = result.current.sections.find((s) => s.title === "Main");
    expect(mainSection?.items).toHaveLength(2);
    expect(mainSection?.items.map((i) => i.label)).toEqual([
      "Agents",
      "Create Agent",
    ]);
  });

  it("should render server items with correct connection states", () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    const serverSection = result.current.sections.find(
      (s) => s.title === "Servers"
    );
    expect(serverSection).toBeDefined();

    // Test connected server
    const connectedServer = serverSection?.items.find(
      (item) => item.serverId === "systemprompt-dev"
    );
    expect(connectedServer?.icon).toBe(
      mockConfig.mcpServers["systemprompt-dev"].metadata.icon
    );
    expect(connectedServer?.color).toBe("success");

    // Test disconnected server
    const disconnectedServer = serverSection?.items.find(
      (item) => item.serverId === "systemprompt-agent-server"
    );
    expect(disconnectedServer?.icon).toBe(mockConfig.defaults.unconnected.icon);
    expect(disconnectedServer?.color).toBe("secondary");
  });

  it("should handle navigation when clicking items", () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    result.current.handleItemClick("/test");
    expect(mockNavigate).toHaveBeenCalledWith("/test");
  });

  it("should handle missing server configuration gracefully", () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    const serverSection = result.current.sections.find(
      (s) => s.title === "Servers"
    );
    const items = serverSection?.items || [];

    // Verify all items have required properties
    items.forEach((item) => {
      expect(item.key).toBeDefined();
      expect(item.label).toBeDefined();
      expect(item.icon).toBeDefined();
      expect(item.description).toBeDefined();
      expect(item.href).toBeDefined();
      expect(item.color).toBeDefined();
      expect(item.serverId).toBeDefined();
    });
  });
});
