import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useParameters } from "../useParameters";

describe("useParameters", () => {
  const mockSchema = {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "Name parameter" },
      age: { type: "string", description: "Age parameter" },
    },
    required: ["name"],
  };

  it("should initialize with empty values and no errors", () => {
    const { result } = renderHook(() => useParameters());
    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual([]);
  });

  it("should update parameter value", () => {
    const { result } = renderHook(() => useParameters());
    act(() => {
      result.current.setValue("name", "John");
    });
    expect(result.current.values).toEqual({ name: "John" });
    expect(result.current.errors).toEqual([]);
  });

  it("should validate required parameters", () => {
    const { result } = renderHook(() => useParameters());
    act(() => {
      result.current.validate(mockSchema);
    });
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0]).toEqual({
      path: ["name"],
      message: "name is required",
    });
  });

  it("should clear validation error when parameter is set", () => {
    const { result } = renderHook(() => useParameters());
    act(() => {
      result.current.validate(mockSchema);
    });
    expect(result.current.errors).toHaveLength(1);

    act(() => {
      result.current.setValue("name", "John");
    });
    expect(result.current.errors).toEqual([]);
  });

  it("should reset values and errors", () => {
    const { result } = renderHook(() => useParameters());

    // Set up some initial state with errors
    act(() => {
      result.current.setValues({ name: "John", age: "30" });
      result.current.validate(mockSchema);
      result.current.reset();
    });

    // After reset, both values and errors should be empty
    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual([]);
  });

  it("should set multiple values at once", () => {
    const { result } = renderHook(() => useParameters());
    act(() => {
      result.current.setValues({ name: "John", age: "30" });
    });
    expect(result.current.values).toEqual({ name: "John", age: "30" });
  });

  it("should validate successfully when required fields are filled", () => {
    const { result } = renderHook(() => useParameters());
    act(() => {
      result.current.setValue("name", "John");
    });
    let isValid = false;
    act(() => {
      isValid = result.current.validate(mockSchema);
    });
    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual([]);
  });
});
