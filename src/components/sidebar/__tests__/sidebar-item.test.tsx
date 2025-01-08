import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SidebarItem } from "../sidebar-item";
import { SidebarItem as SidebarItemType } from "../types";

// Mock the Icon component
vi.mock("@iconify/react", () => ({
  Icon: vi
    .fn()
    .mockImplementation(({ icon, "data-testid": testId }) => (
      <div data-testid={testId}>{icon}</div>
    )),
}));

describe("SidebarItem", () => {
  const mockItem: SidebarItemType = {
    key: "test-server",
    label: "Test Server",
    icon: "solar:server-square-line-duotone",
    color: "primary",
    href: "/servers/test",
    description: "Test server description",
    serverId: "test",
    metadata: {
      icon: "solar:server-square-line-duotone",
      color: "primary",
      description: "Test server description",
    },
  };

  it("should render with correct label", () => {
    render(<SidebarItem item={mockItem} />);
    expect(screen.getByText("Test Server")).toBeInTheDocument();
  });

  it("should render icon when provided", () => {
    render(<SidebarItem item={mockItem} />);
    const icon = screen.getByTestId("sidebar-item-icon");
    expect(icon).toBeInTheDocument();
  });

  it("should handle missing icon gracefully", () => {
    const itemWithoutIcon: SidebarItemType = {
      ...mockItem,
      icon: undefined,
      metadata: {
        ...mockItem.metadata,
        icon: undefined,
      },
    };
    render(<SidebarItem item={itemWithoutIcon} />);
    expect(screen.queryByTestId("sidebar-item-icon")).not.toBeInTheDocument();
  });

  it("should show tooltip in compact mode with description", async () => {
    render(<SidebarItem item={mockItem} isCompact />);
    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);
    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Test server description"
      );
    });
  });

  it("should not show tooltip in compact mode without description", () => {
    const itemWithoutDescription: SidebarItemType = {
      ...mockItem,
      description: undefined,
      metadata: {
        ...mockItem.metadata,
        description: undefined,
      },
    };
    render(<SidebarItem item={itemWithoutDescription} isCompact />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("should handle click events", () => {
    const onPress = vi.fn();
    render(<SidebarItem item={mockItem} onPress={onPress} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalled();
  });

  it("should apply selected styles when selected", () => {
    const { container } = render(<SidebarItem item={mockItem} isSelected />);
    expect(container.querySelector(".bg-content2")).toBeInTheDocument();
  });

  it("should apply compact styles in compact mode", () => {
    const { container } = render(<SidebarItem item={mockItem} isCompact />);
    console.log(
      "Button classes:",
      container.querySelector("button")?.className
    );
    expect(container.querySelector(".w-\\[48px\\]")).toBeInTheDocument();
    expect(container.querySelector(".justify-center")).toBeInTheDocument();
  });
});
