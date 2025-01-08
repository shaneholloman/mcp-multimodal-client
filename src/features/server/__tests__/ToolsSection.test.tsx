import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ToolsSection } from "../components/sections/ToolsSection";
import "@testing-library/jest-dom";
import { useLogStore } from "@/stores/log-store";

interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

// Mock NextUI components
vi.mock("@nextui-org/react", async () => {
  return {
    Card: vi.fn(({ children, "data-testid": testId, ...props }) => (
      <div data-testid={testId || "card"} {...props}>
        {children}
      </div>
    )),
    CardHeader: vi.fn(({ children }) => (
      <div data-testid="card-header">{children}</div>
    )),
    CardBody: vi.fn(({ children }) => (
      <div data-testid="card-body">{children}</div>
    )),
    Chip: vi.fn(({ children }) => <div data-testid="chip">{children}</div>),
    Tooltip: vi.fn(({ children }) => (
      <div data-testid="tooltip">{children}</div>
    )),
    Button: vi.fn(({ children, onPress }) => (
      <button onClick={onPress}>{children}</button>
    )),
    Modal: vi.fn(({ children, isOpen, onClose }) => {
      return isOpen ? (
        <div data-testid="modal">
          {typeof children === "function" ? children(onClose) : children}
        </div>
      ) : null;
    }),
    ModalContent: vi.fn(({ children }) => (
      <div data-testid="modal-content">
        {typeof children === "function" ? children() : children}
      </div>
    )),
    ModalHeader: vi.fn(({ children }) => (
      <div data-testid="modal-header">{children}</div>
    )),
    ModalBody: vi.fn(({ children }) => (
      <div data-testid="modal-body">{children}</div>
    )),
    ModalFooter: vi.fn(({ children }) => (
      <div data-testid="modal-footer">
        {typeof children === "function"
          ? children({ onClose: vi.fn() })
          : children}
      </div>
    )),
    Input: vi.fn(
      ({
        label,
        "data-testid": testId,
        isRequired,
        errorMessage,
        isInvalid,
        ...props
      }) => {
        const attrs = {
          "data-testid": testId,
          "aria-label": label,
          ...props,
        };
        if (isRequired) attrs["aria-required"] = "true";
        if (errorMessage) attrs["aria-errormessage"] = errorMessage;
        if (isInvalid) attrs["aria-invalid"] = "true";
        return <input {...attrs} />;
      }
    ),
    useDisclosure: vi.fn(() => ({
      isOpen: true,
      onOpen: vi.fn(),
      onClose: vi.fn(),
    })),
  };
});

// Mock the Icon component
vi.mock("@iconify/react", () => ({
  Icon: vi.fn(() => <span />),
}));

// Mock the shared components
vi.mock("@/components/Button", () => ({
  Button: vi.fn(({ children, onPress }) => (
    <button onClick={onPress}>{children}</button>
  )),
  ExecuteButton: vi.fn(({ onPress, children, variant }) => (
    <button
      onClick={onPress}
      data-testid={
        variant === "flat" ? "tool-card-execute-button" : "modal-execute-button"
      }
    >
      {children || "Execute Tool"}
    </button>
  )),
  RefreshButton: vi.fn(({ onPress }) => (
    <button onClick={onPress}>Refresh</button>
  )),
}));

vi.mock("@/components/StatusIndicator/StatusIndicator", () => ({
  StatusIndicator: vi.fn(({ title, description }) => (
    <div data-testid="status-indicator">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  )),
}));

const mockTools: McpTool[] = [
  {
    name: "testTool",
    description: "A test tool",
    inputSchema: {
      type: "object",
      properties: {
        param1: { type: "string", description: "Test parameter" },
      },
      required: ["param1"],
    },
  },
];

