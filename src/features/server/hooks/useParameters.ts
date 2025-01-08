import { useState, useCallback } from "react";

interface ParameterSchema {
  type: "object";
  properties?: Record<string, { type: string; description?: string }>;
  required?: string[];
}

interface ValidationError {
  path: string[];
  message: string;
}

interface UseParametersReturn {
  values: Record<string, string>;
  errors: ValidationError[];
  setValue: (key: string, value: string) => void;
  setValues: (values: Record<string, string>) => void;
  validate: (schema: ParameterSchema) => boolean;
  reset: () => void;
}

export function useParameters(): UseParametersReturn {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const setValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => prev.filter((error) => error.path[0] !== key));
  }, []);

  const setMultipleValues = useCallback((newValues: Record<string, string>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
    setErrors((prev) =>
      prev.filter((error) => !Object.keys(newValues).includes(error.path[0]))
    );
  }, []);

  const validate = useCallback(
    (schema: ParameterSchema): boolean => {
      if (!schema.required) {
        setErrors([]);
        return true;
      }

      const newErrors: ValidationError[] = [];
      let isValid = true;

      schema.required.forEach((key) => {
        if (!values[key] || values[key].trim() === "") {
          isValid = false;
          newErrors.push({
            path: [key],
            message: `${key} is required`,
          });
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [values]
  );

  const reset = useCallback(() => {
    setValues({});
    setErrors([]);
  }, []);

  return {
    values,
    errors,
    setValue,
    setValues: setMultipleValues,
    validate,
    reset,
  };
}
