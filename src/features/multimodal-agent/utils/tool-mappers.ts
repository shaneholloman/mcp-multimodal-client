import { SchemaType } from "@google/generative-ai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";

// Protected keywords that need to be prefixed with "safe_"
const PROTECTED_KEYWORDS = ["token", "from"];

const safePropertyName = (name: string): string => {
  if (PROTECTED_KEYWORDS.includes(name)) {
    return `safe_${name}`;
  }
  return name;
};

type GeminiPropertyType = {
  type: SchemaType;
  items?: { type: SchemaType };
  properties?: Record<string, GeminiPropertyType & { description: string }>;
};

type GeminiParameter = {
  type: SchemaType;
  description: string;
};

const DEFAULT_MESSAGE_PARAM: GeminiParameter = {
  type: SchemaType.STRING,
  description: "Message to include with the command",
};

export const sanitizeFunctionName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
};

const handleSchemaItems = (
  items: JSONSchema7Definition | JSONSchema7Definition[] | undefined
): GeminiPropertyType => {
  if (!items) {
    return { type: SchemaType.STRING };
  }

  if (Array.isArray(items)) {
    return handleSchemaItems(items[0]);
  }

  if (typeof items === "boolean") {
    return { type: SchemaType.BOOLEAN };
  }

  // Handle objects with no type or properties
  if (typeof items === "object") {
    if (!items.type || (items.type === "object" && !items.properties)) {
      return {
        type: SchemaType.OBJECT,
        properties: {
          _data: {
            type: SchemaType.STRING,
            description: "Generic data field for object",
          },
        },
      };
    }
  }

  return mapPropertyType(items);
};

const getFirstValidOption = (
  options: JSONSchema7Definition[] | undefined
): JSONSchema7Definition | undefined => {
  if (!options?.length) return undefined;
  const firstOption = options[0];
  return firstOption;
};

const getSchemaType = (schema: JSONSchema7): string => {
  if (!schema.type) return "string";
  return Array.isArray(schema.type) ? schema.type[0] : schema.type;
};

const mapObjectProperties = (
  properties: Record<string, JSONSchema7Definition>
): Record<string, GeminiPropertyType & { description: string }> => {
  return Object.entries(properties).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [safePropertyName(key)]: {
        ...mapPropertyType(value),
        description: typeof value === "object" ? value.description || "" : "",
      },
    }),
    {}
  );
};

export const mapPropertyType = (
  schema: JSONSchema7 | JSONSchema7Definition
): GeminiPropertyType => {
  if (typeof schema === "boolean") {
    return { type: SchemaType.BOOLEAN };
  }

  if (!schema || typeof schema !== "object") {
    return { type: SchemaType.STRING };
  }

  const firstOneOfOption = getFirstValidOption(schema.oneOf);
  if (firstOneOfOption) {
    return mapPropertyType(firstOneOfOption);
  }

  const firstAnyOfOption = getFirstValidOption(schema.anyOf);
  if (firstAnyOfOption) {
    return mapPropertyType(firstAnyOfOption);
  }

  const schemaType = getSchemaType(schema);

  switch (schemaType) {
    case "string":
      return { type: SchemaType.STRING };
    case "number":
    case "integer":
      return { type: SchemaType.NUMBER };
    case "array":
      return {
        type: SchemaType.ARRAY,
        items: handleSchemaItems(schema.items),
      };
    case "object":
      if (schema.properties) {
        return {
          type: SchemaType.OBJECT,
          properties: mapObjectProperties(schema.properties),
        };
      }
      return {
        type: SchemaType.OBJECT,
        properties: {
          _data: {
            type: SchemaType.STRING,
            description: "Generic data field for object",
          },
        },
      };
    case "boolean":
      return { type: SchemaType.BOOLEAN };
    case "null":
      return { type: SchemaType.STRING };
    default:
      return { type: SchemaType.STRING };
  }
};

const getRequiredFields = (schema: JSONSchema7): string[] => {
  if (schema.required && Array.isArray(schema.required)) {
    return schema.required;
  }

  if (schema.oneOf?.[0] && typeof schema.oneOf[0] === "object") {
    const firstOption = schema.oneOf[0] as JSONSchema7;
    if (firstOption.required && Array.isArray(firstOption.required)) {
      return firstOption.required;
    }
  }

  if (schema.anyOf?.[0] && typeof schema.anyOf[0] === "object") {
    const firstOption = schema.anyOf[0] as JSONSchema7;
    if (firstOption.required && Array.isArray(firstOption.required)) {
      return firstOption.required;
    }
  }

  return [];
};

export const createDefaultToolParameters = (tool: Tool) => ({
  name: sanitizeFunctionName(tool.name),
  description: tool.description || undefined,
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      _message: DEFAULT_MESSAGE_PARAM,
    },
    required: ["_message"],
  },
});

export const mapToolProperties = (tool: Tool) => {
  if (
    !tool.inputSchema ||
    (!tool.inputSchema.properties &&
      !tool.inputSchema.oneOf &&
      !tool.inputSchema.anyOf)
  ) {
    return createDefaultToolParameters(tool);
  }

  const mappedSchema = mapPropertyType(tool.inputSchema as JSONSchema7);
  const properties = mappedSchema.properties || {};
  const required = getRequiredFields(tool.inputSchema as JSONSchema7);

  // Add _message only if no required fields
  if (required.length === 0) {
    properties._message = DEFAULT_MESSAGE_PARAM;
    return {
      name: sanitizeFunctionName(tool.name),
      description: tool.description || undefined,
      parameters: {
        type: SchemaType.OBJECT,
        properties,
        required: ["_message"],
      },
    };
  }

  return {
    name: sanitizeFunctionName(tool.name),
    description: tool.description || undefined,
    parameters: {
      type: SchemaType.OBJECT,
      properties,
      required,
    },
  };
};

export const mapToolsToGeminiFormat = (tools: Tool[]) => {
  return tools.map(mapToolProperties);
};
