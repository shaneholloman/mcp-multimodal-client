import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useSchemaForm } from "../hooks/useSchemaForm";
import { JSONSchema7 } from "json-schema";

describe("useSchemaForm", () => {
  const simpleSchema: JSONSchema7 = {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number" },
    },
    required: ["name"],
  };

  const nestedSchema: JSONSchema7 = {
    type: "object",
    properties: {
      user: {
        type: "object",
        properties: {
          name: { type: "string" },
          settings: {
            type: "object",
            properties: {
              theme: { type: "string", enum: ["light", "dark"] },
            },
            required: ["theme"],
          },
        },
        required: ["name", "settings"],
      },
    },
    required: ["user"],
  };

  it("initializes with default values", () => {
    const { result } = renderHook(() =>
      useSchemaForm({
        schema: simpleSchema,
      })
    );

    expect(result.current.values).toEqual({
      name: "",
      age: "",
    });
    expect(result.current.errors).toContainEqual({
      path: ["name"],
      message: "This field is required",
    });
    expect(result.current.isValid).toBe(false);
  });

  it("initializes with provided values", () => {
    const { result } = renderHook(() =>
      useSchemaForm({
        schema: simpleSchema,
        initialValues: {
          name: "John",
          age: 30,
        },
      })
    );

    expect(result.current.values).toEqual({
      name: "John",
      age: 30,
    });
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.isValid).toBe(true);
  });

  it("updates field values", () => {
    const { result } = renderHook(() =>
      useSchemaForm({
        schema: simpleSchema,
      })
    );

    act(() => {
      result.current.setFieldValue(["name"], "John");
    });

    expect(result.current.values.name).toBe("John");
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.isValid).toBe(true);
  });

  it("updates nested field values", () => {
    const { result } = renderHook(() =>
      useSchemaForm({
        schema: nestedSchema,
      })
    );

    act(() => {
      result.current.setFieldValue(["user", "name"], "John");
      result.current.setFieldValue(["user", "settings", "theme"], "dark");
    });

    expect(result.current.values).toEqual({
      user: {
        name: "John",
        settings: {
          theme: "dark",
        },
      },
    });
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.isValid).toBe(true);
  });

  it("gets field values", () => {
    const { result } = renderHook(() =>
      useSchemaForm({
        schema: nestedSchema,
        initialValues: {
          user: {
            name: "John",
            settings: {
              theme: "dark",
            },
          },
        },
      })
    );

    expect(result.current.getFieldValue(["user", "name"])).toBe("John");
    expect(result.current.getFieldValue(["user", "settings", "theme"])).toBe(
      "dark"
    );
    expect(result.current.getFieldValue(["nonexistent"])).toBeUndefined();
  });

  it("validates enum fields", () => {
    const { result } = renderHook(() =>
      useSchemaForm({
        schema: nestedSchema,
      })
    );

    act(() => {
      result.current.setFieldValue(["user", "name"], "John");
      result.current.setFieldValue(["user", "settings", "theme"], "invalid");
    });

    expect(result.current.errors).toContainEqual({
      path: ["user", "settings", "theme"],
      message: "Must be one of: light, dark",
    });
    expect(result.current.isValid).toBe(false);
  });

  it("updates entire form state", () => {
    const { result } = renderHook(() =>
      useSchemaForm({
        schema: nestedSchema,
      })
    );

    act(() => {
      result.current.setValues({
        user: {
          name: "John",
          settings: {
            theme: "light",
          },
        },
      });
    });

    expect(result.current.values).toEqual({
      user: {
        name: "John",
        settings: {
          theme: "light",
        },
      },
    });
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.isValid).toBe(true);
  });

  it("maintains referential integrity of callbacks", () => {
    const { result, rerender } = renderHook(() =>
      useSchemaForm({
        schema: simpleSchema,
      })
    );

    const initialSetFieldValue = result.current.setFieldValue;
    const initialGetFieldValue = result.current.getFieldValue;

    rerender();

    expect(result.current.setFieldValue).toBe(initialSetFieldValue);
    expect(result.current.getFieldValue).toBe(initialGetFieldValue);
  });
});
