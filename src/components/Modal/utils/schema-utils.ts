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

export function validateSchema(
  schema: JSONSchema7Definition,
  formData: Record<string, unknown>,
  path: string[] = []
): ValidationError[] {
  if (typeof schema === "boolean") return [];

  const errors: ValidationError[] = [];

  // Handle oneOf validation at schema level
  if (schema.oneOf) {
    const typeValue = formData.type;
    const matchingSchema = schema.oneOf.find((subSchema) => {
      if (typeof subSchema === "boolean") return false;
      if (!subSchema.properties?.type) return false;
      const typeSchema = subSchema.properties.type as JSONSchema7;
      return typeSchema.const === typeValue;
    });

    if (!matchingSchema) {
      errors.push({
        path: [...path, "type"],
        message: `Invalid value for discriminator field`,
      });
    } else if (typeof matchingSchema !== "boolean") {
      // Validate against the matching schema
      const schemaErrors = validateSchema(matchingSchema, formData, path);
      errors.push(...schemaErrors);
      return errors; // Return early since we've validated against the matching schema
    }
  }

  // Handle required fields at current level
  if (schema.required) {
    for (const requiredField of schema.required) {
      const fieldValue = formData[requiredField];
      if (fieldValue === undefined || fieldValue === "") {
        errors.push({
          path: [...path, requiredField],
          message: "This field is required",
        });
      }
    }
  }

  // Handle properties validation
  if (schema.properties) {
    for (const [key, value] of Object.entries(formData)) {
      const propertySchema = schema.properties[key];
      if (propertySchema) {
        // Validate field value
        const fieldErrors = validateFieldValue(
          propertySchema as JSONSchema7,
          [...path, key],
          value
        );
        errors.push(...fieldErrors);

        // Recursively validate nested objects
        if (
          typeof propertySchema === "object" &&
          propertySchema.type === "object" &&
          typeof value === "object"
        ) {
          const nestedErrors = validateSchema(
            propertySchema,
            value as Record<string, unknown>,
            [...path, key]
          );
          errors.push(...nestedErrors);
        }
      }
    }
  }

  return errors;
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
