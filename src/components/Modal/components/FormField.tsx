import { memo } from "react";
import { Input, Select, SelectItem, Checkbox } from "@nextui-org/react";
import { JSONSchema7Definition } from "json-schema";
import { ValidationError } from "../utils/schema-utils";

interface FormFieldProps {
  schema: JSONSchema7Definition;
  path: string[];
  value: unknown;
  error?: ValidationError;
  onChange: (path: string[], value: unknown) => void;
  label?: string;
}

function FormFieldComponent({
  schema,
  path,
  value,
  error,
  onChange,
  label,
}: FormFieldProps) {
  if (typeof schema === "boolean") return null;

  const fieldName = label || path[path.length - 1] || "";

  // Handle boolean fields
  if (schema.type === "boolean") {
    return (
      <Checkbox
        isSelected={value as boolean}
        onValueChange={(checked) => onChange(path, checked)}
        className="mb-4"
      >
        {schema.description || fieldName}
      </Checkbox>
    );
  }

  // Handle enum fields
  if (schema.enum) {
    const stringValue = value?.toString() || "";
    return (
      <Select
        label={schema.description || fieldName}
        selectedKeys={stringValue ? [stringValue] : []}
        onChange={(e) => onChange(path, e.target.value)}
        errorMessage={error?.message}
        isInvalid={!!error}
        className="mb-4"
      >
        {schema.enum.map((option) => (
          <SelectItem
            key={option?.toString() || ""}
            value={option?.toString() || ""}
          >
            {option?.toString() || ""}
          </SelectItem>
        ))}
      </Select>
    );
  }

  // Handle basic input fields
  const stringValue = value?.toString() || "";
  return (
    <Input
      label={schema.description || fieldName}
      value={stringValue}
      type={schema.type === "number" ? "number" : "text"}
      onChange={(e) => {
        const newValue =
          schema.type === "number" ? Number(e.target.value) : e.target.value;
        onChange(path, newValue);
      }}
      errorMessage={error?.message}
      isInvalid={!!error}
      className="mb-4"
      data-testid={`tool-${fieldName}-input`}
    />
  );
}

export const FormField = memo(FormFieldComponent);
