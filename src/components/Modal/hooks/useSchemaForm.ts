import { useCallback, useMemo, useState } from "react";
import { JSONSchema7 } from "json-schema";
import {
  getInitialValues,
  getValueAtPath,
  setValueAtPath,
} from "../utils/form-state";
import { ValidationError, validateSchema } from "../utils/schema-utils";

export interface UseSchemaFormProps {
  schema: JSONSchema7;
  initialValues?: Record<string, unknown>;
}

export interface UseSchemaFormResult {
  values: Record<string, unknown>;
  errors: ValidationError[];
  getFieldValue: (path: string[]) => unknown;
  setFieldValue: (path: string[], value: unknown) => void;
  setValues: (values: Record<string, unknown>) => void;
  isValid: boolean;
}

export function useSchemaForm({
  schema,
  initialValues,
}: UseSchemaFormProps): UseSchemaFormResult {
  // Initialize form state with either provided values or defaults from schema
  const [values, setValues] = useState<Record<string, unknown>>(() => ({
    ...getInitialValues(schema),
    ...initialValues,
  }));

  // Memoize validation errors
  const errors = useMemo(
    () => validateSchema(schema, values),
    [schema, values]
  );

  // Memoize field value getter
  const getFieldValue = useCallback(
    (path: string[]) => getValueAtPath(values, path),
    [values]
  );

  // Memoize field value setter
  const setFieldValue = useCallback((path: string[], value: unknown) => {
    setValues((prev) => setValueAtPath(prev, path, value));
  }, []);

  // Memoize form validity
  const isValid = useMemo(() => errors.length === 0, [errors]);

  return {
    values,
    errors,
    getFieldValue,
    setFieldValue,
    setValues,
    isValid,
  };
}
