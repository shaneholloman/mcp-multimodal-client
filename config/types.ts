export interface SSEServerConfig {
  url: string;
  apiKey: string;
  config?: Record<string, unknown>;
  metadata?: ServerMetadata;
}

export interface StdioServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  config?: Record<string, unknown>;
  metadata?: ServerMetadata;
}

export interface ServerFeatures {
  maxNotes?: number;
  serverFeatures?: string[];
  [key: string]: unknown;
}

export interface ServerMetadata {
  name?: string;
  description?: string;
  icon?: string;
  color?: "success" | "warning" | "primary" | "secondary";
  serverStartTime?: number;
  environment?: string;
  customData?: ServerFeatures;
}

export interface McpServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  metadata?: ServerMetadata;
  capabilities: Record<string, unknown>;
}

export interface McpConfig {
  defaults: {
    serverTypes: {
      sse: ServerMetadata;
      stdio: ServerMetadata;
    };
    unconnected: ServerMetadata;
  };
  sse: Record<string, SSEServerConfig>;
  mcpServers: Record<string, StdioServerConfig>;
}
