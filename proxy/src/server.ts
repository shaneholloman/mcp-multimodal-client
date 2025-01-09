import cors from "cors";
import express, { Express, Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { findActualExecutable } from "spawn-rx";
import type { McpConfig } from "./types/index.js";
import mcpProxy from "./mcpProxy.js";

/**
 * ProxyServer acts as a bridge between web applications and MCP servers.
 * It supports both stdio-based local MCP servers and SSE-based remote MCP servers.
 */
export class ProxyServer {
  private app: Express;
  private webAppTransports: SSEServerTransport[] = [];
  private config: McpConfig;

  constructor(config: McpConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
  }

  private setupRoutes(): void {
    this.app.get("/sse", this.handleSSE.bind(this));
    this.app.post("/message", this.handleMessage.bind(this));
    this.app.get("/config", this.handleConfig.bind(this));
  }

  /**
   * Creates a transport based on the specified type and server ID
   * @param query - The request query containing transportType and serverId
   * @returns A promise that resolves to the created transport
   * @throws Error if the configuration is invalid or transport creation fails
   */
  private async createTransport(query: Request["query"]) {
    const { transportType, serverId } = query;

    if (typeof serverId !== "string") {
      throw new Error("Server ID must be specified");
    }

    if (transportType === "stdio") {
      const serverConfig = this.config.mcpServers[serverId];
      if (!serverConfig) {
        throw new Error(`No configuration found for server: ${serverId}`);
      }

      const env = serverConfig.env
        ? { ...(process.env as Record<string, string>), ...serverConfig.env }
        : (process.env as Record<string, string>);

      const { cmd, args } = findActualExecutable(
        serverConfig.command,
        serverConfig.args
      );
      const transport = new StdioClientTransport({
        command: cmd,
        args,
        env,
        stderr: "pipe",
      });

      await transport.start();
      return transport;
    }

    if (transportType === "sse") {
      const serverConfig = this.config.sse.systemprompt;
      if (!serverConfig) {
        throw new Error(`No SSE configuration found for server: ${serverId}`);
      }

      const url = new URL(serverConfig.url);
      url.searchParams.set("apiKey", serverConfig.apiKey);
      const transport = new SSEClientTransport(url);
      await transport.start();
      return transport;
    }

    throw new Error("Invalid transport type specified");
  }

  /**
   * Handles SSE connection requests
   * @param req - The express request object
   * @param res - The express response object
   */
  private async handleSSE(req: Request, res: Response): Promise<void> {
    try {
      const backingServerTransport = await this.createTransport(req.query);
      const webAppTransport = new SSEServerTransport("/message", res);

      this.webAppTransports.push(webAppTransport);
      await webAppTransport.start();

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

      // Send initial ready event through the transport
      webAppTransport.send({
        jsonrpc: "2.0",
        method: "connection/ready",
        params: {},
      });

      mcpProxy({
        transportToClient: webAppTransport,
        transportToServer: backingServerTransport,
        onerror: (error: Error) => {
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

      req.on("close", () => {
        isConnected = false;
        const index = this.webAppTransports.indexOf(webAppTransport);
        if (index > -1) {
          this.webAppTransports.splice(index, 1);
        }
      });
    } catch (error) {
      console.error("Error in /sse route:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  }

  /**
   * Handles message requests from clients
   * @param req - The express request object
   * @param res - The express response object
   */
  private async handleMessage(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.query.sessionId;
      const transport = this.webAppTransports.find(
        (t) => t.sessionId === sessionId
      );

      if (!transport) {
        res.status(404).end("Session not found");
        return;
      }

      await transport.handlePostMessage(req, res);
      if (!res.headersSent) {
        res.status(200).end();
      }
    } catch (error) {
      console.error("Error in /message route:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  }

  /**
   * Handles configuration requests
   * @param _req - The express request object
   * @param res - The express response object
   */
  private handleConfig(_req: Request, res: Response): void {
    try {
      if (!this.config || !this.config.mcpServers) {
        throw new Error("Invalid server configuration");
      }
      const config = {
        mcpServers: this.config.mcpServers,
      };
      res.status(200).json(config);
    } catch (error) {
      console.error("Error in /config route:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  }

  /**
   * Starts the proxy server on the specified port
   * @param port - The port number to listen on
   */
  public async startServer(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        Object.entries(this.config.mcpServers).forEach(([id, config]) => {
          if (config.env) {
            Object.keys(config.env).forEach((key) => {
              console.log(`    ${key}: [HIDDEN]`);
            });
          }
        });
        console.log("\nSSE Endpoints:");
        Object.entries(this.config.sse).forEach(([id, config]) => {
          console.log(`\n${id}:`);
          console.log(`  URL: ${config.url}`);
          console.log(`  API Key: [HIDDEN]`);
        });
        resolve();
      });
    });
  }

  public getExpressApp(): Express {
    return this.app;
  }

  public async cleanup(): Promise<void> {
    // Close all transports
    await Promise.all(
      this.webAppTransports.map(async (transport) => {
        try {
          await transport.close?.();
        } catch (error) {
          console.error("Error closing transport:", error);
        }
      })
    );
    this.webAppTransports = [];
  }
}
