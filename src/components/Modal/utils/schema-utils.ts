import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7Type,
} from "json-schema";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface ValidationError {
  path: string[];
  message: string;
}

export function convertToolToJsonSchema(tool: Tool): JSONSchema7 {
  // MCP tools already follow JSON Schema format, we just need to ensure types
  return tool.inputSchema as JSONSchema7;
}

export function getSchemaAtPath(
  schema: JSONSchema7,
  path: string[]
): JSONSchema7 | undefined {
  let current = schema;
  for (const key of path) {
    if (current.properties?.[key]) {
      current = current.properties[key] as JSONSchema7;
    } else {
      return undefined;
    }
  }
  return current;
}

export function validateFieldValue(
  schema: JSONSchema7,
  path: string[],
  value: unknown
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required field validation
  if (schema.required?.includes(path[path.length - 1]) && !value) {
    errors.push({
      path,
      message: "This field is required",
    });
  }

  // Type validation
  if (
    schema.type === "number" &&
    typeof value === "string" &&
    isNaN(Number(value))
  ) {
    errors.push({
      path,
      message: "Must be a number",
    });
  }

  // Enum validation
  if (schema.enum && !schema.enum.includes(value as JSONSchema7Type)) {
    errors.push({
      path,
      message: `Must be one of: ${schema.enum.join(", ")}`,
    });
  }

  // oneOf validation
  if (schema.oneOf) {
    const matchingSchema = schema.oneOf.find((subSchema) => {
      if (typeof subSchema === "boolean") return false;
      if (!subSchema.properties?.type) return false;
      const typeSchema = subSchema.properties.type as JSONSchema7;
      return typeSchema.const === value;
    });

    if (!matchingSchema) {
      errors.push({
        path,
        message: `Invalid value for discriminator field`,
      });
    }
  }

  return errors;
}

function validateRequiredFields(
  schema: JSONSchema7,
  value: unknown,
  path: string[] = []
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof value !== "object" || value === null) {
    return errors;
  }

  if (schema.required) {
    for (const requiredField of schema.required) {
      const fieldValue = (value as Record<string, unknown>)[requiredField];
      if (fieldValue === undefined || fieldValue === "") {
        errors.push({
          path: [...path, requiredField],
          message: "This field is required",
        });
      }
    }
  }

  return errors;
}

function validateEnumField(
  schema: JSONSchema7,
  value: unknown,
  path: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (
    schema.enum &&
    value !== undefined &&
    value !== null &&
    !schema.enum.includes(value as string | number | boolean | null)
  ) {
    errors.push({
      path,
      message: `Must be one of: ${schema.enum.join(", ")}`,
    });
  }

  return errors;
}

function validateTypeField(
  schema: JSONSchema7,
  value: unknown,
  path: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (value === undefined || value === "") {
    return errors;
  }

  if (
    schema.type === "number" &&
    typeof value === "string" &&
    isNaN(Number(value))
  ) {
    errors.push({
      path,
      message: "Must be a number",
    });
  }

  return errors;
}

export function validateSchema(
  schema: JSONSchema7Definition,
  formData: Record<string, unknown>,
  path: string[] = []
): ValidationError[] {
  if (typeof schema === "boolean") return [];

  const errors: ValidationError[] = [];

  // Handle oneOf validation
  if (schema.oneOf) {
    const selectedType = (formData.type || "") as string;
    const matchingSchema = schema.oneOf.find((subSchema) => {
      if (typeof subSchema === "boolean") return false;
      if (!subSchema.properties?.type) return false;
      const typeSchema = subSchema.properties.type as JSONSchema7;
      return typeSchema.const === selectedType;
    });

    if (matchingSchema && typeof matchingSchema !== "boolean") {
      errors.push(...validateSchema(matchingSchema, formData, path));
    }
  }

  // Handle object validation
  if (schema.type === "object" && schema.properties) {
    // Add required field validation errors
    errors.push(...validateRequiredFields(schema, formData, path));

    // Validate each property
    Object.entries(schema.properties).forEach(([key, propSchema]) => {
      if (typeof propSchema === "boolean") return;

      const newPath = [...path, key];
      const value = (formData || {})[key];

      // Add enum validation errors
      errors.push(...validateEnumField(propSchema, value, newPath));

      // Add type validation errors
      errors.push(...validateTypeField(propSchema, value, newPath));

      // Recursively validate nested objects
      if (propSchema.type === "object" && value && typeof value === "object") {
        errors.push(
          ...validateSchema(
            propSchema,
            value as Record<string, unknown>,
            newPath
          )
        );
      }
    });
  }

  // Remove duplicate errors
  return errors.filter(
    (error, index, self) =>
      index ===
      self.findIndex(
        (e) =>
          e.path.join(".") === error.path.join(".") &&
          e.message === error.message
      )
  );
}

export function getDiscriminatorSchema(schema: JSONSchema7Definition): {
  discriminator: JSONSchema7 | undefined;
  options: JSONSchema7Definition[];
} {
  if (typeof schema === "boolean") {
    return { discriminator: undefined, options: [] };
  }

  if (!schema.oneOf?.length) {
    return { discriminator: undefined, options: [] };
  }

  const firstSchema = schema.oneOf[0];
  if (typeof firstSchema === "boolean" || !firstSchema.properties?.type) {
    return { discriminator: undefined, options: [] };
  }

  return {
    discriminator: firstSchema.properties.type as JSONSchema7,
    options: schema.oneOf,
  };
}

export function getValueAtPath(
  formData: Record<string, unknown>,
  path: string[]
): unknown {
  if (path.length === 0) return undefined;
  return path.reduce(
    (obj: Record<string, unknown>, key: string) =>
      (obj[key] || {}) as Record<string, unknown>,
    formData
  )[path[path.length - 1]];
}

export function setValueAtPath(
  formData: Record<string, unknown>,
  path: string[],
  value: unknown
): Record<string, unknown> {
  const newData = { ...formData };
  let current = newData;

  for (let i = 0; i < path.length - 1; i++) {
    if (!current[path[i]]) {
      current[path[i]] = {};
    }
    current = current[path[i]] as Record<string, unknown>;
  }

  current[path[path.length - 1]] = value;
  return newData;
}
