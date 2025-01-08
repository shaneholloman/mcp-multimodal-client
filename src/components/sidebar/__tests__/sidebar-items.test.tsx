import React, { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSidebarItems } from "../SidebarItems";
import { McpContext } from "../../../contexts/McpContext";
import type {
  McpClientState,
  McpContextType,
} from "../../../contexts/McpContext.types";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockConfig = {
  defaults: {
    serverTypes: {
      sse: {
        icon: "solar:server-square-cloud-line-duotone",
        color: "primary",
        description: "Remote SSE-based MCP server",
      },
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
  sse: {
    systemprompt: {
      metadata: {
        icon: "solar:programming-line-duotone",
        color: "success",
        description: "Systemprompt-based MCP server instance",
      },
    },
  },
  mcpServers: {
    filesystem: {
      metadata: {
        icon: "solar:folder-with-files-line-duotone",
        color: "primary",
        description: "Local filesystem MCP server",
      },
    },
  },
};

// Mock the config module
vi.doMock("@config/mcp.config.json", () => ({
  default: mockConfig,
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const mockClients: Record<string, McpClientState> = {
    systemprompt: {
      connectionStatus: "connected",
      client: null,
      serverType: "sse",
      serverUrl: "http://api.systemprompt.io/v1/mcp/",
      apiKey: "test-key",
      resources: [],
      prompts: [],
      tools: [],
      loadedResources: [],
      serverConfig: {
        key: "systemprompt",
        label: "Systemprompt",
        icon: mockConfig.sse.systemprompt.metadata.icon,
        color: "success",
        description: mockConfig.sse.systemprompt.metadata.description,
        serverId: "systemprompt",
      },
    },
    filesystem: {
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
        key: "filesystem",
        label: "Filesystem",
        icon: mockConfig.mcpServers.filesystem.metadata.icon,
        color: "primary",
        description: mockConfig.mcpServers.filesystem.metadata.description,
        serverId: "filesystem",
      },
    },
    systempromptLocal: {
      connectionStatus: "disconnected",
      client: null,
      serverType: "sse",
      serverUrl: "http://localhost/v1/mcp/",
      apiKey: "test-key",
      resources: [],
      prompts: [],
      tools: [],
      loadedResources: [],
      serverConfig: {
        key: "systempromptLocal",
        label: "Systemprompt Local",
        icon: mockConfig.defaults.serverTypes.sse.icon,
        color: "secondary",
        description: mockConfig.defaults.serverTypes.sse.description,
        serverId: "systempromptLocal",
      },
    },
  };

  const mockContext: McpContextType = {
    clients: mockClients,
    activeClients: ["systemprompt", "filesystem"],
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
  it("should use correct default icons for server types", () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    const serverSection = result.current.sections.find(
      (section) => section.title === "Servers"
    );
    expect(serverSection).toBeDefined();

    // Test SSE server (systemprompt)
    const sseServer = serverSection?.items.find(
      (item) => item.serverId === "systemprompt"
    );
    expect(sseServer?.icon).toBe(mockConfig.sse.systemprompt.metadata.icon);

    // Test stdio server (filesystem)
    const stdioServer = serverSection?.items.find(
      (item) => item.serverId === "filesystem"
    );
    expect(stdioServer?.icon).toBe(
      mockConfig.mcpServers.filesystem.metadata.icon
    );

    // Test disconnected server (systempromptLocal)
    const disconnectedServer = serverSection?.items.find(
      (item) => item.serverId === "systempromptLocal"
    );
    expect(disconnectedServer?.icon).toBe(mockConfig.defaults.unconnected.icon);
  });

  it("should respect custom metadata icons when provided", () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    const serverSection = result.current.sections.find(
      (section) => section.title === "Servers"
    );

    // Test server with custom metadata from config
    const customServer = serverSection?.items.find(
      (item) => item.serverId === "systemprompt"
    );
    expect(customServer?.icon).toBe(mockConfig.sse.systemprompt.metadata.icon);
  });
});
