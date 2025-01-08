import { useEffect, useState } from "react";
import { useMcp } from "@/contexts/McpContext";
import type { ServerCapabilities } from "@/contexts/McpContext.types";

interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

interface RawResource {
  name: string;
  description?: string;
  type?: string;
  metadata?: unknown;
  uri: string;
}

interface Prompt {
  name: string;
  description?: string;
  type?: string;
  messages?: Array<{
    role: string;
    content: {
      type: string;
      text: string;
    };
  }>;
  inputSchema?: {
    type: "object";
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

interface Resource {
  name: string;
  description?: string;
  type?: string;
  uri: string;
}

interface UseServerOptions {
  /** Whether to automatically connect to the server on mount */
  autoConnect?: boolean;
  /** Callback for handling connection errors */
  onError?: (error: Error) => void;
  /** The server ID to connect to */
  serverId: string;
}

interface McpPromptResponse {
  name?: string;
  description?: string;
  type?: string;
  arguments?: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }>;
  messages?: Array<{
    role: string;
    content: {
      type: string;
      text: string;
    };
  }>;
  _meta?: {
    prompt?: {
      id?: string;
      instruction?: {
        static: string;
        dynamic: string;
        state: string;
      };
      input?: {
        name: string;
        description: string;
        schema: {
          type: string;
          required?: string[];
          properties?: Record<string, { type: string; description?: string }>;
          description?: string;
          additionalProperties?: boolean;
        };
        type: string[];
        reference: unknown[];
      };
      output?: {
        name: string;
        description: string;
        schema: {
          type: string;
          required?: string[];
          properties?: Record<string, { type: string; description?: string }>;
          description?: string;
          additionalProperties?: boolean;
        };
      };
      metadata?: {
        title: string;
        description: string;
        created: string;
        updated: string;
        version: number;
        status: string;
        tag: string[];
      };
    };
  };
}

export interface ServerState {
  /** Whether the server is currently connected */
  isConnected: boolean;
  /** Whether a connection attempt is in progress */
  isConnecting: boolean;
  /** Whether there was an error connecting */
  hasError: boolean;
  /** Any error that occurred during connection */
  error: Error | null;
  /** List of available tools */
  tools: McpTool[];
  /** List of available prompts */
  prompts: Prompt[];
  /** List of available resources */
  resources: Resource[];
  /** Whether the server supports listing tools */
  hasListToolsCapability: boolean;
  /** Whether the server supports listing prompts */
  hasListPromptsCapability: boolean;
  /** Whether the server supports listing resources */
  hasListResourcesCapability: boolean;
  /** Server information including version and capabilities */
  serverInfo?: {
    name: string;
    version: string;
    protocolVersion: string;
    capabilities: ServerCapabilities;
  };
}

export interface ServerActions {
  /** Connect to the server */
  connect: () => Promise<void>;
  /** Disconnect from the server */
  disconnect: () => Promise<void>;
  /** Fetch available tools from the server */
  fetchTools: () => Promise<void>;
  /** Execute a tool with the given parameters */
  executeTool: (
    toolName: string,
    params: Record<string, unknown>
  ) => Promise<unknown>;
  /** Fetch available prompts from the server */
  fetchPrompts: () => Promise<void>;
  /** Select and load a prompt */
  selectPrompt: (promptName: string) => Promise<void>;
  /** Get complete prompt details */
  getPromptDetails: (
    promptName: string,
    args?: Record<string, string>
  ) => Promise<Prompt>;
  /** Execute a prompt with the given parameters */
  executePrompt: (
    promptName: string,
    params: Record<string, unknown>
  ) => Promise<unknown>;
  /** Fetch available resources from the server */
  fetchResources: () => Promise<void>;
  /** Read a resource from the server */
  readResource: (resourceUri: string) => Promise<unknown>;
}

/**
 * Hook for managing server state and operations.
 * Provides a unified interface for connecting to and interacting with an MCP server.
 *
 * @example
 * ```tsx
 * const { state, actions } = useServer({ serverId: "myServer" });
 *
 * // Connect to server
 * useEffect(() => {
 *   actions.connect();
 * }, []);
 *
 * // Use server capabilities
 * if (state.hasListToolsCapability) {
 *   actions.fetchTools();
 * }
 * ```
 */
export function useServer({
  autoConnect = false,
  onError,
  serverId,
}: UseServerOptions): {
  state: ServerState;
  actions: ServerActions;
} {
  const {
    clients,
    connectServer,
    disconnectServer,
    listTools,
    executeTool,
    listPrompts,
    selectPrompt,
    listResources,
    executePrompt,
    readResource,
  } = useMcp();
  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const clientState = clients[serverId];

  const state: ServerState = {
    isConnected: clientState?.connectionStatus === "connected",
    isConnecting: isConnecting || clientState?.connectionStatus === "pending",
    hasError: clientState?.connectionStatus === "error" || error !== null,
    error,
    tools: (clientState?.tools || []) as McpTool[],
    prompts: ((clientState?.prompts || []) as McpPromptResponse[]).map((p) => {
      console.log("Raw prompt:", p);
      console.log("Prompt arguments:", p.arguments);

      // Create input schema from arguments array
      const properties: Record<string, { type: string; description?: string }> =
        {};
      const required: string[] = [];

      if (Array.isArray(p.arguments)) {
        p.arguments.forEach(
          (arg: {
            name: string;
            type: string;
            description?: string;
            required?: boolean;
          }) => {
            properties[arg.name] = {
              type: arg.type,
              description: arg.description,
            };
            if (arg.required) {
              required.push(arg.name);
            }
          }
        );
      }

      return {
        name: p.name || "",
        description: p.description,
        type: p.type,
        inputSchema:
          Object.keys(properties).length > 0
            ? {
                type: "object",
                properties,
                required,
              }
            : undefined,
      };
    }),
    resources: ((clientState?.resources || []) as RawResource[]).map((r) => ({
      name: r.name,
      description: r.description,
      type: r.type,
      uri: r.uri,
    })),
    hasListToolsCapability: Boolean(
      clientState?.serverInfo?.capabilities?.tools
    ),
    hasListPromptsCapability: Boolean(
      clientState?.serverInfo?.capabilities?.prompts
    ),
    hasListResourcesCapability: Boolean(
      clientState?.serverInfo?.capabilities?.resources
    ),
    serverInfo: clientState?.serverInfo,
  };

  const actions: ServerActions = {
    connect: async () => {
      try {
        setIsConnecting(true);
        setError(null);
        await connectServer(serverId);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        onError?.(err);
      } finally {
        setIsConnecting(false);
      }
    },
    disconnect: async () => {
      try {
        await disconnectServer(serverId);
        setError(null);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        onError?.(err);
      }
    },
    fetchTools: async () => {
      if (!state.hasListToolsCapability) return;
      try {
        await listTools(serverId);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
      }
    },
    executeTool: async (toolName: string, params: Record<string, unknown>) => {
      try {
        return await executeTool(serverId, { name: toolName, args: params });
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
        throw err;
      }
    },
    fetchPrompts: async () => {
      if (!state.hasListPromptsCapability) return;
      try {
        await listPrompts(serverId);
        const updatedClientState = clients[serverId];
        console.log("Raw prompts:", updatedClientState?.prompts);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
      }
    },
    selectPrompt: async (promptName: string) => {
      try {
        await selectPrompt(serverId, promptName);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
      }
    },
    getPromptDetails: async (
      promptName: string,
      args?: Record<string, string>
    ) => {
      try {
        const clientState = clients[serverId];
        if (!clientState?.client) {
          throw new Error("No MCP client available");
        }

        // Get the raw prompt first to get the arguments structure
        const rawPrompt = clientState.prompts?.find(
          (p) => p.name === promptName
        ) as McpPromptResponse;
        if (!rawPrompt) {
          throw new Error("Prompt not found");
        }

        // Create input schema from arguments array
        const properties: Record<
          string,
          { type: string; description?: string }
        > = {};
        const required: string[] = [];

        if (Array.isArray(rawPrompt.arguments)) {
          rawPrompt.arguments.forEach((arg) => {
            properties[arg.name] = {
              type: arg.type,
              description: arg.description,
            };
            if (arg.required) {
              required.push(arg.name);
            }
          });
        }

        // If no args provided, return the prompt with just the schema
        if (!args) {
          return {
            name: promptName,
            description: rawPrompt.description,
            type:
              typeof rawPrompt.type === "string" ? rawPrompt.type : undefined,
            inputSchema:
              Object.keys(properties).length > 0
                ? {
                    type: "object",
                    properties,
                    required,
                  }
                : undefined,
          };
        }

        // Only make the MCP call if we have parameters
        const result = (await clientState.client.getPrompt({
          name: promptName,
          arguments: args,
        })) as McpPromptResponse;

        console.log("Full prompt details:", result);

        // Create the prompt details with the schema from the arguments
        const promptDetails: Prompt = {
          name: promptName,
          description: result.description,
          type: typeof result.type === "string" ? result.type : undefined,
          inputSchema:
            Object.keys(properties).length > 0
              ? {
                  type: "object",
                  properties,
                  required,
                }
              : undefined,
          messages: result.messages,
        };

        console.log("Converted prompt details:", promptDetails);
        return promptDetails;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error("Error getting prompt details:", err);
        onError?.(err);
        throw err;
      }
    },
    executePrompt: async (
      promptName: string,
      params: Record<string, unknown>
    ) => {
      try {
        console.log("Executing prompt:", promptName);
        console.log("With parameters:", params);
        const result = await executePrompt(serverId, {
          name: promptName,
          args: params,
        });
        console.log("Prompt execution result:", result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error("Prompt execution error:", err);
        onError?.(err);
        throw err;
      }
    },
    fetchResources: async () => {
      if (!state.hasListResourcesCapability) return;
      try {
        await listResources(serverId);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
      }
    },
    readResource: async (resourceUri: string) => {
      try {
        const result = await readResource(serverId, resourceUri);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
        throw err;
      }
    },
  };

  useEffect(() => {
    if (autoConnect) {
      actions.connect();
    }
    // Only run on mount and when serverId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  return { state, actions };
}
