# MCP Configuration

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

## Local Configuration Files

This directory includes default configuration templates that you can use to set up your local environment. To get started:

1. Copy the default configuration files to create your local versions (remove the `.default` suffix):

   ```bash
   cp mcp.config.default.json mcp.config.json
   cp agent.config.default.json agent.config.json
   cp llm.config.default.json llm.config.json
   ```

2. Modify the copied files with your specific settings.

### Default Templates

- `mcp.config.default.json`: Default MCP server configuration template
- `agent.config.default.json`: Default agent configuration template
- `llm.config.default.json`: Default LLM settings template

The `.default` files are tracked in git as templates. Your local copies (without `.default`) will be ignored by git to keep your settings private.
