import { JSONSchema7, JSONSchema7Definition } from "json-schema";

export function getValueAtPath(
  obj: Record<string, unknown>,
  path: string[]
): unknown {
  return path.reduce((current: unknown, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function setValueAtPath(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown
): Record<string, unknown> {
  if (path.length === 0) return obj;

  const result = { ...obj };
  let current = result;

  // Navigate to the parent of the target property
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current[key] = current[key]
      ? { ...(current[key] as Record<string, unknown>) }
      : {};
    current = current[key] as Record<string, unknown>;
  }

  // Set the value at the target property
  const lastKey = path[path.length - 1];
  if (value === undefined) {
    delete current[lastKey];
  } else {
    current[lastKey] = value;
  }

  return result;
}

export function getInitialValues(
  schema: JSONSchema7Definition
): Record<string, unknown> {
  if (typeof schema === "boolean") return {};

  const result: Record<string, unknown> = {};

  if (schema.oneOf) {
    // For oneOf schemas, initialize with the first option's type
    const firstOption = schema.oneOf[0];
    if (typeof firstOption !== "boolean" && firstOption.properties?.type) {
      const typeSchema = firstOption.properties.type as JSONSchema7;
      if (typeSchema.const) {
        result.type = typeSchema.const;
      }
    }
  }

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, propSchema]) => {
      if (typeof propSchema === "boolean") return;

      if (propSchema.type === "object") {
        result[key] = getInitialValues(propSchema);
      } else if (propSchema.type === "boolean") {
        result[key] = false;
      } else if (propSchema.enum && propSchema.enum.length > 0) {
        result[key] = propSchema.enum[0];
      } else {
        result[key] = "";
      }
    });
  }

  return result;
}
