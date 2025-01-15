import { describe, it, expect } from "vitest";
import { validateSchema } from "../utils/schema-utils";
import { JSONSchema7 } from "json-schema";

describe("schema-utils", () => {
  describe("validateSchema", () => {
    it("validates required fields", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
        },
        required: ["name", "email"],
      };

      const errors = validateSchema(schema, {});
      expect(errors).toHaveLength(2);
      expect(errors).toContainEqual({
        path: ["name"],
        message: "This field is required",
      });
      expect(errors).toContainEqual({
        path: ["email"],
        message: "This field is required",
      });
    });

    it("validates nested required fields", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
            },
            required: ["name"],
          },
        },
        required: ["user"],
      };

      const errors = validateSchema(schema, {
        user: {},
      });

      expect(errors).toContainEqual({
        path: ["user", "name"],
        message: "This field is required",
      });
    });

    it("validates enum fields", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          color: {
            type: "string",
            enum: ["red", "green", "blue"],
          },
        },
      };

      const errors = validateSchema(schema, {
        color: "yellow",
      });

      expect(errors).toContainEqual({
        path: ["color"],
        message: "Must be one of: red, green, blue",
      });
    });

    it("validates number fields", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          age: { type: "number" },
        },
      };

      const errors = validateSchema(schema, {
        age: "not a number",
      });

      expect(errors).toContainEqual({
        path: ["age"],
        message: "Must be a number",
      });
    });

    it("validates oneOf schemas", () => {
      const schema: JSONSchema7 = {
        oneOf: [
          {
            type: "object",
            properties: {
              type: { type: "string", const: "a" },
              value: { type: "string" },
            },
            required: ["type", "value"],
          },
          {
            type: "object",
            properties: {
              type: { type: "string", const: "b" },
              other: { type: "string" },
            },
            required: ["type", "other"],
          },
        ],
      };

      // Test valid type A
      let errors = validateSchema(schema, {
        type: "a",
        value: "test",
      });
      expect(errors).toHaveLength(0);

      // Test valid type B
      errors = validateSchema(schema, {
        type: "b",
        other: "test",
      });
      expect(errors).toHaveLength(0);

      // Test invalid type
      errors = validateSchema(schema, {
        type: "c",
      });
      expect(errors.length).toBeGreaterThan(0);

      // Test missing required field
      errors = validateSchema(schema, {
        type: "a",
      });
      expect(errors).toContainEqual({
        path: ["value"],
        message: "This field is required",
      });
    });

    it("handles boolean schema", () => {
      expect(validateSchema(true, {})).toEqual([]);
      expect(validateSchema(false, {})).toEqual([]);
    });

    it("removes duplicate errors", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          nested: {
            type: "object",
            properties: {
              field: { type: "string" },
            },
            required: ["field"],
          },
        },
        required: ["nested"],
      };

      const errors = validateSchema(schema, {});
      // Should only have one error for missing nested field
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        path: ["nested"],
        message: "This field is required",
      });
    });

    it("validates deeply nested objects", () => {
      const schema: JSONSchema7 = {
        type: "object",
        properties: {
          level1: {
            type: "object",
            properties: {
              level2: {
                type: "object",
                properties: {
                  level3: { type: "string", enum: ["a", "b"] },
                },
                required: ["level3"],
              },
            },
            required: ["level2"],
          },
        },
        required: ["level1"],
      };

      const errors = validateSchema(schema, {
        level1: {
          level2: {
            level3: "c",
          },
        },
      });

      expect(errors).toContainEqual({
        path: ["level1", "level2", "level3"],
        message: "Must be one of: a, b",
      });
    });
  });
});
