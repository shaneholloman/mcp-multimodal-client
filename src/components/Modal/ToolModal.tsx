import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { ExecuteButton } from "@/components/Button";
import { SchemaField } from "./components/SchemaField";
import { JSONSchema7 } from "json-schema";
import { ValidationError } from "./utils/schema-utils";
import { useSchemaForm } from "./hooks/useSchemaForm";
import { useEffect } from "react";

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: {
    name: string;
    description?: string;
    inputSchema: JSONSchema7;
  };
  parameterValues: Record<string, unknown>;
  onParameterChange: (key: string, value: unknown) => void;
  validationErrors: ValidationError[];
  primaryAction: {
    label: string;
    loadingLabel: string;
    onPress: () => Promise<void>;
    isLoading: boolean;
  };
}

export function ToolModal({
  isOpen,
  onClose,
  tool,
  parameterValues,
  onParameterChange,
  validationErrors: externalValidationErrors = [],
  primaryAction,
}: ToolModalProps) {
  const { values, errors, setFieldValue, setValues } = useSchemaForm({
    schema: tool.inputSchema,
    initialValues: parameterValues,
  });

  // Keep form state in sync with external state
  useEffect(() => {
    setValues(parameterValues);
  }, [parameterValues, setValues]);

  // Sync form state with external state
  const handleFieldChange = (path: string[], value: unknown) => {
    setFieldValue(path, value);

    // For backward compatibility, call the external onChange
    // If it's a nested path, we need to update the entire parent object
    if (path.length > 0) {
      const topLevelKey = path[0];
      const currentTopLevelValue = values[topLevelKey] as Record<
        string,
        unknown
      >;

      if (path.length === 1) {
        onParameterChange(topLevelKey, value);
      } else {
        // For nested paths, update the entire parent object
        const current = { ...currentTopLevelValue };
        let pointer = current;

        // Navigate to the parent of the target property
        for (let i = 1; i < path.length - 1; i++) {
          const key = path[i];
          pointer[key] = pointer[key]
            ? { ...(pointer[key] as Record<string, unknown>) }
            : {};
          pointer = pointer[key] as Record<string, unknown>;
        }

        // Set the value at the target property
        const lastKey = path[path.length - 1];
        pointer[lastKey] = value;

        onParameterChange(topLevelKey, current);
      }
    }
  };

  // Combine external and internal validation errors, removing duplicates
  const allErrors = [...externalValidationErrors, ...errors].filter(
    (error, index, self) =>
      index ===
      self.findIndex(
        (e) =>
          e.path.join(".") === error.path.join(".") &&
          e.message === error.message
      )
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:play-circle-line-duotone"
                  className="h-5 w-5 text-primary"
                />
                <div className="flex flex-col gap-1">
                  <span>{tool.name}</span>
                  {tool.description && (
                    <span className="text-sm text-default-500">
                      {tool.description}
                    </span>
                  )}
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {allErrors.length > 0 && (
                  <StatusIndicator
                    type="danger"
                    title="Validation Errors"
                    description={allErrors
                      .map((error) =>
                        error.path.length > 0
                          ? `${error.path.join(".")}: ${error.message}`
                          : error.message
                      )
                      .join(", ")}
                  />
                )}

                <SchemaField
                  schema={tool.inputSchema}
                  path={[]}
                  value={values}
                  error={allErrors.find((e) => e.path.length === 0)}
                  onChange={handleFieldChange}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onModalClose}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <ExecuteButton
                onPress={primaryAction.onPress}
                loading={primaryAction.isLoading}
                label={primaryAction.label}
                loadingLabel={primaryAction.loadingLabel}
                className="min-w-[120px]"
                disabled={allErrors.length > 0}
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