describe("ToolsSection", () => {
  const mockExecuteTool = vi.fn();
  const mockFetchTools = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useLogStore.getState().clearLogs();
  });

  it("renders tools correctly", () => {
    render(
      <ToolsSection
        tools={mockTools}
        onExecuteTool={mockExecuteTool}
        onFetchTools={mockFetchTools}
        hasListToolsCapability={true}
      />
    );

    expect(screen.getByText("testTool")).toBeInTheDocument();
    expect(screen.getByText("A test tool")).toBeInTheDocument();
  });

  it("handles empty tools state", () => {
    render(
      <ToolsSection
        tools={[]}
        onExecuteTool={mockExecuteTool}
        onFetchTools={mockFetchTools}
        hasListToolsCapability={true}
      />
    );

    expect(screen.getByText("No tools loaded")).toBeInTheDocument();
  });

  it("shows error state correctly", () => {
    render(
      <ToolsSection
        tools={[]}
        onExecuteTool={mockExecuteTool}
        onFetchTools={mockFetchTools}
        hasListToolsCapability={true}
        error={true}
      />
    );

    expect(screen.getByText("Connection Error")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to connect to server. Tools are unavailable.")
    ).toBeInTheDocument();
  });

  it("executes tool with parameters", async () => {
    mockExecuteTool.mockResolvedValue({ success: true });

    render(
      <ToolsSection
        tools={mockTools}
        onExecuteTool={mockExecuteTool}
        onFetchTools={mockFetchTools}
        hasListToolsCapability={true}
      />
    );

    // Open the execution modal
    const executeButton = screen.getByTestId("tool-card-execute-button");
    fireEvent.click(executeButton);

    // Fill in parameters
    const input = screen.getByTestId("input-param1");
    fireEvent.change(input, { target: { value: "test value" } });

    // Execute the tool
    const modalExecuteButton = screen.getByTestId("modal-execute-button");
    fireEvent.click(modalExecuteButton);

    await waitFor(() => {
      expect(mockExecuteTool).toHaveBeenCalledWith("testTool", {
        param1: "test value",
      });
    });
  });

  it("shows execution history after successful execution", async () => {
    mockExecuteTool.mockResolvedValue({ result: "success" });

    render(
      <ToolsSection
        tools={mockTools}
        onExecuteTool={mockExecuteTool}
        onFetchTools={mockFetchTools}
        hasListToolsCapability={true}
      />
    );

    // Execute tool
    const executeButton = screen.getByTestId("tool-card-execute-button");
    fireEvent.click(executeButton);
    const input = screen.getByTestId("input-param1");
    fireEvent.change(input, { target: { value: "test value" } });
    const modalExecuteButton = screen.getByTestId("modal-execute-button");
    fireEvent.click(modalExecuteButton);

    // Wait for the execution history to appear and verify its contents
    await waitFor(() => {
      // First verify the execution history card exists
      const historyCard = screen.getByTestId("execution-history-card");
      expect(historyCard).toBeInTheDocument();

      // Then verify the log entry exists
      const logEntry = within(historyCard).getByTestId("execution-log-entry");
      expect(logEntry).toBeInTheDocument();

      // Then verify the contents of the log entry
      const logName = within(logEntry).getByTestId("execution-log-name");
      expect(logName).toHaveTextContent("testTool");

      const logOperation = within(logEntry).getByTestId(
        "execution-log-operation"
      );
      expect(logOperation).toHaveTextContent("Execute Tool");

      const paramsSection = within(logEntry).getByTestId(
        "execution-log-params"
      );
      expect(paramsSection).toBeInTheDocument();
      expect(paramsSection).toHaveTextContent(/test value/);

      const resultSection = within(logEntry).getByTestId(
        "execution-log-result"
      );
      expect(resultSection).toBeInTheDocument();
      expect(resultSection).toHaveTextContent(/success/);
    });
  });

  it("handles tool execution errors", async () => {
    mockExecuteTool.mockRejectedValue(new Error("Test error"));

    render(
      <ToolsSection
        tools={mockTools}
        onExecuteTool={mockExecuteTool}
        onFetchTools={mockFetchTools}
        hasListToolsCapability={true}
      />
    );

    // Execute tool
    const executeButton = screen.getByTestId("tool-card-execute-button");
    fireEvent.click(executeButton);
    const input = screen.getByTestId("input-param1");
    fireEvent.change(input, { target: { value: "test value" } });
    const modalExecuteButton = screen.getByTestId("modal-execute-button");
    fireEvent.click(modalExecuteButton);

    // Wait for the error message in the execution history
    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });
  });

  it("validates required parameters", async () => {
    render(
      <ToolsSection
        tools={mockTools}
        onExecuteTool={mockExecuteTool}
        onFetchTools={mockFetchTools}
        hasListToolsCapability={true}
      />
    );

    // Execute tool
    const executeButton = screen.getByTestId("tool-card-execute-button");
    fireEvent.click(executeButton);

    // Try to execute without filling required parameters
    const modalExecuteButton = screen.getByTestId("modal-execute-button");
    fireEvent.click(modalExecuteButton);

    await waitFor(() => {
      expect(screen.getByText("Validation Errors")).toBeInTheDocument();
      const errorMessage = screen.getByText((content) =>
        content.includes("param1 is required")
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
