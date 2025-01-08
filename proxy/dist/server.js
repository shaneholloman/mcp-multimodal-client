import cors from "cors";
import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { findActualExecutable } from "spawn-rx";
import mcpProxy from "./mcpProxy.js";
export class ProxyServer {
    constructor(config) {
        this.webAppTransports = [];
        this.activeServers = new Map();
        this.config = config;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMiddleware() {
        this.app.use(cors());
    }
    setupRoutes() {
        this.app.get("/sse", this.handleSSE.bind(this));
        this.app.post("/message", this.handleMessage.bind(this));
        this.app.get("/config", this.handleConfig.bind(this));
    }
    async createTransport(query) {
        console.log("Creating transport with query:", query);
        const { transportType, serverId } = query;
        if (typeof serverId !== "string") {
            throw new Error("Server ID must be specified");
        }
        if (transportType === "stdio") {
            console.log("Setting up stdio transport");
            const serverConfig = this.config.mcpServers[serverId];
            if (!serverConfig) {
                throw new Error(`No configuration found for server: ${serverId}`);
            }
            const env = serverConfig.env
                ? { ...process.env, ...serverConfig.env }
                : process.env;
            const { cmd, args } = findActualExecutable(serverConfig.command, serverConfig.args);
            const transport = new StdioClientTransport({
                command: cmd,
                args,
                env,
                stderr: "pipe",
            });
            console.log("Starting stdio transport");
            await transport.start();
            console.log("Stdio transport started successfully");
            return transport;
        }
        if (transportType === "sse") {
            console.log("Setting up SSE transport");
            const serverConfig = this.config.sse.systemprompt;
            if (!serverConfig) {
                throw new Error(`No SSE configuration found for server: ${serverId}`);
            }
            const url = new URL(serverConfig.url);
            url.searchParams.set("apiKey", serverConfig.apiKey);
            const transport = new SSEClientTransport(url);
            console.log("Starting SSE transport");
            await transport.start();
            console.log("SSE transport started successfully");
            return transport;
        }
        throw new Error("Invalid transport type specified");
    }
    async handleSSE(req, res) {
        try {
            console.log("Handling SSE request");
            const backingServerTransport = await this.createTransport(req.query);
            const webAppTransport = new SSEServerTransport("/message", res);
            this.webAppTransports.push(webAppTransport);
            console.log("Starting web app transport");
            await webAppTransport.start();
            console.log("Web app transport started");
            let isConnected = true;
            if (backingServerTransport instanceof StdioClientTransport &&
                backingServerTransport.stderr) {
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
                    }
                    catch (error) {
                        console.error("Error sending stderr data:", error);
                        isConnected = false;
                    }
                });
            }
            // Send initial success response
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });
            // Write initial event to signal connection is ready
            res.write("event: ready\ndata: {}\n\n");
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
                    }
                    catch (sendError) {
                        console.error("Error sending error notification:", sendError);
                        isConnected = false;
                    }
                },
            });
            req.on("close", () => {
                console.log("SSE connection closed");
                isConnected = false;
                const index = this.webAppTransports.indexOf(webAppTransport);
                if (index > -1) {
                    this.webAppTransports.splice(index, 1);
                }
            });
        }
        catch (error) {
            console.error("Error in /sse route:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : "Internal server error",
                });
            }
        }
    }
    async handleMessage(req, res) {
        try {
            console.log("Handling message request");
            const sessionId = req.query.sessionId;
            const transport = this.webAppTransports.find((t) => t.sessionId === sessionId);
            if (!transport) {
                console.log("Session not found:", sessionId);
                res.status(404).end("Session not found");
                return;
            }
            console.log("Processing message for session:", sessionId);
            await transport.handlePostMessage(req, res);
            if (!res.headersSent) {
                res.status(200).end();
            }
        }
        catch (error) {
            console.error("Error in /message route:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : "Internal server error",
                });
            }
        }
    }
    handleConfig(_req, res) {
        try {
            res.json({
                mcpServers: this.config.mcpServers,
            });
        }
        catch (error) {
            console.error("Error in /config route:", error);
            res.status(500).json({
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    }
    async startServer(port) {
        return new Promise((resolve) => {
            this.app.listen(port, () => {
                console.log(`Server running on port ${port}`);
                resolve();
            });
        });
    }
    getExpressApp() {
        return this.app;
    }
}
