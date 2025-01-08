import { useState } from "react";
import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { Button, ExecuteButton, RefreshButton } from "@/components/Button";
import { BaseCard } from "@/components/Card";
import { ToolCard } from "@/components/Card";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { ExecutionHistoryCard } from "@/components/Card/ExecutionHistoryCard";
import { useLogStore } from "@/stores/log-store";

interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

interface ValidationError {
  path: string[];
  message: string;
}

interface ToolsSectionProps {
  tools: McpTool[];
  onExecuteTool: (
    toolName: string,
    params: Record<string, unknown>
  ) => Promise<unknown>;
  isLoading?: boolean;
  onFetchTools?: () => Promise<void>;
  hasListToolsCapability?: boolean;
  error?: boolean;
}

export function ToolsSection({
  tools,
  onExecuteTool,
  isLoading = false,
  onFetchTools,
  hasListToolsCapability = false,
  error = false,
}: ToolsSectionProps) {
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [toolParams, setToolParams] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { addLog } = useLogStore();

  const validateParameters = () => {
    const errors: ValidationError[] = [];
    if (!selectedTool?.inputSchema) return errors;

    const { required = [] } = selectedTool.inputSchema;
    required.forEach((key) => {
      if (!toolParams[key] || toolParams[key].trim() === "") {
        errors.push({
          path: [key],
          message: `${key} is required`,
        });
      }
    });

    return errors;
  };

  const handleToolClick = (tool: McpTool) => {
    setSelectedTool(tool);
    setValidationErrors([]);

    const initialParams: Record<string, string> = {};
    if (tool.inputSchema?.properties) {
      Object.keys(tool.inputSchema.properties).forEach((key) => {
        initialParams[key] = "";
      });
    }
    setToolParams(initialParams);
    onOpen();
  };

  const handleToolExecute = async () => {
    if (!selectedTool) return;

    const errors = validateParameters();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setIsExecuting(true);

    const processedParams: Record<string, unknown> = {};
    if (selectedTool.inputSchema?.properties) {
      Object.entries(selectedTool.inputSchema.properties).forEach(
        ([key, param]) => {
          const value = toolParams[key];
          if (value) {
            if (param.type === "number") {
              processedParams[key] = Number(value);
            } else {
              processedParams[key] = value;
            }
          }
        }
      );
    }

    try {
      const result = await onExecuteTool(selectedTool.name, processedParams);
      addLog({
        type: "tool",
        operation: "Execute Tool",
        status: "success",
        name: selectedTool.name,
        params: processedParams,
        result,
      });
      onClose();
    } catch (error) {
      addLog({
        type: "tool",
        operation: "Execute Tool",
        status: "error",
        name: selectedTool.name,
        params: processedParams,
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <BaseCard
      icon="solar:widget-line-duotone"
      title="Available Tools"
      subtitle={
        tools.length > 0
          ? `${tools.length} tool${tools.length === 1 ? "" : "s"} available`
          : "No tools loaded"
      }
      headerAction={
        hasListToolsCapability &&
        onFetchTools && (
          <Tooltip content="Refresh available tools">
            <RefreshButton
              onPress={onFetchTools}
              loading={isLoading}
              data-testid="tools-refresh-button"
            />
          </Tooltip>
        )
      }
    >
      <div className="space-y-8">
        {error ? (
          <StatusIndicator
            type="danger"
            title="Connection Error"
            description="Failed to connect to server. Tools are unavailable."
            icon="solar:shield-warning-line-duotone"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading
              ? Array(3)
                  .fill(null)
                  .map((_, i) => <ToolCard key={i} isLoading />)
              : tools.length > 0
              ? tools.map((tool) => (
                  <ToolCard
                    key={tool.name}
                    name={tool.name}
                    description={tool.description}
                    onExecute={() => handleToolClick(tool)}
                  />
                ))
              : Array(3)
                  .fill(null)
                  .map((_, i) => <ToolCard key={i} isEmpty />)}
          </div>
        )}

        {!error && <ExecutionHistoryCard type="tool" />}
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon
                    icon="solar:play-circle-line-duotone"
                    className="h-5 w-5 text-primary"
                  />
                  <div className="flex flex-col gap-1">
                    <span>Execute Tool: {selectedTool?.name}</span>
                    {selectedTool?.description && (
                      <span className="text-sm text-default-500">
                        {selectedTool.description}
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
                  {selectedTool?.inputSchema?.properties &&
                    Object.entries(selectedTool.inputSchema.properties).map(
                      ([key, param]) => {
                        const isRequired =
                          selectedTool.inputSchema.required?.includes(key);
                        const error = validationErrors.find(
                          (e) => e.path[0] === key
                        );

                        return (
                          <Input
                            key={key}
                            label={`${key}${isRequired ? " *" : ""}`}
                            placeholder={param.description || `Enter ${key}`}
                            value={toolParams[key] || ""}
                            type={param.type === "number" ? "number" : "text"}
                            isRequired={isRequired}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            data-testid={`input-${key}`}
                            onChange={(e) =>
                              setToolParams((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                          />
                        );
                      }
                    )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <ExecuteButton
                  onPress={handleToolExecute}
                  loading={isExecuting}
                  loadingLabel="Executing..."
                  label="Execute"
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </BaseCard>
  );
}
