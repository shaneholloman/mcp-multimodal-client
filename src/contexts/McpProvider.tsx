/**
 * This file contains the implementation of the MCP Provider.
 * It manages the connection state and operations for all MCP servers.
 *
 * @see McpContext.tsx for the context definition
 * @see McpContext.types.ts for type definitions
 */
import { useState } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";
import { McpContext } from "./McpContext";
import type { McpClientState, ServerCapabilities } from "./McpContext.types";
import { getServerConfig } from "../../config/server.config";
import type { ServerMetadata } from "../../config/types";

type ToolCall = z.infer<typeof CallToolResultSchema>;

// Default state for a new client
const DEFAULT_CLIENT_STATE: McpClientState = {
  client: null,
  connectionStatus: "disconnected",
  serverType: "stdio",
  serverUrl: "",
  apiKey: "",
  resources: [],
  prompts: [],
  tools: [],
  loadedResources: [],
};

export function McpProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Record<string, McpClientState>>({});

  // Get array of active client IDs
  const activeClients = Object.entries(clients)
    .filter(([, { connectionStatus }]) => connectionStatus === "connected")
    .map(([id]) => id);

  const connectServer = async (serverId: string) => {
    try {
      if (clients[serverId]?.client) {
        return;
      }

      setClients((prev) => ({
        ...prev,
        [serverId]: {
          ...DEFAULT_CLIENT_STATE,
          client: null,
          connectionStatus: "pending",
        },
      }));

      const client = new Client(
        {
          name: `mcp-client-${serverId}`,
          version: "0.0.1",
        },
        {
          capabilities: {
            tools: {
              listTools: true,
            },
            prompts: {
              listPrompts: true,
            },
            resources: {
              listResources: true,
            },
            logging: {},
          },
        }
      );

      client.onclose = () => {
        setClients((prev) => ({
          ...prev,
          [serverId]: {
            ...prev[serverId],
            connectionStatus: "disconnected",
            client: null,
          },
        }));
      };

      client.fallbackNotificationHandler = async (notification: {
        method: string;
        params?: unknown;
      }) => {
        console.log("Notification received:", notification);

        switch (notification.method) {
          case "notifications/tools/list_changed": {
            console.log("Tools changed notification received:", notification);
            const result = await client.listTools();
            console.log("New tools list:", result.tools);
            setClients((prev) => {
              const updated = {
                ...prev,
                [serverId]: {
                  ...prev[serverId],
                  tools: result.tools,
                },
              };
              console.log("Updated client state:", updated[serverId].tools);
              return updated;
            });
            break;
          }

          case "notifications/prompts/list_changed": {
            console.log("Prompts changed notification received:", notification);
            const result = await client.listPrompts();
            console.log("New prompts list:", result.prompts);
            setClients((prev) => {
              const updated = {
                ...prev,
                [serverId]: {
                  ...prev[serverId],
                  prompts: result.prompts,
                },
              };
              console.log("Updated client state:", updated[serverId].prompts);
              return updated;
            });
            break;
          }

          case "notifications/resources/list_changed": {
            console.log(
              "Resources changed notification received:",
              notification
            );
            const result = await client.listResources();
            console.log("New resources list:", result.resources);
            setClients((prev) => {
              const updated = {
                ...prev,
                [serverId]: {
                  ...prev[serverId],
                  resources: result.resources,
                },
              };
              console.log("Updated client state:", updated[serverId].resources);
              return updated;
            });
            break;
          }
        }
      };

      let serverType: "stdio" | "sse" = "sse";

      const proxyUrl = new URL("http://localhost:3000/sse");
      proxyUrl.searchParams.append("transportType", "stdio");
      proxyUrl.searchParams.append("serverId", serverId);
      const transport = new SSEClientTransport(proxyUrl);

      serverType = "stdio";

      // Connect first
      await client.connect(transport);

      // Then get server info
      const serverInfo = client.getServerVersion();
      if (!serverInfo || typeof serverInfo !== "object") {
        throw new Error("Failed to get server info");
      }
      const capabilities = client.getServerCapabilities();

      // Fetch available tools, prompts, and resources based on capabilities
      let tools: McpClientState["tools"] = [];
      let prompts: McpClientState["prompts"] = [];
      let resources: McpClientState["resources"] = [];

      if (capabilities && typeof capabilities === "object") {
        if ("tools" in capabilities) {
          const result = await client.listTools();
          tools = result.tools;
        }
        if ("prompts" in capabilities) {
          const result = await client.listPrompts();
          prompts = result.prompts;
        }
        if ("resources" in capabilities) {
          const result = await client.listResources();
          resources = result.resources;
        }
      }

      // Get server config with metadata from the server
      const serverConfig = getServerConfig(
        serverId,
        serverInfo.metadata as ServerMetadata | undefined,
        true // Server is connected when we get the metadata
      );

      setClients((prev) => ({
        ...prev,
        [serverId]: {
          ...DEFAULT_CLIENT_STATE,
          client,
          connectionStatus: "connected",
          serverType,
          tools,
          prompts,
          resources,
          serverInfo: {
            name: String(serverInfo.name || ""),
            version: String(serverInfo.version || ""),
            protocolVersion: String(serverInfo.protocolVersion || ""),
            capabilities: capabilities as ServerCapabilities,
            metadata: serverInfo.metadata as ServerMetadata | undefined,
          },
          serverConfig,
        },
      }));
    } catch (e) {
      console.error("Connection error:", e);
      setClients((prev) => ({
        ...prev,
        [serverId]: {
          ...DEFAULT_CLIENT_STATE,
          client: null,
          connectionStatus: "error",
        },
      }));
      throw e;
    }
  };

  const disconnectServer = async (serverId: string) => {
    const clientState = clients[serverId];
    if (!clientState?.client) return;

    try {
      await clientState.client.close();
      setClients((prev) => ({
        ...prev,
        [serverId]: {
          ...prev[serverId],
          client: null,
          connectionStatus: "disconnected",
        },
      }));
    } catch (e) {
      console.error("Disconnection error:", e);
      throw e;
    }
  };

  const listResources = async (serverId: string) => {
    const clientState = clients[serverId];
    if (!clientState?.client) {
      console.error("No client");
      return;
    }
    const result = await clientState.client.listResources();
    setClients((prev) => ({
      ...prev,
      [serverId]: {
        ...prev[serverId],
        resources: result.resources,
      },
    }));
  };

  const listPrompts = async (serverId: string) => {
    const clientState = clients[serverId];
    if (!clientState?.client) {
      console.error("No client");
      return;
    }
    try {
      const result = await clientState.client.listPrompts();
      setClients((prev) => ({
        ...prev,
        [serverId]: {
          ...prev[serverId],
          prompts: result.prompts,
        },
      }));
    } catch (error) {
      console.error("Error in listPrompts:", error);
      throw error;
    }
  };

  const executeTool = async (
    serverId: string,
    params: {
      name: string;
      args: Record<string, unknown>;
    }
  ) => {
    const clientState = clients[serverId];
    if (!clientState?.client) {
      console.error("No client");
      throw new Error("No MCP client available");
    }
    try {
      const response = await clientState.client.callTool(
        {
          name: params.name,
          arguments: params.args,
        },
        CallToolResultSchema
      );
      return response as ToolCall;
    } catch (error) {
      console.error("Error in executeTool:", error);
      throw error;
    }
  };

  const executePrompt = async (
    serverId: string,
    params: {
      name: string;
      args: Record<string, unknown>;
    }
  ) => {
    const clientState = clients[serverId];
    if (!clientState?.client) {
      console.error("No client");
      throw new Error("No MCP client available");
    }
    try {
      const response = await clientState.client.getPrompt({
        name: params.name,
        arguments: Object.fromEntries(
          Object.entries(params.args).map(([key, value]) => [
            key,
            String(value),
          ])
        ),
      });
      return response;
    } catch (error) {
      console.error("Error in executePrompt:", error);
      throw error;
    }
  };

  const listTools = async (serverId: string) => {
    const clientState = clients[serverId];
    if (!clientState?.client) {
      console.error("No client");
      return;
    }
    const result = await clientState.client.listTools();
    setClients((prev) => ({
      ...prev,
      [serverId]: {
        ...prev[serverId],
        tools: result.tools,
      },
    }));
  };

  const selectPrompt = async (serverId: string, promptId: string) => {
    const clientState = clients[serverId];
    if (!clientState?.client) return;
    const result = await clientState.client.getPrompt({
      name: promptId,
      arguments: {
        message: "Initializing MCP Prompt",
      },
    });

    interface PromptMeta {
      _meta?: {
        prompt?: {
          instruction?: {
            static?: boolean;
          };
        };
      };
    }

    if (!result || !(result as PromptMeta)._meta?.prompt?.instruction?.static) {
      console.error("Couldnt get prompt");
      return;
    }
    setClients((prev) => ({
      ...prev,
      [serverId]: {
        ...prev[serverId],
        selectedPrompt: result,
      },
    }));
  };

  const readResource = async (serverId: string, resourceName: string) => {
    const clientState = clients[serverId];
    if (!clientState?.client) {
      console.error("No client");
      throw new Error("No MCP client available");
    }
    try {
      const response = await clientState.client.readResource({
        uri: resourceName,
      });
      return response;
    } catch (error) {
      console.error("Error in readResource:", error);
      throw error;
    }
  };

  return (
    <McpContext.Provider
      value={{
        clients,
        activeClients,
        connectServer,
        disconnectServer,
        selectPrompt,
        listResources,
        listPrompts,
        listTools,
        executeTool,
        executePrompt,
        readResource,
      }}
    >
      <div data-testid="mcp-provider">{children}</div>
    </McpContext.Provider>
  );
}
