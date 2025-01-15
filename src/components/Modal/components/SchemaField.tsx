import { memo } from "react";
import { Select, SelectItem } from "@nextui-org/react";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { ValidationError } from "../utils/schema-utils";
import { FormField } from "./FormField";

interface SchemaFieldProps {
  schema: JSONSchema7Definition;
  path: string[];
  value: unknown;
  error?: ValidationError;
  onChange: (path: string[], value: unknown) => void;
}

function SchemaFieldComponent({
  schema,
  path,
  value,
  error,
  onChange,
}: SchemaFieldProps) {
  if (typeof schema === "boolean") return null;

  // Handle oneOf schemas
  if (schema.oneOf) {
    // First, render the type selector
    const typeValue = (value as Record<string, unknown>)?.type as string;
    const typeOptions = schema.oneOf
      .map((subSchema) => {
        if (typeof subSchema === "boolean") return null;
        if (!subSchema.properties?.type) return null;
        const typeSchema = subSchema.properties.type as JSONSchema7;
        return typeSchema.const as string;
      })
      .filter((type): type is string => type !== null);

    const selectedSchema = schema.oneOf.find(
      (subSchema) =>
        typeof subSchema !== "boolean" &&
        subSchema.properties?.type &&
        typeof subSchema.properties.type !== "boolean" &&
        subSchema.properties.type.const === typeValue
    );

    return (
      <div className="space-y-4">
        <Select
          label="Type"
          selectedKeys={typeValue ? [typeValue] : []}
          onChange={(e) => onChange([...path, "type"], e.target.value)}
          errorMessage={error?.message}
          isInvalid={!!error}
          className="mb-4"
        >
          {typeOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </Select>

        {selectedSchema &&
          typeof selectedSchema !== "boolean" &&
          selectedSchema.properties && (
            <div className="pl-4 border-l-2 border-default-200">
              {Object.entries(selectedSchema.properties)
                .filter(([key]) => key !== "type") // Skip the type field as it's already rendered
                .map(([key, propSchema]) => (
                  <SchemaField
                    key={key}
                    schema={propSchema}
                    path={[...path, key]}
                    value={(value as Record<string, unknown>)?.[key]}
                    error={
                      error?.path.join(".") === [...path, key].join(".")
                        ? error
                        : undefined
                    }
                    onChange={onChange}
                  />
                ))}
            </div>
          )}
      </div>
    );
  }

  // Handle nested objects
  if (schema.type === "object" && schema.properties) {
    return (
      <div className="space-y-4">
        {Object.entries(schema.properties).map(([key, propSchema]) => (
          <SchemaField
            key={key}
            schema={propSchema}
            path={[...path, key]}
            value={(value as Record<string, unknown>)?.[key]}
            error={
              error?.path.join(".") === [...path, key].join(".")
                ? error
                : undefined
            }
            onChange={onChange}
          />
        ))}
      </div>
    );
  }

  // Handle basic fields (string, number, boolean, enum)
  return (
    <FormField
      schema={schema}
      path={path}
      value={value}
      error={error}
      onChange={onChange}
    />
  );
}

export const SchemaField = memo(SchemaFieldComponent);
