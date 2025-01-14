# Tool Mappers

This directory contains utilities for mapping MCP tool schemas to Gemini's function calling format.

## Key Components

### `tool-mappers.ts`

Contains utilities for converting JSON Schema 7 tool definitions to Gemini's function calling format.

#### Schema Handling

- **Basic Types**: Directly maps JSON Schema types to Gemini SchemaTypes

  - string → SchemaType.STRING
  - number/integer → SchemaType.NUMBER
  - boolean → SchemaType.BOOLEAN
  - array → SchemaType.ARRAY
  - object → SchemaType.OBJECT
  - null → SchemaType.STRING

- **Complex Types**:
  - `oneOf`: Takes the first option in the oneOf array as the schema to use
  - `anyOf`: Similar to oneOf, takes the first option
  - Nested objects: Recursively maps properties
  - Arrays: Maps item types recursively, handling single items, item arrays, and boolean schemas
  - Boolean schemas: Maps directly to SchemaType.BOOLEAN
  - Type arrays: Takes the first type in the array (e.g., `type: ["string", "null"]` becomes `SchemaType.STRING`)

#### Type Safety

The mapper uses TypeScript types from the `json-schema` package:

- `JSONSchema7`: Full JSON Schema 7 type definition
- `JSONSchema7Definition`: Union type for all possible schema values

Custom types:

- `GeminiPropertyType`: Defines the shape of mapped Gemini properties
- Proper handling of schema items through `handleSchemaItems` helper

#### Important Note

For `oneOf` and `anyOf` schemas, the mapper uses the first option in the array. This is a simplification that works well for most cases where the options are variants of the same base schema (e.g., different connection types with shared properties).

Example:

```typescript
// Input schema with oneOf
{
  "oneOf": [
    { type: "object", properties: { name: { type: "string" } } },
    { type: "object", properties: { id: { type: "number" } } }
  ]
}

// Will be mapped using the first option to:
{
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING }
  }
}
```

#### Default Message Parameter

If a tool schema has no required fields, the mapper adds a default `_message` parameter of type string. This ensures all tools have at least one parameter for basic interaction.
