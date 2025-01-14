import { describe, expect, test } from "vitest";
import { SchemaType } from "@google/generative-ai";
import {
  mapPropertyType,
  mapToolProperties,
  mapToolsToGeminiFormat,
} from "../tool-mappers";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { JSONSchema7 } from "json-schema";

describe("mapPropertyType", () => {
  test("maps basic string type", () => {
    expect(mapPropertyType({ type: "string" })).toEqual({
      type: SchemaType.STRING,
    });
  });

  test("maps basic number type", () => {
    expect(mapPropertyType({ type: "number" })).toEqual({
      type: SchemaType.NUMBER,
    });
  });

  test("maps integer type to number", () => {
    expect(mapPropertyType({ type: "integer" })).toEqual({
      type: SchemaType.NUMBER,
    });
  });

  test("maps basic boolean type", () => {
    expect(mapPropertyType({ type: "boolean" })).toEqual({
      type: SchemaType.BOOLEAN,
    });
  });

  test("maps null type to string", () => {
    expect(mapPropertyType({ type: "null" })).toEqual({
      type: SchemaType.STRING,
    });
  });

  test("maps unknown type to string", () => {
    expect(mapPropertyType({ type: "unknown" as JSONSchema7["type"] })).toEqual(
      {
        type: SchemaType.STRING,
      }
    );
  });

  test("maps boolean schema to boolean", () => {
    expect(mapPropertyType(true)).toEqual({
      type: SchemaType.BOOLEAN,
    });
  });

  test("maps array type with string items", () => {
    expect(
      mapPropertyType({
        type: "array",
        items: { type: "string" },
      })
    ).toEqual({
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    });
  });

  test("maps array type with boolean item schema", () => {
    expect(
      mapPropertyType({
        type: "array",
        items: true,
      })
    ).toEqual({
      type: SchemaType.ARRAY,
      items: { type: SchemaType.BOOLEAN },
    });
  });

  test("maps array type with item array", () => {
    expect(
      mapPropertyType({
        type: "array",
        items: [{ type: "string" }, { type: "number" }],
      })
    ).toEqual({
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    });
  });

  test("maps array type with no items", () => {
    expect(
      mapPropertyType({
        type: "array",
      })
    ).toEqual({
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    });
  });

  test("maps type array to first type", () => {
    expect(
      mapPropertyType({
        type: ["string", "null"],
      })
    ).toEqual({
      type: SchemaType.STRING,
    });
  });

  test("maps object type with properties", () => {
    expect(
      mapPropertyType({
        type: "object",
        properties: {
          name: { type: "string", description: "The name" },
          age: { type: "number" },
        },
      })
    ).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: "The name" },
        age: { type: SchemaType.NUMBER, description: "" },
      },
    });
  });

  test("maps object type without properties", () => {
    expect(
      mapPropertyType({
        type: "object",
      })
    ).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        _data: {
          type: SchemaType.STRING,
          description: "Generic data field for object",
        },
      },
    });
  });

  test("maps nested object properties", () => {
    expect(
      mapPropertyType({
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              settings: {
                type: "object",
                properties: {
                  enabled: { type: "boolean" },
                },
              },
            },
          },
        },
      })
    ).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        user: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: "" },
            settings: {
              type: SchemaType.OBJECT,
              properties: {
                enabled: { type: SchemaType.BOOLEAN, description: "" },
              },
              description: "",
            },
          },
          description: "",
        },
      },
    });
  });

  test("maps oneOf by taking first option", () => {
    expect(
      mapPropertyType({
        type: "object",
        oneOf: [
          {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
          {
            type: "object",
            properties: {
              id: { type: "number" },
            },
          },
        ],
      })
    ).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: "" },
      },
    });
  });

  test("maps oneOf with boolean first option", () => {
    expect(
      mapPropertyType({
        type: "object",
        oneOf: [true, { type: "string" }],
      })
    ).toEqual({
      type: SchemaType.BOOLEAN,
    });
  });

  test("maps anyOf by taking first option", () => {
    expect(
      mapPropertyType({
        type: "object",
        anyOf: [
          {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
          {
            type: "object",
            properties: {
              id: { type: "number" },
            },
          },
        ],
      })
    ).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: "" },
      },
    });
  });

  test("maps anyOf with boolean first option", () => {
    expect(
      mapPropertyType({
        type: "object",
        anyOf: [true, { type: "string" }],
      })
    ).toEqual({
      type: SchemaType.BOOLEAN,
    });
  });

  test("handles missing type by defaulting to string", () => {
    expect(mapPropertyType({})).toEqual({
      type: SchemaType.STRING,
    });
  });

  test("maps object with no properties to include dummy _data field", () => {
    expect(
      mapPropertyType({
        type: "object",
      })
    ).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        _data: {
          type: SchemaType.STRING,
          description: "Generic data field for object",
        },
      },
    });
  });

  test("preserves existing properties when mapping object type", () => {
    expect(
      mapPropertyType({
        type: "object",
        properties: {
          name: { type: "string", description: "The name" },
          age: { type: "number" },
        },
      })
    ).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: "The name" },
        age: { type: SchemaType.NUMBER, description: "" },
      },
    });
  });

  test("handles array with object items that have no properties", () => {
    expect(
      mapPropertyType({
        type: "array",
        items: {
          type: "object",
        },
      })
    ).toEqual({
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          _data: {
            type: SchemaType.STRING,
            description: "Generic data field for object",
          },
        },
      },
    });
  });

  test("handles array with object items that have properties", () => {
    expect(
      mapPropertyType({
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number", description: "The ID" },
            label: { type: "string" },
          },
        },
      })
    ).toEqual({
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.NUMBER, description: "The ID" },
          label: { type: SchemaType.STRING, description: "" },
        },
      },
    });
  });
});

