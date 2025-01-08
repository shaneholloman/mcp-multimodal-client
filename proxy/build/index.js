#!/usr/bin/env node
import cors from "cors";
import * as EventSource from "eventsource";
import { parseArgs } from "node:util";
import express from "express";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import mcpProxy from "./mcpProxy.js";
import { findActualExecutable } from "spawn-rx";
// Polyfill EventSource for an SSE client in Node.js
global.EventSource = EventSource;
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    env: { type: "string", default: "" },
    args: { type: "string", default: "" },
  },
});
const app = express();
app.use(cors());
const webAppTransports = [];
const activeServers = new Map();
// Start all configured MCP servers
async function startMcpServers() {
  for (const [serverId, config] of Object.entries(mcpConfig.mcpServers)) {
    try {
      const { cmd, args } = findActualExecutable(config.command, config.args);
      const env = config.env ? { ...process.env, ...config.env } : process.env;
      const transport = new StdioClientTransport({
        command: cmd,
        args,
        env,
        stderr: "pipe",
      });
      await transport.start();
      activeServers.set(serverId, transport);
      console.log(`Started MCP server: ${serverId}`);
    } catch (error) {
      console.error(`Failed to start MCP server ${serverId}:`, error);
    }
  }
}
const createTransport = async (query) => {
  const { transportType, serverId } = query;
  console.log("Query parameters:", { transportType, serverId });
  if (typeof serverId !== "string") {
    throw new Error("Server ID must be specified");
  }
  if (transportType === "stdio") {
    const serverConfig = mcpConfig.mcpServers[serverId];
    if (!serverConfig) {
      throw new Error(`No configuration found for server: ${serverId}`);
    }
    const env = serverConfig.env
      ? { ...process.env, ...serverConfig.env }
      : process.env;
    const transport = new StdioClientTransport({
      command: serverConfig.command,
      args: serverConfig.args,
      env,
      stderr: "pipe",
    });
    await transport.start();
    console.log("Connected to stdio transport");
    return transport;
  } else if (transportType === "sse") {
    const serverConfig = mcpConfig.sse.systemprompt;
    if (!serverConfig) {
      throw new Error(`No SSE configuration found for server: ${serverId}`);
    }
    const url = new URL(serverConfig.url);
    url.searchParams.set("apiKey", serverConfig.apiKey);
    const transport = new SSEClientTransport(url);
    await transport.start();
    console.log("Connected to SSE transport");
    return transport;
  } else {
    console.error(`Invalid transport type: ${transportType}`);
    throw new Error("Invalid transport type specified");
  }
};
app.get("/sse", async (req, res) => {
  try {
    console.log("New SSE connection");
    const backingServerTransport = await createTransport(req.query);
    console.log("Connected MCP client to backing server transport");
    const webAppTransport = new SSEServerTransport("/message", res);
    console.log("Created web app transport");
    webAppTransports.push(webAppTransport);
    await webAppTransport.start();
    console.log("Started web app transport");
    let isConnected = true;
    if (
      backingServerTransport instanceof StdioClientTransport &&
      backingServerTransport.stderr
    ) {
      backingServerTransport.stderr.on("data", (chunk) => {
        try {
          if (isConnected) {
            webAppTransport.send({
              jsonrpc: "2.0",
              method: "notifications/stderr",
              params: {
                content: chunk.toString(),
              },
            });
          }
        } catch (error) {
          console.error("Error sending stderr data:", error);
          isConnected = false;
        }
      });
    }
    mcpProxy({
      transportToClient: webAppTransport,
      transportToServer: backingServerTransport,
      onerror: (error) => {
        console.error("MCP proxy error:", error);
        try {
          if (isConnected) {
            webAppTransport.send({
              jsonrpc: "2.0",
              method: "notifications/error",
              params: {
                error: error.message || "Unknown error occurred",
              },
            });
          }
        } catch (sendError) {
          console.error("Error sending error notification:", sendError);
          isConnected = false;
        }
      },
    });
    console.log("Set up MCP proxy");
    // Handle client disconnect
    req.on("close", () => {
      isConnected = false;
      const index = webAppTransports.indexOf(webAppTransport);
      if (index > -1) {
        webAppTransports.splice(index, 1);
      }
      console.log("Client disconnected");
    });
  } catch (error) {
    console.error("Error in /sse route:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
});
app.post("/message", async (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    console.log(`Received message for sessionId ${sessionId}`);
    const transport = webAppTransports.find((t) => t.sessionId === sessionId);
    if (!transport) {
      res.status(404).end("Session not found");
      return;
    }
    await transport.handlePostMessage(req, res);
  } catch (error) {
    console.error("Error in /message route:", error);
    res.status(500).json(error);
  }
});
app.get("/config", (req, res) => {
  try {
    const defaultEnvironment = getDefaultEnvironment();
    res.json({
      defaultEnvironment,
      defaultCommand: values.env,
      defaultArgs: values.args,
      mcpServers: mcpConfig.mcpServers,
    });
  } catch (error) {
    console.error("Error in /config route:", error);
    res.status(500).json(error);
  }
});
// Start MCP servers when the application starts
startMcpServers().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
