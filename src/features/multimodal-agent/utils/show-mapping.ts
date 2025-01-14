import { SchemaType } from "@google/generative-ai";
import { mapToolsToGeminiFormat } from "./tool-mappers";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import util from "util";

const tools = [
  {
    name: "simple_test",
    description: "A simple test tool",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name",
        },
        age: {
          type: "number",
          description: "The age",
        },
      },
      required: ["name"],
    },
  },
] as Tool[];

const result = mapToolsToGeminiFormat(tools);
console.log(
  "Mapped output:",
  util.inspect(result, { depth: null, colors: true })
);
