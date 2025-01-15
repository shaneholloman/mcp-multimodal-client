import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FormField } from "../components/FormField";
import { NextUIProvider } from "@nextui-org/react";

describe("FormField", () => {
  const defaultProps = {
    path: ["test"],
    value: "",
    onChange: vi.fn(),
  };

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<NextUIProvider>{ui}</NextUIProvider>);
  };

  it("renders text input field", () => {
    renderWithProvider(
      <FormField
        {...defaultProps}
        schema={{
          type: "string",
          description: "Enter text",
        }}
      />
    );

    const input = screen.getByLabelText("Enter text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders number input field", () => {
    renderWithProvider(
      <FormField
        {...defaultProps}
        schema={{
          type: "number",
          description: "Enter number",
        }}
      />
    );

    const input = screen.getByLabelText("Enter number");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
  });

  it("renders checkbox field", () => {
    renderWithProvider(
      <FormField
        {...defaultProps}
        schema={{
          type: "boolean",
          description: "Check me",
        }}
      />
    );

    const checkbox = screen.getByRole("checkbox", { name: "Check me" });
    expect(checkbox).toBeInTheDocument();
  });

  it("renders select field for enum", () => {
    renderWithProvider(
      <FormField
        {...defaultProps}
        schema={{
          type: "string",
          enum: ["option1", "option2"],
          description: "Select option",
        }}
      />
    );

    const select = screen.getByRole("button", { name: "Select option" });
    expect(select).toBeInTheDocument();
  });

  it("handles text input changes", () => {
    const onChange = vi.fn();
    renderWithProvider(
      <FormField
        {...defaultProps}
        onChange={onChange}
        schema={{
          type: "string",
          description: "Enter text",
        }}
      />
    );

    const input = screen.getByLabelText("Enter text");
    fireEvent.change(input, { target: { value: "new value" } });

    expect(onChange).toHaveBeenCalledWith(["test"], "new value");
  });

  it("handles number input changes", () => {
    const onChange = vi.fn();
    renderWithProvider(
      <FormField
        {...defaultProps}
        onChange={onChange}
        schema={{
          type: "number",
          description: "Enter number",
        }}
      />
    );

    const input = screen.getByLabelText("Enter number");
    fireEvent.change(input, { target: { value: "42" } });

    expect(onChange).toHaveBeenCalledWith(["test"], 42);
  });

  it("handles checkbox changes", () => {
    const onChange = vi.fn();
    renderWithProvider(
      <FormField
        {...defaultProps}
        onChange={onChange}
        schema={{
          type: "boolean",
          description: "Check me",
        }}
      />
    );

    const checkbox = screen.getByRole("checkbox", { name: "Check me" });
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(["test"], true);
  });

  it("handles select field changes", () => {
    const onChange = vi.fn();
    renderWithProvider(
      <FormField
        {...defaultProps}
        onChange={onChange}
        schema={{
          type: "string",
          enum: ["option1", "option2"],
          description: "Select option",
        }}
      />
    );

    // Open select dropdown
    const select = screen.getByRole("button", { name: "Select option" });
    fireEvent.click(select);

    // Find and click option using the hidden select container
    const hiddenSelect = screen
      .getByTestId("hidden-select-container")
      .querySelector("select");
    if (!hiddenSelect) throw new Error("Hidden select not found");
    fireEvent.change(hiddenSelect, { target: { value: "option2" } });

    expect(onChange).toHaveBeenCalledWith(["test"], "option2");
  });

  it("displays validation errors", () => {
    renderWithProvider(
      <FormField
        {...defaultProps}
        error={{
          path: ["test"],
          message: "This field is required",
        }}
        schema={{
          type: "string",
          description: "Enter text",
        }}
      />
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("handles boolean schema", () => {
    renderWithProvider(<FormField {...defaultProps} schema={true} />);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("uses field name as label when description is missing", () => {
    renderWithProvider(
      <FormField
        {...defaultProps}
        path={["firstName"]}
        schema={{
          type: "string",
        }}
      />
    );

    expect(screen.getByLabelText("firstName")).toBeInTheDocument();
  });

  it("uses custom label when provided", () => {
    renderWithProvider(
      <FormField
        {...defaultProps}
        label="Custom Label"
        schema={{
          type: "string",
        }}
      />
    );

    expect(screen.getByLabelText("Custom Label")).toBeInTheDocument();
  });
});
