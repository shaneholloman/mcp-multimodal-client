export interface ServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface SSEServerConfig {
  url: string;
  apiKey: string;
}

export interface McpConfig {
  sse: {
    systemprompt: SSEServerConfig;
  };
  mcpServers: Record<string, ServerConfig>;
}

export interface JsonRpcMessage {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
  id?: string | number;
}
