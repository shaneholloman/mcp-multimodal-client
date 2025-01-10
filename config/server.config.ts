import { SidebarItem } from "@/components/sidebar/types";
import mcpConfig from "./mcp.config.json";
import {
  McpConfig,
  ServerMetadata,
  SSEServerConfig,
  StdioServerConfig,
} from "./types";

/**
 * Determines the server type based on its configuration
 */
export function getServerType(id: string, config: McpConfig): "sse" | "stdio" {
  return config.sse?.systemprompt ? "sse" : "stdio";
}

/**
 * Gets the raw server configuration from the MCP config
 */
export function getRawServerConfig(
  id: string,
  config: McpConfig
): SSEServerConfig | StdioServerConfig | undefined {
  return config.sse?.systemprompt || config.mcpServers[id];
}

/**
 * Builds metadata for a server based on its configuration and state
 */
export function buildServerMetadata(
  id: string,
  config: McpConfig,
  serverMetadata?: ServerMetadata,
  isConnected: boolean = false
): ServerMetadata {
  const serverType = getServerType(id, config);
  const configMetadata = getRawServerConfig(id, config)?.metadata;
  const typeDefaults = config.defaults.serverTypes[serverType];

  if (isConnected) {
    return {
      ...typeDefaults,
      ...configMetadata,
      ...serverMetadata,
    };
  }

  return {
    ...typeDefaults,
    ...configMetadata,
    color: config.defaults.unconnected.color,
    icon:
      configMetadata?.icon ||
      typeDefaults.icon ||
      config.defaults.unconnected.icon,
    name: serverMetadata?.name,
  };
}

/**
 * Formats a server ID into a display label
 */
export function formatServerLabel(id: string, name?: string): string {
  if (name) return name;
  return `${id.charAt(0).toUpperCase()}${id.slice(1)} Server`;
}

/**
 * Gets the configuration for a single server
 */
export function getServerConfig(
  id: string,
  serverMetadata?: ServerMetadata,
  isConnected: boolean = false
): SidebarItem {
  const config = mcpConfig as McpConfig;
  const metadata = buildServerMetadata(id, config, serverMetadata, isConnected);

  return {
    key: `server-${id}`,
    label: formatServerLabel(id, metadata.name),
    icon: metadata.icon,
    color: metadata.color || "secondary",
    href: `/servers/${id}`,
    description: metadata.description || formatServerLabel(id),
    serverId: id,
    metadata,
  };
}

/**
 * Gets configurations for all servers
 */
export function getServerConfigs(): SidebarItem[] {
  const config = mcpConfig as McpConfig;
  return Object.keys(config.mcpServers).map((id) => getServerConfig(id));
}

/**
 * Gets a mapping of server IDs to their display names
 */
export function getServerNames(): Record<string, string> {
  const config = mcpConfig as McpConfig;
  const serverIds = Object.keys(config.mcpServers);

  return serverIds.reduce((names, id) => {
    names[id] = getServerConfig(id).label;
    return names;
  }, {} as Record<string, string>);
}
