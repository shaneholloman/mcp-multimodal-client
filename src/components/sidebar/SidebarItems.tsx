import { SidebarSection, SidebarItem } from "./types";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { McpContext } from "@/contexts/McpContext";
import mcpConfig from "@config/mcp.config.json";

export function useSidebarItems() {
  const navigate = useNavigate();
  const context = useContext(McpContext);
  if (!context) throw new Error("McpContext must be used within McpProvider");
  const { clients } = context;

  const handleItemClick = (href: string | undefined) => {
    if (href) {
      console.log("Navigating to:", href);
      navigate(href);
    }
  };

  // Get server items with current connection state
  const serverItems: SidebarItem[] = [
    ...Object.entries(mcpConfig.sse).map(([id, config]) => ({
      id,
      type: "sse",
      config,
    })),
    ...Object.entries(mcpConfig.mcpServers).map(([id, config]) => ({
      id,
      type: "stdio",
      config,
    })),
  ].map(({ id, type, config }) => {
    const clientState = clients[id];
    const isConnected = clientState?.connectionStatus === "connected";

    // Get the appropriate metadata based on connection state and configuration
    const defaultMetadata =
      mcpConfig.defaults.serverTypes[
        type as keyof typeof mcpConfig.defaults.serverTypes
      ];

    const metadata = isConnected
      ? {
          ...defaultMetadata,
          ...(config.metadata || {}), // Allow custom metadata to override defaults
        }
      : mcpConfig.defaults.unconnected;

    return {
      key: id,
      label: id,
      icon: metadata.icon,
      description: metadata.description || `${id} server`,
      href: `/servers/${id}`,
      color: metadata.color,
      serverId: id,
    } as SidebarItem;
  });

  const sections: SidebarSection[] = [
    {
      title: "Main",
      items: [
        {
          key: "home",
          label: "Agents",
          icon: "solar:programming-line-duotone",
          description: "View and manage your agents",
          href: "/",
          color: "primary",
        },
        {
          key: "create-agent",
          label: "Create Agent",
          icon: "solar:add-circle-line-duotone",
          description: "Create a new agent",
          href: "/agent/create",
          color: "primary",
        },
      ],
    },
    {
      title: "Servers",
      items: serverItems,
    },
    {
      title: "Settings",
      items: [
        {
          key: "logs",
          label: "Logs",
          icon: "solar:document-text-line-duotone",
          description: "View system logs",
          href: "/logs",
          color: "primary",
        },
        {
          key: "settings",
          label: "Settings",
          icon: "solar:settings-line-duotone",
          description: "Manage your preferences",
          href: "/settings",
          color: "primary",
        },
      ],
    },
    {
      title: "Help",
      items: [
        {
          key: "docs",
          label: "Documentation",
          icon: "solar:book-line-duotone",
          description: "View MCP documentation",
          href: "https://systemprompt.io/docs/mcp-client",
          color: "primary",
        },
      ],
    },
  ];

  return { sections, handleItemClick };
}

export const sectionItemsWithTeams = [];
