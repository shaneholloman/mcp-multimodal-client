import { describe, test, expect } from "vitest";
import { SchemaType } from "@google/generative-ai";
import { mapToolsToGeminiFormat } from "../tool-mappers";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

describe("Celigo Schema Mapping", () => {
  test("maps complex connection schema", () => {
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
                    unencrypted: {
                      type: "object",
                      properties: {
                        field: {
                          type: "string",
                          description: "Unencrypted field value",
                        },
                      },
                    },
                    encrypted: {
                      type: "string",
                      description: "Encrypted data",
                    },
                    auth: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["basic", "cookie", "digest", "token"],
                          description: "Authentication type",
                        },
                        basic: {
                          type: "object",
                          properties: {
                            username: {
                              type: "string",
                              description: "Basic/Digest auth username",
                            },
                            password: {
                              type: "string",
                              description: "Basic/Digest auth password",
                            },
                          },
                          required: ["username", "password"],
                        },
                        cookie: {
                          type: "object",
                          properties: {
                            uri: {
                              type: "string",
                              description: "Cookie auth URI",
                            },
                            method: {
                              type: "string",
                              description: "HTTP method for cookie auth",
                              enum: ["GET", "POST"],
                            },
                          },
                          required: ["uri", "method"],
                        },
                        token: {
                          type: "object",
                          properties: {
                            token: {
                              type: "string",
                              description: "Authentication token",
                            },
                            location: {
                              type: "string",
                              enum: ["body", "header", "url"],
                              description:
                                "Token location (body, header, or url)",
                            },
                            headerName: {
                              type: "string",
                              description:
                                "Header name when using header location",
                            },
                            scheme: {
                              type: "string",
                              enum: ["Bearer", "custom", "mac", "None", " "],
                              description:
                                "Authentication scheme (Bearer, custom, mac, None, or space for no scheme)",
                            },
                            paramName: {
                              type: "string",
                              description: "Parameter name for token",
                            },
                          },
                          required: [
                            "token",
                            "location",
                            "headerName",
                            "scheme",
                            "paramName",
                          ],
                        },
                      },
                      required: ["type"],
                    },
                    ping: {
                      type: "object",
                      properties: {
                        relativeURI: {
                          type: "string",
                          description: "Relative URI for ping endpoint",
                        },
                        method: {
                          type: "string",
                          description: "HTTP method for ping",
                        },
                      },
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
          ],
        },
      },
    ] as Tool[];

    const result = mapToolsToGeminiFormat(tools);
    console.log("Mapped output:", JSON.stringify(result, null, 2));

    // The expected mapped format
    const expected = [
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
              description: "",
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
                unencrypted: {
                  type: SchemaType.OBJECT,
                  description: "",
                  properties: {
                    field: {
                      type: SchemaType.STRING,
                      description: "Unencrypted field value",
                    },
                  },
                },
                encrypted: {
                  type: SchemaType.STRING,
                  description: "Encrypted data",
                },
                auth: {
                  type: SchemaType.OBJECT,
                  description: "",
                  properties: {
                    type: {
                      type: SchemaType.STRING,
                      description: "Authentication type",
                    },
                    basic: {
                      type: SchemaType.OBJECT,
                      description: "",
                      properties: {
                        username: {
                          type: SchemaType.STRING,
                          description: "Basic/Digest auth username",
                        },
                        password: {
                          type: SchemaType.STRING,
                          description: "Basic/Digest auth password",
                        },
                      },
                    },
                    cookie: {
                      type: SchemaType.OBJECT,
                      description: "",
                      properties: {
                        uri: {
                          type: SchemaType.STRING,
                          description: "Cookie auth URI",
                        },
                        method: {
                          type: SchemaType.STRING,
                          description: "HTTP method for cookie auth",
                        },
                      },
                    },
                    token: {
                      type: SchemaType.OBJECT,
                      description: "",
                      properties: {
                        token: {
                          type: SchemaType.STRING,
                          description: "Authentication token",
                        },
                        location: {
                          type: SchemaType.STRING,
                          description: "Token location (body, header, or url)",
                        },
                        headerName: {
                          type: SchemaType.STRING,
                          description: "Header name when using header location",
                        },
                        scheme: {
                          type: SchemaType.STRING,
                          description:
                            "Authentication scheme (Bearer, custom, mac, None, or space for no scheme)",
                        },
                        paramName: {
                          type: SchemaType.STRING,
                          description: "Parameter name for token",
                        },
                      },
                    },
                  },
                },
                ping: {
                  type: SchemaType.OBJECT,
                  description: "",
                  properties: {
                    relativeURI: {
                      type: SchemaType.STRING,
                      description: "Relative URI for ping endpoint",
                    },
                    method: {
                      type: SchemaType.STRING,
                      description: "HTTP method for ping",
                    },
                  },
                },
              },
            },
            microServices: {
              type: SchemaType.OBJECT,
              description: "",
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
            },
          },
          required: ["type", "name", "http", "microServices"],
        },
      },
    ];

    expect(result).toEqual(expected);
  });
});
