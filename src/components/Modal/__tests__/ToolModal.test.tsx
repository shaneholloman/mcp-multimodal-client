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
  const mockOnParameterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with complex schema and handles form submission", async () => {
    const expectedValues = {
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
    };

    const { rerender } = render(
      <NextUIProvider>
        <ToolModal
          isOpen={true}
          onClose={mockOnClose}
          tool={mockTool}
          parameterValues={{}}
          onParameterChange={mockOnParameterChange}
          validationErrors={[]}
          primaryAction={{
            label: "Execute",
            loadingLabel: "Executing...",
            onPress: mockOnExecute,
            isLoading: false,
          }}
        />
      </NextUIProvider>
    );

    // Select connection type using hidden select container
    const typeSelect = screen
      .getByTestId("hidden-select-container")
      .querySelector("select");
    if (!typeSelect) throw new Error("Type select not found");
    fireEvent.change(typeSelect, { target: { value: "http" } });

    // Rerender with updated values
    rerender(
      <NextUIProvider>
        <ToolModal
          isOpen={true}
          onClose={mockOnClose}
          tool={mockTool}
          parameterValues={expectedValues}
          onParameterChange={mockOnParameterChange}
          validationErrors={[]}
          primaryAction={{
            label: "Execute",
            loadingLabel: "Executing...",
            onPress: mockOnExecute,
            isLoading: false,
          }}
        />
      </NextUIProvider>
    );

    // Submit form
    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(mockOnExecute).toHaveBeenCalled();
    });
  });

  it("shows validation errors for required fields", async () => {
    render(
      <NextUIProvider>
        <ToolModal
          isOpen={true}
          onClose={mockOnClose}
          tool={mockTool}
          parameterValues={{}}
          onParameterChange={mockOnParameterChange}
          validationErrors={[{ path: [], message: "This field is required" }]}
          primaryAction={{
            label: "Execute",
            loadingLabel: "Executing...",
            onPress: mockOnExecute,
            isLoading: false,
          }}
        />
      </NextUIProvider>
    );

    // Check for validation error in status indicator
    const statusContainer = screen.getByTestId("status-container-danger");
    expect(statusContainer).toHaveTextContent("This field is required");

    // Try to submit with validation errors
    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);
    expect(mockOnExecute).not.toHaveBeenCalled();
  });

  it("handles error from execute", async () => {
    const { rerender } = render(
      <NextUIProvider>
        <ToolModal
          isOpen={true}
          onClose={mockOnClose}
          tool={mockTool}
          parameterValues={{}}
          onParameterChange={mockOnParameterChange}
          validationErrors={[]}
          primaryAction={{
            label: "Execute",
            loadingLabel: "Executing...",
            onPress: mockOnExecute,
            isLoading: false,
          }}
        />
      </NextUIProvider>
    );

    // Submit form
    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    // Rerender with error
    rerender(
      <NextUIProvider>
        <ToolModal
          isOpen={true}
          onClose={mockOnClose}
          tool={mockTool}
          parameterValues={{}}
          onParameterChange={mockOnParameterChange}
          validationErrors={[{ path: [], message: "Test error" }]}
          primaryAction={{
            label: "Execute",
            loadingLabel: "Executing...",
            onPress: mockOnExecute,
            isLoading: false,
          }}
        />
      </NextUIProvider>
    );

    // Check for error in status indicator
    const statusContainer = screen.getByTestId("status-container-danger");
    expect(statusContainer).toHaveTextContent("Test error");
  });
});
