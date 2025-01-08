import { describe, it, expect, beforeEach, vi } from "vitest";
import supertest from "supertest";
import { ProxyServer } from "../server.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
// Create mock instances
const mockStream = {
    pipe: vi.fn(),
    compose: vi.fn(),
    addListener: vi.fn(),
    once: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    listeners: vi.fn(),
    rawListeners: vi.fn(),
    listenerCount: vi.fn(),
    prependListener: vi.fn(),
    prependOnceListener: vi.fn(),
    eventNames: vi.fn(),
};
// Setup mocks first (these get hoisted)
vi.mock("@modelcontextprotocol/sdk/server/sse.js", () => ({
    SSEServerTransport: vi.fn().mockImplementation(() => ({
        start: vi.fn().mockResolvedValue(undefined),
        send: vi.fn(),
        handlePostMessage: vi.fn().mockResolvedValue(undefined),
        handleMessage: vi.fn(),
        close: vi.fn(),
        _endpoint: "/message",
        res: {},
        _sessionId: "test-session",
        get sessionId() {
            return this._sessionId;
        },
    })),
}));
vi.mock("@modelcontextprotocol/sdk/client/stdio.js", () => {
    class MockStdioTransport {
        constructor() {
            this.stderr = mockStream;
            this.start = vi.fn().mockResolvedValue(undefined);
            this.close = vi.fn();
            this.send = vi.fn();
            this.onmessage = vi.fn();
            this.onclose = vi.fn();
            this._abortController = new AbortController();
            this._readBuffer = "";
            this._serverParams = {};
            this.processReadBuffer = vi.fn();
        }
    }
    return {
        StdioClientTransport: vi
            .fn()
            .mockImplementation(() => new MockStdioTransport()),
    };
});
vi.mock("@modelcontextprotocol/sdk/client/sse.js", () => ({
    SSEClientTransport: vi.fn().mockImplementation(() => ({
        start: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
        send: vi.fn(),
        onmessage: vi.fn(),
        onclose: vi.fn(),
    })),
}));
vi.mock("spawn-rx", () => ({
    findActualExecutable: vi
        .fn()
        .mockImplementation((cmd, args) => ({ cmd, args })),
}));
vi.mock("../mcpProxy.js", () => ({
    default: vi.fn().mockImplementation(({ transportToClient }) => {
        // Simulate successful connection
        transportToClient.send({
            jsonrpc: "2.0",
            method: "connection/established",
            params: { status: "connected" },
        });
        return Promise.resolve();
    }),
}));
describe("ProxyServer", () => {
    let server;
    // Using type assertion since supertest types are not fully compatible with newer TypeScript
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
        vi.clearAllMocks();
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
        it("should handle errors gracefully", async () => {
            vi.spyOn(JSON, "stringify").mockImplementationOnce(() => {
                throw new Error("Mock error");
            });
            const response = await request.get("/config");
            expect(response.status).toBe(500);
        });
    });
    describe("GET /sse", () => {
        it("should return 500 when serverId is missing", async () => {
            const response = await request.get("/sse");
            expect(response.status).toBe(500);
            expect(response.body.error).toBe("Server ID must be specified");
        });
        it("should return 500 for invalid transport type", async () => {
            const response = await request
                .get("/sse")
                .query({ serverId: "test", transportType: "invalid" });
            expect(response.status).toBe(500);
            expect(response.body.error).toBe("Invalid transport type specified");
        });
        it("should handle stdio transport successfully", async () => {
            await request
                .get("/sse")
                .query({ serverId: "test", transportType: "stdio" })
                .expect("Content-Type", /text\/event-stream/)
                .expect(200)
                .expect((res) => {
                expect(res.text).toContain("event: ready");
            });
            expect(StdioClientTransport).toHaveBeenCalled();
            expect(vi.mocked(StdioClientTransport).mock.results[0].value.start).toHaveBeenCalled();
        });
        it("should handle sse transport successfully", async () => {
            await request
                .get("/sse")
                .query({ serverId: "test", transportType: "sse" })
                .expect("Content-Type", /text\/event-stream/)
                .expect(200)
                .expect((res) => {
                expect(res.text).toContain("event: ready");
            });
            expect(SSEClientTransport).toHaveBeenCalled();
            expect(vi.mocked(SSEClientTransport).mock.results[0].value.start).toHaveBeenCalled();
        });
        it("should handle transport errors", async () => {
            const mockTransport = {
                stderr: mockStream,
                start: vi.fn().mockRejectedValue(new Error("Transport error")),
                close: vi.fn(),
                send: vi.fn(),
                onmessage: vi.fn(),
                onclose: vi.fn(),
            };
            vi.mocked(StdioClientTransport).mockImplementationOnce(() => mockTransport);
            const response = await request
                .get("/sse")
                .query({ serverId: "test", transportType: "stdio" });
            expect(response.status).toBe(500);
            expect(response.body.error).toBe("Transport error");
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
        it("should handle message for valid session", async () => {
            // Add a transport to the server
            const mockTransport = vi.mocked(SSEServerTransport).mock.results[0].value;
            server["webAppTransports"].push(mockTransport);
            const response = await request
                .post("/message")
                .query({ sessionId: "test-session" })
                .send({ test: "message" });
            expect(response.status).toBe(200);
            expect(mockTransport.handlePostMessage).toHaveBeenCalled();
        });
        it("should handle message processing errors", async () => {
            const mockTransport = vi.mocked(SSEServerTransport).mock.results[0].value;
            server["webAppTransports"].push(mockTransport);
            vi.mocked(mockTransport.handlePostMessage).mockRejectedValueOnce(new Error("Processing error"));
            const response = await request
                .post("/message")
                .query({ sessionId: "test-session" })
                .send({ test: "message" });
            expect(response.status).toBe(500);
        });
    });
});
