import { render, screen } from "@testing-library/react";
import { McpProvider } from "@/contexts/McpContext";
import { describe, it, expect, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Mock the MCP SDK
vi.mock("@modelcontextprotocol/sdk/client/index.js", () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    listResources: vi.fn(),
    listPrompts: vi.fn(),
    listTools: vi.fn(),
    selectPrompt: vi.fn(),
    executeTool: vi.fn(),
  })),
}));

vi.mock("@modelcontextprotocol/sdk/client/sse.js", () => ({
  SSEClientTransport: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    listResources: vi.fn(),
    listPrompts: vi.fn(),
    listTools: vi.fn(),
    selectPrompt: vi.fn(),
    executeTool: vi.fn(),
  })),
}));

describe("McpProvider", () => {
  it("renders children", () => {
    render(
      <McpProvider>
        <div>Test Child</div>
      </McpProvider>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("initializes with empty state", () => {
    render(
      <McpProvider>
        <div>Test Child</div>
      </McpProvider>
    );
    expect(Object.keys(vi.mocked(Client).mock.calls)).toHaveLength(0);
    expect(Object.keys(vi.mocked(SSEClientTransport).mock.calls)).toHaveLength(
      0
    );
  });
});
