# MCP Proxy Server

This proxy server acts as a bridge between web applications and Model Context Protocol (MCP) servers. It supports both stdio-based local MCP servers and SSE-based remote MCP servers.

## Features

- **Multiple Transport Types**:

  - `stdio`: For local MCP servers that run as child processes
  - `sse`: For remote MCP servers that communicate via Server-Sent Events

- **Server Management**:
  - Automatic server startup and shutdown
  - Environment variable configuration
  - Error handling and logging

## API Endpoints

### GET /config

Returns the available MCP server configurations.

Response:

```json
{
  "mcpServers": {
    "serverId": {
      "command": "string",
      "args": ["string"],
      "env": {} // optional
    }
  }
}
```

### GET /sse

Establishes a Server-Sent Events connection to an MCP server.

Query Parameters:

- `serverId`: The ID of the server to connect to
- `transportType`: Either "stdio" or "sse"

### POST /message

Sends a message to a connected MCP server.

Query Parameters:

- `sessionId`: The session ID of the connection

## Configuration

The server is configured via `mcp.config.json` which defines available MCP servers and their configurations.
