import { describe, it, expect } from "vitest";
import {
  getValueAtPath,
  setValueAtPath,
  getInitialValues,
} from "../utils/form-state";
import { JSONSchema7 } from "json-schema";

describe("form-state utilities", () => {
  describe("getValueAtPath", () => {
    const testObj = {
      a: {
        b: {
          c: "value",
        },
        d: 123,
      },
      e: "top level",
    };

    it("gets top level values", () => {
      expect(getValueAtPath(testObj, ["e"])).toBe("top level");
    });

    it("gets nested values", () => {
      expect(getValueAtPath(testObj, ["a", "b", "c"])).toBe("value");
      expect(getValueAtPath(testObj, ["a", "d"])).toBe(123);
    });

    it("returns undefined for non-existent paths", () => {
      expect(getValueAtPath(testObj, ["x"])).toBeUndefined();
      expect(getValueAtPath(testObj, ["a", "x"])).toBeUndefined();
    });

    it("handles empty path", () => {
      expect(getValueAtPath(testObj, [])).toBeUndefined();
    });
  });

  describe("setValueAtPath", () => {
    it("sets top level values", () => {
      const obj = { a: 1 };
      const result = setValueAtPath(obj, ["b"], 2);
      expect(result).toEqual({ a: 1, b: 2 });
      // Original object should be unchanged
      expect(obj).toEqual({ a: 1 });
    });

    it("sets nested values", () => {
      const obj = { a: { b: 1 } };
      const result = setValueAtPath(obj, ["a", "c"], 2);
      expect(result).toEqual({ a: { b: 1, c: 2 } });
      // Original object should be unchanged
      expect(obj).toEqual({ a: { b: 1 } });
    });

    it("creates intermediate objects", () => {
      const obj = {};
      const result = setValueAtPath(obj, ["a", "b", "c"], "value");
      expect(result).toEqual({ a: { b: { c: "value" } } });
    });

    it("updates existing nested values", () => {
      const obj = { a: { b: { c: "old" } } };
      const result = setValueAtPath(obj, ["a", "b", "c"], "new");
      expect(result).toEqual({ a: { b: { c: "new" } } });
    });

    it("handles empty path", () => {
      const obj = { a: 1 };
      const result = setValueAtPath(obj, [], "value");
      expect(result).toEqual({ a: 1 });
    });
  });

  describe("getInitialValues", () => {
    it("handles basic schema", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
          active: { type: "boolean" },
        },
      };

      expect(getInitialValues(schema)).toEqual({
        name: "",
        age: "",
        active: false,
      });
    });

    it("handles nested objects", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              settings: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                },
              },
            },
          },
        },
      };

      expect(getInitialValues(schema)).toEqual({
        user: {
          name: "",
          settings: {
            theme: "",
          },
        },
      });
    });

    it("handles oneOf schemas", () => {
      const schema: JSONSchema7 = {
        oneOf: [
          {
            type: "object",
            properties: {
              type: { type: "string", const: "a" },
              value: { type: "string" },
            },
          },
          {
            type: "object",
            properties: {
              type: { type: "string", const: "b" },
              other: { type: "string" },
            },
          },
        ],
      };

      expect(getInitialValues(schema)).toEqual({
        type: "a",
      });
    });

    it("handles enum fields", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          color: {
            type: "string",
            enum: ["red", "green", "blue"],
          },
        },
      };

      expect(getInitialValues(schema)).toEqual({
        color: "red",
      });
    });

    it("handles boolean schema", () => {
      expect(getInitialValues(true)).toEqual({});
      expect(getInitialValues(false)).toEqual({});
    });
  });
});
