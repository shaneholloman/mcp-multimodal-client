# Multimodal Agent Utilities

This directory contains utility functions for the multimodal agent implementation, particularly focusing on mapping between JSON Schema and Gemini's type system.

## Tool Mappers

The `tool-mappers.ts` file provides functionality to convert JSON Schema definitions to Gemini-compatible format, with special handling for various schema types and protected keywords.

### Protected Keywords

When mapping property names, certain keywords are protected and automatically prefixed with `safe_` to prevent conflicts:

- `from` → `safe_from`

This transformation is applied recursively to all object properties, including nested objects and array items.

### Key Functions

- `mapPropertyType`: Converts JSON Schema types to Gemini schema types
- `mapToolProperties`: Maps MCP tool definitions to Gemini-compatible format
- `safePropertyName`: Handles protected keyword transformation
- `sanitizeFunctionName`: Ensures function names are valid identifiers

### Example Usage

```typescript
import { mapToolsToGeminiFormat } from "./tool-mappers";

const tools = [
  {
    name: "auth",
    description: "Authentication tool",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string" }, // Will be mapped to safe_token
        from: { type: "string" }, // Will be mapped to safe_from
      },
    },
  },
];

const geminiTools = mapToolsToGeminiFormat(tools);
```

### Type Mappings

| JSON Schema Type | Gemini Type |
| ---------------- | ----------- |
| string           | STRING      |
| number/integer   | NUMBER      |
| boolean          | BOOLEAN     |
| array            | ARRAY       |
| object           | OBJECT      |
| null             | STRING      |

### Special Cases

1. Objects with no properties get a default `_data` field
2. Arrays with no item type default to STRING items
3. Protected keywords are automatically prefixed with `safe_`
4. Required fields are preserved in the mapping
