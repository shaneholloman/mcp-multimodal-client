#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { EventSource } from "eventsource";
import { parseArgs } from "node:util";
import { ProxyServer } from "./server.js";
globalThis.EventSource = EventSource;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load configuration
const configPath = join(__dirname, "../../src/config/mcp.config.json");
const mcpConfig = JSON.parse(readFileSync(configPath, "utf-8"));
// Parse command line arguments
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    port: { type: "string", default: "3000" },
  },
});
// Start server
const server = new ProxyServer(mcpConfig);
const port = parseInt(values.port, 10);
server.startServer(port).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
