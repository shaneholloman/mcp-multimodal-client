# MCP Configuration

## Initial Setup

Before running the application, you need to set up your local configuration files:

1. In the `config` directory, create your local configuration files by removing the `.default` suffix from the template files:

   ```bash
   cp mcp.config.default.json mcp.config.json
   cp agent.config.default.json agent.config.json
   cp llm.config.default.json llm.config.json
   ```

2. Edit each configuration file according to your needs:
   - `mcp.config.json`: Configure your MCP server connections
   - `agent.config.json`: Set up your agent configurations
   - `llm.config.json`: Add your LLM settings and API keys

> Note: The `.default` files are templates tracked in git. Your local copies (without `.default`) are git-ignored to keep your settings private.

This directory contains configuration files for Model Context Protocol (MCP) servers and their connections. The configuration supports two types of MCP servers:

1. **SSE Servers** (`sse`): Remote servers that communicate directly via Server-Sent Events (SSE).
2. **stdio Servers** (`mcpServers`): Local servers that run as child processes and communicate through standard I/O.

## Configuration Structure

The `mcp.config.json` file uses the following structure:

```json
{
  "defaults": {
    "serverTypes": {
      "sse": {
        "icon": "solar:server-square-cloud-bold-duotone",
        "color": "primary",
        "description": "Remote SSE-based MCP server"
      },
      "stdio": {
        "icon": "solar:server-minimalistic-bold-duotone",
        "color": "primary",
        "description": "Local stdio-based MCP server"
      }
    },
    "unconnected": {
      "icon": "solar:server-broken",
      "color": "secondary",
      "description": "Remote MCP server (not connected)"
    }
  },
  "sse": {
    "serverName": {
      "url": "http://api.example.com/v1/mcp/",
      "apiKey": "your-api-key",
      "metadata": {
        "icon": "solar:chat-dots-bold-duotone",
        "color": "success",
        "description": "Custom server description"
      }
    }
  },
  "mcpServers": {
    "serverName": {
      "command": "npx",
      "args": ["-y", "your-server-package"],
      "env": {
        "ENV_VAR": "value"
      },
      "metadata": {
        "icon": "solar:folder-bold-duotone",
        "color": "primary",
        "description": "Custom server description"
      }
    }
  }
}
```

## Metadata Configuration

Each server can have custom metadata that controls its appearance and behavior:

- **Icon**: Uses the Solar icon set (e.g., `solar:chat-dots-bold-duotone`)
- **Color**: One of `"success"`, `"warning"`, `"primary"`, or `"secondary"`
- **Description**: Custom description shown in the UI
- **Name**: Optional custom name (defaults to server ID)

The metadata is applied in the following order:

1. Default server type metadata (from `defaults.serverTypes`)
2. Server-specific metadata (from server config)
3. Runtime metadata (when connected)
4. Unconnected state (when disconnected)

## Available Icons

Icons should be chosen from the Solar icon set. Common patterns:

- `solar:*-bold-duotone`: Full color icons
- `solar:*-bold`: Solid icons
- `solar:*-broken`: Broken/disconnected state icons

## Environment Variables

For stdio servers, environment variables can be specified in the `env` field:

```json
{
  "env": {
    "API_KEY": "your-key",
    "DEBUG": "true"
  }
}
```

## Adding New Servers

1. Choose the appropriate server type (SSE or stdio)
2. Add the server configuration to the appropriate section
3. Optionally add custom metadata to control appearance
4. Use valid Solar icons from the icon set
5. Choose an appropriate color scheme
