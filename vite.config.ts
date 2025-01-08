import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs/promises";

// Plugin to handle config file writes
function configWriterPlugin() {
  return {
    name: "config-writer",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === "POST" && req.url === "/api/config/agent") {
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const data = Buffer.concat(chunks).toString();
            const config = JSON.parse(data);

            await fs.writeFile(
              path.resolve(__dirname, "config/agent.config.json"),
              JSON.stringify(config, null, 2)
            );

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error("Error writing config:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        } else {
          next();
        }
      });
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
});
