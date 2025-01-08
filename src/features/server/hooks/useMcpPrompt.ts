import { useMcp } from "@/contexts/McpContext";

interface Prompt {
  name: string;
  description?: string;
  type?: string;
  inputSchema?: {
    type: "object";
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
  messages?: Array<{
    role: "user" | "assistant";
    content: {
      type: "text";
      text: string;
    };
  }>;
}

interface McpPromptResponse {
  name?: string;
  description?: string;
  type?: string;
  input?: {
    schema?: {
      type: "object";
      properties?: Record<string, { type: string; description?: string }>;
      required?: string[];
    };
  };
  messages?: Array<{
    role: "user" | "assistant";
    content: {
      type: "text";
      text: string;
    };
  }>;
}

interface UseMcpPromptProps {
  serverId: string;
}

interface UseMcpPromptReturn {
  isAvailable: boolean;
  isLoading: boolean;
  getPrompt: (name: string, args?: Record<string, string>) => Promise<Prompt>;
}

export function useMcpPrompt({
  serverId,
}: UseMcpPromptProps): UseMcpPromptReturn {
  const { clients } = useMcp();
  const clientState = clients[serverId];

  const isAvailable = Boolean(
    clientState?.client && clientState.connectionStatus === "connected"
  );

  const getPrompt = async (
    name: string,
    args: Record<string, string> = {}
  ): Promise<Prompt> => {
    if (!clientState?.client) {
      throw new Error("No MCP client available");
    }

    if (clientState.connectionStatus === "pending") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getPrompt(name, args);
    }

    const result = (await clientState.client.getPrompt({
      name,
      arguments: args,
    })) as McpPromptResponse;

    return {
      name,
      description: result.description,
      type: result.type,
      inputSchema: result.input?.schema || {
        type: "object",
        properties: {},
      },
      messages: result.messages,
    };
  };

  return {
    isAvailable,
    isLoading: clientState?.connectionStatus === "pending",
    getPrompt,
  };
}