describe("mapToolProperties", () => {
  test("creates default parameters for empty schema", () => {
    const tool = {
      name: "test_tool",
      description: "A test tool",
      inputSchema: { type: "object" },
    } as Tool;

    expect(mapToolProperties(tool)).toEqual({
      name: "test_tool",
      description: "A test tool",
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
  });

  test("creates default parameters for missing schema", () => {
    const tool = {
      name: "test_tool",
      description: "A test tool",
    } as Tool;

    expect(mapToolProperties(tool)).toEqual({
      name: "test_tool",
      description: "A test tool",
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
  });

  test("maps tool with required fields", () => {
    const tool = {
      name: "test_tool",
      description: "A test tool",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name" },
          age: { type: "number" },
        },
        required: ["name"],
      },
    } as Tool;

    expect(mapToolProperties(tool)).toEqual({
      name: "test_tool",
      description: "A test tool",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "The name" },
          age: { type: SchemaType.NUMBER, description: "" },
        },
        required: ["name"],
      },
    });
  });

  test("maps tool with oneOf schema", () => {
    const tool = {
      name: "test_tool",
      description: "A test tool",
      inputSchema: {
        type: "object",
        oneOf: [
          {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
          {
            type: "object",
            properties: {
              id: { type: "number" },
            },
          },
        ],
      },
    } as Tool;

    expect(mapToolProperties(tool)).toEqual({
      name: "test_tool",
      description: "A test tool",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "" },
        },
        required: ["name"],
      },
    });
  });

  test("maps tool with anyOf schema", () => {
    const tool = {
      name: "test_tool",
      description: "A test tool",
      inputSchema: {
        type: "object",
        anyOf: [
          {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
          {
            type: "object",
            properties: {
              id: { type: "number" },
            },
          },
        ],
      },
    } as Tool;

    expect(mapToolProperties(tool)).toEqual({
      name: "test_tool",
      description: "A test tool",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "" },
        },
        required: ["name"],
      },
    });
  });
});

