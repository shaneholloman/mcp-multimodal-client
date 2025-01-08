import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs/promises";
import type { ViteDevServer, PreviewServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

// Plugin to handle config file writes
function configWriterPlugin() {
  const configHandler = async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    // Set content type and CORS headers for API responses
    if (req.url?.startsWith("/api/")) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    if (req.method === "POST" && req.url === "/api/config/agent") {
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const data = Buffer.concat(chunks).toString();
        const config = JSON.parse(data);

        const configDir = path.resolve(__dirname, "config");
        await fs.mkdir(configDir, { recursive: true });
        await fs.writeFile(
          path.resolve(configDir, "agent.config.json"),
          JSON.stringify(config, null, 2)
        );

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        console.error("Error writing config:", error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
      }
    } else if (req.method === "GET" && req.url === "/api/config/agent") {
      try {
        const configPath = path.resolve(__dirname, "config/agent.config.json");
        const configExists = await fs
          .access(configPath)
          .then(() => true)
          .catch(() => false);

        if (!configExists) {
          res.statusCode = 200;
          res.end(JSON.stringify({ agents: [] }));
          return;
        }

        const configData = await fs.readFile(configPath, "utf-8");
        res.statusCode = 200;
        res.end(configData);
      } catch (error) {
        console.error("Error reading config:", error);
        res.statusCode = 200; // Return empty array on error instead of 500
        res.end(JSON.stringify({ agents: [] }));
      }
    } else if (req.url?.startsWith("/api/")) {
      // Handle unknown API routes with 404
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Not Found" }));
    } else {
      next();
    }
  };

  return {
    name: "config-writer",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(configHandler);
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(configHandler);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), configWriterPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@config": path.resolve(__dirname, "./config"),
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
