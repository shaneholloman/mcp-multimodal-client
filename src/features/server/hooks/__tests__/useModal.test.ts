import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useModal } from "../useModal";

describe("useModal", () => {
  it("should initialize with closed state", () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.mode).toBeNull();
  });

  it("should open modal with specified mode", () => {
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.open("view");
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.mode).toBe("view");
  });

  it("should close modal and reset mode", () => {
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.open("execute");
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.mode).toBe("execute");

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.mode).toBeNull();
  });

  it("should handle multiple open/close cycles", () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.open("view");
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.mode).toBe("view");

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.mode).toBeNull();

    act(() => {
      result.current.open("execute");
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.mode).toBe("execute");
  });
});
