import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToolModal } from "../ToolModal";
import { JSONSchema7 } from "json-schema";
import { NextUIProvider } from "@nextui-org/react";

const mockTool = {
  name: "create_connection",
  description: "Create a new Celigo connection",
  inputSchema: {
    type: "object",
    oneOf: [
      {
        type: "object",
        properties: {
          type: {
            type: "string",
            const: "http",
            description: "Connection type",
            enum: ["http", "ftp", "salesforce", "netsuite"],
          },
          name: {
            type: "string",
            description: "Connection name",
          },
          offline: {
            type: "boolean",
            description: "Whether the connection is offline",
          },
          sandbox: {
            type: "boolean",
            description: "Whether to use sandbox environment",
          },
          http: {
            type: "object",
            properties: {
              formType: {
                type: "string",
                enum: ["http", "graph_ql"],
                description: "Form type for HTTP connections",
              },
              mediaType: {
                type: "string",
                enum: ["json"],
                description: "Media type",
              },
              baseURI: {
                type: "string",
                description: "Base URI for the endpoint",
              },
              auth: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["basic", "cookie", "digest", "token"],
                    description: "Authentication type",
                  },
                  basic: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                        description: "Basic auth username",
                      },
                      password: {
                        type: "string",
                        description: "Basic auth password",
                      },
                    },
                    required: ["username", "password"],
                  },
                },
                required: ["type"],
              },
            },
            required: ["formType", "mediaType", "baseURI", "auth"],
          },
          microServices: {
            type: "object",
            properties: {
              disableNetSuiteWebServices: {
                type: "boolean",
                default: false,
              },
              disableRdbms: {
                type: "boolean",
                default: false,
              },
              disableDataWarehouse: {
                type: "boolean",
                default: false,
              },
            },
            required: [
              "disableNetSuiteWebServices",
              "disableRdbms",
              "disableDataWarehouse",
            ],
          },
        },
        required: ["type", "name", "http", "microServices"],
      },
    ],
  } as JSONSchema7,
};

describe("ToolModal", () => {
  const mockOnExecute = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with complex schema and handles form submission", async () => {
    render(
      <NextUIProvider>
        <ToolModal
          isOpen={true}
          onClose={mockOnClose}
          tool={mockTool}
          onExecute={mockOnExecute}
        />
      </NextUIProvider>
    );

    // Select connection type
    const typeSelect = screen.getByLabelText(/Connection type/i);
    fireEvent.change(typeSelect, { target: { value: "http" } });

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Connection name/i), {
      target: { value: "Test Connection" },
    });

    // Fill in HTTP section
    fireEvent.change(screen.getByLabelText(/Form type/i), {
      target: { value: "http" },
    });
    fireEvent.change(screen.getByLabelText(/Media type/i), {
      target: { value: "json" },
    });
    fireEvent.change(screen.getByLabelText(/Base URI/i), {
      target: { value: "https://api.example.com" },
    });

    // Fill in auth section
    fireEvent.change(screen.getByLabelText(/Authentication type/i), {
      target: { value: "basic" },
    });
    fireEvent.change(screen.getByLabelText(/Basic auth username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Basic auth password/i), {
      target: { value: "testpass" },
    });

    // Submit form
    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(mockOnExecute).toHaveBeenCalledWith({
        type: "http",
        name: "Test Connection",
        http: {
          formType: "http",
          mediaType: "json",
          baseURI: "https://api.example.com",
          auth: {
            type: "basic",
            basic: {
              username: "testuser",
              password: "testpass",
            },
          },
        },
        microServices: {
          disableNetSuiteWebServices: false,
          disableRdbms: false,
          disableDataWarehouse: false,
        },
      });
    });
  });

  it("shows validation errors for required fields", async () => {
    render(
      <NextUIProvider>
        <ToolModal
          isOpen={true}
          onClose={mockOnClose}
          tool={mockTool}
          onExecute={mockOnExecute}
        />
      </NextUIProvider>
    );

    // Try to submit without filling required fields
    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
    });
    expect(mockOnExecute).not.toHaveBeenCalled();
  });

  it("handles error from execute", async () => {
    mockOnExecute.mockRejectedValueOnce(new Error("Test error"));

    render(
      <NextUIProvider>
        <ToolModal
          isOpen={true}
          onClose={mockOnClose}
          tool={mockTool}
          onExecute={mockOnExecute}
        />
      </NextUIProvider>
    );

    // Fill in minimum required fields
    fireEvent.change(screen.getByLabelText(/Connection type/i), {
      target: { value: "http" },
    });
    fireEvent.change(screen.getByLabelText(/Connection name/i), {
      target: { value: "Test Connection" },
    });

    // Submit form
    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });
  });
});
