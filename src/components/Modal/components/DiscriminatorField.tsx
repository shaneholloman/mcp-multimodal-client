import { Select, SelectItem } from "@nextui-org/react";
import { JSONSchema7Definition } from "json-schema";
import { ValidationError, getDiscriminatorSchema } from "../utils/schema-utils";
import { SchemaField } from "./SchemaField";

interface DiscriminatorFieldProps {
  schema: JSONSchema7Definition;
  path: string[];
  value: unknown;
  error?: ValidationError;
  onChange: (path: string[], value: unknown) => void;
}

export function DiscriminatorField({
  schema,
  path,
  value,
  error,
  onChange,
}: DiscriminatorFieldProps) {
  if (typeof schema === "boolean") return null;

  const { discriminator, options } = getDiscriminatorSchema(schema);
  if (!discriminator?.enum) return null;

  const fieldName = path[path.length - 1] || "";

  return (
    <div key={path.join(".")} className="space-y-4">
      <Select
        label={`${fieldName} Type`}
        value={value?.toString()}
        onChange={(e) => onChange(path, e.target.value)}
        errorMessage={error?.message}
        isInvalid={!!error}
      >
        {discriminator.enum.map((option) => (
          <SelectItem key={option?.toString()} value={option?.toString() || ""}>
            {option?.toString() || ""}
          </SelectItem>
        ))}
      </Select>
      {typeof value === "string" && (
        <div className="space-y-4">
          {options.map((subSchema) => {
            if (typeof subSchema === "boolean") return null;
            if (!subSchema.properties?.type) return null;
            const typeSchema = subSchema.properties
              .type as JSONSchema7Definition;
            if (typeof typeSchema === "boolean") return null;
            if (typeSchema.const === value) {
              return Object.entries(subSchema.properties)
                .filter(([key]) => key !== "type")
                .map(([key, propSchema]) => (
                  <SchemaField
                    key={key}
                    schema={propSchema}
                    path={[...path, key]}
                    value={undefined}
                    error={error}
                    onChange={onChange}
                  />
                ));
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
