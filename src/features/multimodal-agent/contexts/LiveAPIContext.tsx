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
    // Find the first client that has the requested tool
    const clientEntry = Object.entries(clients).find(
      ([, client]) =>
        client.connectionStatus === "connected" &&
        client.tools?.some((tool) => tool.name === toolName)
    );

    if (clientEntry) {
      const [clientId] = clientEntry;
      return await executeTool(clientId, { name: toolName, args });
    }

    return undefined;
  };

  const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;
  const liveAPI = useLiveAPI({ url });

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
