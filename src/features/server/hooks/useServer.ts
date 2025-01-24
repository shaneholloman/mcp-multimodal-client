import { useMcp } from "@/contexts/McpContext";
import {
  GetPromptRequest,
  GetPromptResult,
  Prompt,
  Resource,
  Tool,
  CreateMessageRequest,
  CreateMessageResult,
  ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";
import { useGlobalLlm } from "@/contexts/LlmProviderContext";
import { McpMeta } from "@/types/mcp";

interface UseServerOptions {
  onError?: (error: Error) => void;
  serverId: string;
}

export interface ServerState {
  isConnected: boolean;
  isConnecting: boolean;
  hasError: boolean;
  error: Error | null;
  tools: Tool[];
  prompts: Prompt[];
  resources: Resource[];
  hasListToolsCapability: boolean;
  hasListPromptsCapability: boolean;
  hasListResourcesCapability: boolean;
  serverInfo?: {
    name: string;
    version: string;
    protocolVersion: string;
    capabilities: ServerCapabilities;
  };
}

export interface ServerActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchTools: () => Promise<void>;
  executeTool: (
    toolName: string,
    params: Record<string, unknown>
  ) => Promise<unknown>;
  fetchPrompts: () => Promise<void>;
  selectPrompt: (promptName: string) => Promise<void>;
  getPromptDetails: (
    request: GetPromptRequest["params"]
  ) => Promise<GetPromptResult>;
  executePrompt: (
    promptName: string,
    params: Record<string, unknown>
  ) => Promise<string>;
  fetchResources: () => Promise<void>;
  readResource: (resourceUri: string) => Promise<unknown>;
  executeSamplingRequest: (
    request: CreateMessageRequest["params"]
  ) => Promise<CreateMessageResult>;
}

export function useServer({ onError, serverId }: UseServerOptions): {
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
    executePrompt: getMcpPrompt,
    readResource,
    requestSampling,
  } = useMcp();

  const llmProvider = useGlobalLlm();
  const clientState = clients[serverId];

  // Derive state entirely from MCP Provider state
  const state: ServerState = {
    isConnected: clientState?.connectionStatus === "connected",
    isConnecting: clientState?.connectionStatus === "pending",
    hasError: clientState?.connectionStatus === "error",
    error:
      clientState?.connectionStatus === "error"
        ? new Error("Connection error")
        : null,
    tools: clientState?.tools || [],
    prompts: clientState?.prompts || [],
    resources: clientState?.resources || [],
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

  // Actions that wrap provider functions with error handling
  const actions: ServerActions = {
    connect: async () => {
      try {
        await connectServer(serverId);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
        throw err;
      }
    },
    disconnect: async () => {
      try {
        await disconnectServer(serverId);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
        throw err;
      }
    },
    fetchTools: async () => {
      if (!state.hasListToolsCapability) return;
      try {
        await listTools(serverId);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
        throw err;
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
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
        throw err;
      }
    },
    selectPrompt: async (promptName: string) => {
      try {
        await selectPrompt(serverId, promptName);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
        throw err;
      }
    },
    getPromptDetails: async (
      request: GetPromptRequest["params"]
    ): Promise<GetPromptResult> => {
      try {
        if (!clientState?.client) {
          throw new Error("No MCP client available");
        }
        return await clientState.client.getPrompt(request);
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
    ): Promise<string> => {
      try {
        const result = await getMcpPrompt(serverId, {
          name: promptName,
          args: params,
        });

        const promptDetails = result as unknown as GetPromptResult & {
          _meta: McpMeta;
        };

        if (!promptDetails.messages || !promptDetails._meta) {
          throw new Error("Invalid prompt details returned from MCP");
        }

        return await llmProvider.executePrompt({
          name: promptName,
          messages: promptDetails.messages,
          params,
          _meta: promptDetails._meta,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
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
        throw err;
      }
    },
    readResource: async (resourceUri: string) => {
      try {
        return await readResource(serverId, resourceUri);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(err);
        throw err;
      }
    },
    executeSamplingRequest: async (
      request: CreateMessageRequest["params"]
    ): Promise<CreateMessageResult> => {
      try {
        return await requestSampling(serverId, request);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error("Sampling execution error:", err);
        onError?.(err);
        throw err;
      }
    },
  };

  return { state, actions };
}
