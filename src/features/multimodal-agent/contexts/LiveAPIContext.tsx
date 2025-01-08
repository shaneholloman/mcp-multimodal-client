import { createContext, FC, ReactNode, useContext } from "react";
import { useLiveAPI, UseLiveAPIResults } from "../hooks/use-live-api";
import { useMcp } from "@/contexts/McpContext";
import llmConfig from "@config/llm.config.json";

type LiveAPIContextType = UseLiveAPIResults;

const LiveAPIContext = createContext<LiveAPIContextType | undefined>(undefined);

export type LiveAPIProviderProps = {
  children: ReactNode;
};

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({ children }) => {
  const API_KEY = llmConfig.config.apiKey;
  if (!API_KEY) {
    throw new Error("API key not found in config/llm.config.json");
  }

  const { clients, executeTool } = useMcp();

  const executeToolAction = async (
    toolName: string,
    args: Record<string, unknown>
  ) => {
    // Get tools from all active clients
    const availableTools = Object.entries(clients)
      .filter(([, client]) => client.connectionStatus === "connected")
      .reduce<(typeof clients)[string]["tools"]>((acc, [, client]) => {
        if (client.tools) {
          return [...acc, ...client.tools];
        }
        return acc;
      }, []);

    console.log("Available tools:", availableTools);

    // Check if the tool is available in any MCP client
    const mcpTool = availableTools.find((tool) => tool.name === toolName);
    console.log("Found tool:", mcpTool);

    if (mcpTool) {
      const clientWithTool = Object.entries(clients).find(
        ([, client]) =>
          client.connectionStatus === "connected" &&
          client.tools?.some((tool) => tool.name === toolName)
      );
      console.log("Client with tool:", clientWithTool);

      if (clientWithTool) {
        console.log("Executing tool with client:", clientWithTool[0]);
        return await executeTool(clientWithTool[0], { name: toolName, args });
      }
    }
    return undefined; // Explicitly return undefined when tool is not found
  };

  const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;
  const liveAPI = useLiveAPI({ url });

  console.log("LiveAPIProvider - Creating context with:", {
    liveAPI,
    executeToolAction,
    clients,
  });

  return (
    <LiveAPIContext.Provider
      value={{
        ...liveAPI,
        executeToolAction,
      }}
    >
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error("useLiveAPIContext must be used within a LiveAPIProvider");
  }
  return context;
};
