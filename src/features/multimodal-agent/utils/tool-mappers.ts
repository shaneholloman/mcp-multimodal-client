import { SchemaType } from "@google/generative-ai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const sanitizeFunctionName = (name: string): string => {
  return name.replace(/[^a-zA-Z_]/g, "");
};

export const mapPropertyType = (
  type: string,
  items?: { type: string }
): { type: SchemaType; items?: { type: SchemaType } } => {
  switch (type) {
    case "string":
      return { type: SchemaType.STRING };
    case "number":
      return { type: SchemaType.NUMBER };
    case "array":
      return {
        type: SchemaType.ARRAY,
        items: items
          ? { type: mapPropertyType(items.type).type }
          : { type: SchemaType.STRING },
      };
    case "object":
      return { type: SchemaType.OBJECT };
    case "boolean":
      return { type: SchemaType.BOOLEAN };
    default:
      return { type: SchemaType.STRING };
  }
};

export const createDefaultToolParameters = (tool: Tool) => ({
  name: sanitizeFunctionName(tool.name),
  description: tool.description || undefined,
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      _message: {
        type: SchemaType.STRING,
        description: "Message to include with the command",
      },
    },
    required: ["_message"],
  },
});

export const mapToolProperties = (tool: Tool) => {
  if (
    !tool.inputSchema?.properties ||
    Object.keys(tool.inputSchema.properties).length === 0
  ) {
    return createDefaultToolParameters(tool);
  }

  const hasRequiredFields =
    Array.isArray(tool.inputSchema?.required) &&
    tool.inputSchema.required.length > 0;

  const properties = Object.entries(tool.inputSchema?.properties || {}).reduce<
    Record<
      string,
      { type: SchemaType; items?: { type: SchemaType }; description: string }
    >
  >(
    (acc, [key, value]) => ({
      ...acc,
      [key]: {
        ...mapPropertyType(
          (value as { type: string }).type,
          (value as { items?: { type: string } }).items
        ),
        description: (value as { description?: string }).description || "",
      },
    }),
    {}
  );

  if (!hasRequiredFields) {
    properties._message = {
      type: SchemaType.STRING,
      description: "Message to include with the command",
    };
  }

  const required: string[] = hasRequiredFields
    ? Array.isArray(tool.inputSchema?.required)
      ? tool.inputSchema.required
      : []
    : ["_message"];

  return {
    name: sanitizeFunctionName(tool.name),
    description: tool.description || undefined,
    parameters: {
      type: SchemaType.OBJECT,
      properties,
      required: required.length > 0 ? required : undefined,
    },
  };
};

export const mapToolsToGeminiFormat = (tools: Tool[]) => {
  return tools.map(mapToolProperties);
};
