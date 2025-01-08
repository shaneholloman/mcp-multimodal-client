import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ToolCard } from "../ToolCard";

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

describe("ToolCard", () => {
  const defaultProps = {
    name: "Test Tool",
    description: "Test Description",
  };

  it("renders with default props", () => {
    render(<ToolCard {...defaultProps} />);
    expect(screen.getByText("Test Tool")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Tool")).toBeInTheDocument();
  });

  it("uses custom tool type", () => {
    const customType = "Custom Type";
    render(<ToolCard {...defaultProps} type={customType} />);
    expect(screen.getByText(customType)).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <ToolCard {...defaultProps}>
        <div>Child Content</div>
      </ToolCard>
    );
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });
});
