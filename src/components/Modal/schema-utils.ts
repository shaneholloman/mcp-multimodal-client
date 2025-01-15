export function validateSchema(
  schema: JSONSchema7,
  data: any,
  path: string[] = []
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (schema.required && Array.isArray(schema.required)) {
    for (const requiredField of schema.required) {
      if (data === undefined || data[requiredField] === undefined) {
        errors.push({
          path: [...path, requiredField],
          message: "This field is required",
        });
      }
    }
  }

  if (schema.oneOf) {
    const validSchemas = schema.oneOf.filter((subSchema) => {
      const subErrors = validateSchema(subSchema as JSONSchema7, data, path);
      return subErrors.length === 0;
    });

    if (validSchemas.length === 0) {
      errors.push({
        path,
        message: "Data does not match any of the allowed schemas",
      });
    }
  }

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (data && data[key] !== undefined) {
        const propErrors = validateSchema(
          propSchema as JSONSchema7,
          data[key],
          [...path, key]
        );
        errors.push(...propErrors);
      }
    }
  }

  if (schema.enum) {
    if (data !== undefined && !schema.enum.includes(data)) {
      errors.push({
        path,
        message: `Must be one of: ${schema.enum.join(", ")}`,
      });
    }
  }

  return errors;
}
