import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ServerInfo } from "../components/ServerManagement/ServerInfo";
import { useMcp, type McpContextType } from "@/contexts/McpContext";
import { ReactNode } from "react";

vi.mock("@/contexts/McpContext", () => ({
  useMcp: vi.fn(),
  McpProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@nextui-org/react", () => ({
  Chip: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div data-testid="chip" className={className}>
      {children}
    </div>
  ),
  Card: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardBody: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-body" className={className}>
      {children}
    </div>
  ),
}));

const mockMcpContext: McpContextType = {
  clients: {},
  activeClients: [],
  connectServer: vi.fn(),
  disconnectServer: vi.fn(),
  selectPrompt: vi.fn(),
  listResources: vi.fn(),
  listPrompts: vi.fn(),
  listTools: vi.fn(),
  executeTool: vi.fn(),
  executePrompt: vi.fn(),
  readResource: vi.fn(),
};

describe("ServerInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMcp).mockReturnValue(mockMcpContext);
  });

  it("displays server information correctly", () => {
    const serverInfo = {
      name: "Test Server",
      version: "1.0.0",
      protocolVersion: "1.0",
      capabilities: {
        tools: { listChanged: true },
        prompts: { listChanged: true },
        resources: { listChanged: true },
      },
    };

    render(<ServerInfo info={serverInfo} />);
    expect(screen.getByText("Server Information")).toBeInTheDocument();
    expect(
      screen.getByText("Version 1.0.0 • Protocol v1.0")
    ).toBeInTheDocument();
    expect(screen.getByText("tools.listChanged")).toBeInTheDocument();
    expect(screen.getByText("prompts.listChanged")).toBeInTheDocument();
    expect(screen.getByText("resources.listChanged")).toBeInTheDocument();
  });

  it("handles empty capabilities gracefully", () => {
    const serverInfo = {
      name: "Test Server",
      version: "1.0.0",
      protocolVersion: "1.0",
      capabilities: {},
    };

    render(<ServerInfo info={serverInfo} />);
    expect(screen.getByText("Server Information")).toBeInTheDocument();
    expect(screen.getByText("No capabilities available")).toBeInTheDocument();
  });

  it("handles undefined server info gracefully", () => {
    render(<ServerInfo />);
    expect(screen.getByText("Server Information")).toBeInTheDocument();
    expect(screen.getByText("Not Connected")).toBeInTheDocument();
  });
});
