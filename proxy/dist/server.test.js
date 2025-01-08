import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import { ProxyServer } from "./server.js";
describe("ProxyServer", () => {
    let server;
    let request = {};
    const mockConfig = {
        sse: {
            systemprompt: {
                url: "http://localhost:3001",
                apiKey: "test-key",
            },
        },
        mcpServers: {
            test: {
                command: "echo",
                args: ["test"],
            },
        },
    };
    beforeEach(() => {
        server = new ProxyServer(mockConfig);
        request = supertest(server.getExpressApp());
    });
    describe("GET /config", () => {
        it("should return server configuration", async () => {
            const response = await request.get("/config");
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                mcpServers: mockConfig.mcpServers,
            });
        });
    });
    describe("GET /sse", () => {
        it("should return 400 when serverId is missing", async () => {
            const response = await request.get("/sse");
            expect(response.status).toBe(500);
            expect(response.body.error).toBe("Server ID must be specified");
        });
        it("should return 400 for invalid transport type", async () => {
            const response = await request
                .get("/sse")
                .query({ serverId: "test", transportType: "invalid" });
            expect(response.status).toBe(500);
            expect(response.body.error).toBe("Invalid transport type specified");
        });
    });
    describe("POST /message", () => {
        it("should return 404 when session is not found", async () => {
            const response = await request
                .post("/message")
                .query({ sessionId: "non-existent" });
            expect(response.status).toBe(404);
            expect(response.text).toBe("Session not found");
        });
    });
});
