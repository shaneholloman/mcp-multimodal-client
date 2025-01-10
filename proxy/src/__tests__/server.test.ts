import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  afterAll,
} from "vitest";
import supertest, { Response } from "supertest";
import { ProxyServer } from "../server.js";
import type { McpConfig } from "../types/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { findActualExecutable } from "spawn-rx";
import type { Stream } from "stream";

// Mock all console methods to suppress output
const mockConsole = {
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
  warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
  info: vi.spyOn(console, "info").mockImplementation(() => {}),
};

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
} as unknown as Stream;

// Setup mocks first (these get hoisted)
vi.mock("@modelcontextprotocol/sdk/server/sse.js", () => ({
  SSEServerTransport: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    send: vi.fn(),
    handlePostMessage: vi.fn().mockResolvedValue(undefined),
    handleMessage: vi.fn(),
    close: vi.fn(),
    _endpoint: "/message",
    res: {} as Response,
    _sessionId: "test-session",
    get sessionId() {
      return this._sessionId;
    },
  })),
}));

vi.mock("@modelcontextprotocol/sdk/client/stdio.js", () => {
  class MockStdioTransport {
    public stderr = mockStream;
    public start = vi.fn().mockResolvedValue(undefined);
    public close = vi.fn();
    public send = vi.fn();
    public onmessage = vi.fn();
    public onclose = vi.fn();
    private _abortController = new AbortController();
    private _readBuffer = "";
    private _serverParams = {};
    private processReadBuffer = vi.fn();
  }
  return {
    StdioClientTransport: vi
      .fn()
      .mockImplementation(
        () => new MockStdioTransport() as unknown as StdioClientTransport
      ),
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
  let server: ProxyServer;
  // Using type assertion since supertest types are not fully compatible with newer TypeScript
  let request = {} as ReturnType<typeof supertest>;

  const mockConfig: McpConfig = {
    sse: {
      systemprompt: {
        url: "http://localhost:3000",
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

  beforeEach(async () => {
    vi.clearAllMocks();
    server = new ProxyServer(mockConfig);
    request = supertest(server.getExpressApp());
    // Clear all console mocks
    Object.values(mockConsole).forEach((mock) => mock.mockClear());
  });

  afterEach(async () => {
    // Restore all console mocks
    Object.values(mockConsole).forEach((mock) => mock.mockRestore());
    // Clean up server resources
    await server.cleanup();
    // Wait for any pending operations to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    // Clean up any remaining transports
    await server.cleanup();
    // Wait for any pending operations to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
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
      // Mock the config property to throw an error
      Object.defineProperty(server, "config", {
        get() {
          throw new Error("Mock error");
        },
      });

      const response = await request.get("/config");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Mock error");
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

    it("should return 500 when SSE configuration is missing", async () => {
      // Create a server instance without SSE configuration
      const configWithoutSSE: McpConfig = {
        mcpServers: {
          test: {
            command: "echo",
            args: ["test"],
          },
        },
      };
      const serverWithoutSSE = new ProxyServer(configWithoutSSE);
      const requestWithoutSSE = supertest(serverWithoutSSE.getExpressApp());

      const response = await requestWithoutSSE
        .get("/sse")
        .query({ serverId: "test", transportType: "sse" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("SSE configuration is not available");

      await serverWithoutSSE.cleanup();
    });

    it("should handle transport errors", async () => {
      const mockTransport = {
        stderr: mockStream,
        start: vi.fn().mockRejectedValue(new Error("Transport error")),
        close: vi.fn(),
        send: vi.fn(),
        onmessage: vi.fn(),
        onclose: vi.fn(),
      } as unknown as StdioClientTransport;

      // Mock findActualExecutable to return valid values
      vi.mocked(findActualExecutable).mockReturnValue({
        cmd: "test-cmd",
        args: ["test-arg"],
      });

      vi.mocked(StdioClientTransport).mockImplementationOnce(
        () => mockTransport
      );

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
  });
});