describe("mapToolsToGeminiFormat", () => {
  test("maps array of tools", () => {
    const tools = [
      {
        name: "tool1",
        description: "Tool 1",
        inputSchema: { type: "object" },
      },
      {
        name: "tool2",
        description: "Tool 2",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
      },
    ] as Tool[];

    expect(mapToolsToGeminiFormat(tools)).toEqual([
      {
        name: "tool1",
        description: "Tool 1",
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
      },
      {
        name: "tool2",
        description: "Tool 2",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: "" },
          },
          required: ["name"],
        },
      },
    ]);
  });

  test("maps complex Celigo connection schema", () => {
    const tools = [
      {
        name: "create_connection",
        description: "Create a new Celigo connection",
        inputSchema: {
          type: "object",
          oneOf: [
            {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  const: "http",
                  description: "Connection type",
                },
                name: {
                  type: "string",
                  description: "Connection name",
                },
                offline: {
                  type: "boolean",
                  description: "Whether the connection is offline",
                },
                sandbox: {
                  type: "boolean",
                  description: "Whether to use sandbox environment",
                },
                http: {
                  type: "object",
                  properties: {
                    formType: {
                      type: "string",
                      enum: ["http", "graph_ql"],
                      description: "Form type for HTTP connections",
                    },
                    mediaType: {
                      type: "string",
                      enum: ["json"],
                      description: "Media type",
                    },
                    baseURI: {
                      type: "string",
                      description: "Base URI for the endpoint",
                    },
                    auth: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["basic", "cookie", "digest", "token"],
                          description: "Authentication type",
                        },
                      },
                      required: ["type"],
                    },
                  },
                  required: ["formType", "mediaType", "baseURI", "auth"],
                },
                microServices: {
                  type: "object",
                  properties: {
                    disableNetSuiteWebServices: {
                      type: "boolean",
                      default: false,
                    },
                    disableRdbms: {
                      type: "boolean",
                      default: false,
                    },
                    disableDataWarehouse: {
                      type: "boolean",
                      default: false,
                    },
                  },
                  required: [
                    "disableNetSuiteWebServices",
                    "disableRdbms",
                    "disableDataWarehouse",
                  ],
                },
              },
              required: ["type", "name", "http", "microServices"],
            },
            // Other connection types omitted for brevity
          ],
        },
      },
    ] as Tool[];

    const result = mapToolsToGeminiFormat(tools);
    console.log("Mapped output:", JSON.stringify(result, null, 2));

    expect(result).toEqual([
      {
        name: "create_connection",
        description: "Create a new Celigo connection",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              description: "Connection type",
            },
            name: {
              type: SchemaType.STRING,
              description: "Connection name",
            },
            offline: {
              type: SchemaType.BOOLEAN,
              description: "Whether the connection is offline",
            },
            sandbox: {
              type: SchemaType.BOOLEAN,
              description: "Whether to use sandbox environment",
            },
            http: {
              type: SchemaType.OBJECT,
              properties: {
                formType: {
                  type: SchemaType.STRING,
                  description: "Form type for HTTP connections",
                },
                mediaType: {
                  type: SchemaType.STRING,
                  description: "Media type",
                },
                baseURI: {
                  type: SchemaType.STRING,
                  description: "Base URI for the endpoint",
                },
                auth: {
                  type: SchemaType.OBJECT,
                  properties: {
                    type: {
                      type: SchemaType.STRING,
                      description: "Authentication type",
                    },
                  },
                  description: "",
                },
              },
              description: "",
            },
            microServices: {
              type: SchemaType.OBJECT,
              properties: {
                disableNetSuiteWebServices: {
                  type: SchemaType.BOOLEAN,
                  description: "",
                },
                disableRdbms: {
                  type: SchemaType.BOOLEAN,
                  description: "",
                },
                disableDataWarehouse: {
                  type: SchemaType.BOOLEAN,
                  description: "",
                },
              },
              description: "",
            },
          },
          required: ["type", "name", "http", "microServices"],
        },
      },
    ]);
  });
});
