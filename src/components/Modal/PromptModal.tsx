import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { ExecuteButton } from "@/components/Button";

interface PromptParameter {
  type: string;
  description?: string;
}

interface ValidationError {
  path: string[];
  message: string;
}

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  parameters?: Record<string, PromptParameter>;
  parameterValues: Record<string, string>;
  onParameterChange: (key: string, value: string) => void;
  validationErrors?: ValidationError[];
  requiredParameters?: string[];
  primaryAction?: {
    label: string;
    loadingLabel?: string;
    onClick: () => void;
    isLoading?: boolean;
  };
  previewContent?: string;
}

export function PromptModal({
  isOpen,
  onClose,
  title,
  description,
  parameters = {},
  parameterValues,
  onParameterChange,
  validationErrors = [],
  requiredParameters = [],
  primaryAction,
  previewContent,
}: PromptModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={previewContent ? "2xl" : "lg"}
      role="dialog"
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <Icon
                  icon={
                    previewContent
                      ? "solar:document-text-line-duotone"
                      : "solar:play-circle-line-duotone"
                  }
                  className="h-5 w-5 text-primary"
                />
                <div className="flex flex-col gap-1">
                  <span>{title}</span>
                  {description && (
                    <span
                      className="text-sm text-default-500"
                      data-testid="prompt-modal-description"
                    >
                      {description}
                    </span>
                  )}
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {validationErrors.length > 0 && (
                  <StatusIndicator
                    type="danger"
                    title="Validation Errors"
                    description={validationErrors
                      .map(
                        (error) =>
                          `${
                            error.path.length > 0
                              ? `${error.path.join(".")}: `
                              : ""
                          }${error.message}`
                      )
                      .join(", ")}
                  />
                )}

                {!previewContent &&
                  Object.entries(parameters).map(([key, param]) => {
                    const isRequired = requiredParameters.includes(key);
                    const error = validationErrors.find(
                      (e) => e.path[0] === key
                    );

                    return (
                      <Input
                        key={key}
                        label={`${key}${isRequired ? " *" : ""}`}
                        placeholder={param.description || `Enter ${key}`}
                        value={parameterValues[key] || ""}
                        type={param.type === "number" ? "number" : "text"}
                        isRequired={isRequired}
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        onChange={(e) => onParameterChange(key, e.target.value)}
                        data-testid={`prompt-${key}-input`}
                      />
                    );
                  })}

                {previewContent && (
                  <pre className="bg-default-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {previewContent}
                  </pre>
                )}
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
              {primaryAction && (
                <ExecuteButton
                  onPress={primaryAction.onClick}
                  loading={primaryAction.isLoading}
                  label={primaryAction.label}
                  loadingLabel={primaryAction.loadingLabel || "Loading..."}
                  className="min-w-[120px]"
                  disabled={validationErrors.length > 0}
                />
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
