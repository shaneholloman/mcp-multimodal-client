import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StatusIndicator } from "../StatusIndicator";

// Mock the Icon component
vi.mock("@iconify/react", () => ({
  Icon: ({
    icon,
    className,
    "data-testid": testId,
  }: {
    icon: string;
    className?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={testId} className={className} data-icon={icon}>
      {icon}
    </div>
  ),
}));

describe("StatusIndicator", () => {
  it("renders with default props", () => {
    render(<StatusIndicator title="Test Status" />);

    expect(screen.getByText("Test Status")).toBeInTheDocument();
    const icon = screen.getByTestId("status-icon-default");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute(
      "data-icon",
      "solar:shield-minimalistic-line-duotone"
    );
  });

  it("renders with description", () => {
    render(
      <StatusIndicator title="Test Status" description="Test Description" />
    );

    expect(screen.getByText("Test Status")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders with custom type", () => {
    render(<StatusIndicator title="Test Status" type="success" />);

    const container = screen.getByTestId("status-container-success");
    expect(container).toHaveClass("bg-success-50/50");

    const icon = screen.getByTestId("status-icon-success");
    expect(icon).toHaveAttribute(
      "data-icon",
      "solar:shield-check-line-duotone"
    );
  });

  it("renders with custom icon", () => {
    render(<StatusIndicator title="Test Status" icon="custom-icon" />);

    const icon = screen.getByTestId("status-icon-default");
    expect(icon).toHaveAttribute("data-icon", "custom-icon");
  });
});
