import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSidebarItems } from "../sidebar-items";
import mcpConfig from "@config/mcp.config.json";
import { McpContext } from "@/contexts/McpContext";
import { ReactNode } from "react";
import type {
  McpClientState,
  McpContextType,
} from "@/contexts/McpContext.types";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
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
        icon: mcpConfig.sse.systemprompt.metadata.icon,
        color: "success",
        description: mcpConfig.sse.systemprompt.metadata.description,
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
        icon: mcpConfig.mcpServers.filesystem.metadata.icon,
        color: "primary",
        description: mcpConfig.mcpServers.filesystem.metadata.description,
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
        icon: mcpConfig.sse.systempromptLocal.metadata.icon,
        color: "secondary",
        description: mcpConfig.sse.systempromptLocal.metadata.description,
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
    expect(sseServer?.icon).toBe(mcpConfig.sse.systemprompt.metadata.icon);

    // Test stdio server (filesystem)
    const stdioServer = serverSection?.items.find(
      (item) => item.serverId === "filesystem"
    );
    expect(stdioServer?.icon).toBe(
      mcpConfig.mcpServers.filesystem.metadata.icon
    );

    // Test disconnected server (systempromptLocal)
    const disconnectedServer = serverSection?.items.find(
      (item) => item.serverId === "systempromptLocal"
    );
    expect(disconnectedServer?.icon).toBe(mcpConfig.defaults.unconnected.icon);
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
    expect(customServer?.icon).toBe(mcpConfig.sse.systemprompt.metadata.icon);
  });
});
