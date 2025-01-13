import { useState } from "react";
import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Button, ExecuteButton, RefreshButton } from "@/components/Button";
import { ToolCard } from "@/components/Card";
import { ExecutionHistoryCard } from "@/components/Card/ExecutionHistoryCard";
import { useLogStore } from "@/stores/log-store";
import type { LogType } from "@/stores/log-store";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

interface ValidationError {
  path: string[];
  message: string;
}

interface ToolsSectionProps {
  tools: Tool[];
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
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolParams, setToolParams] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { addLog } = useLogStore();

  const validateParams = (
    tool: Tool,
    params: Record<string, string>
  ): ValidationError[] => {
    const errors: ValidationError[] = [];
    const properties = tool.inputSchema?.properties || {};
    const required = (tool.inputSchema?.required as string[]) || [];

    // Check required fields
    required.forEach((key) => {
      if (!params[key] || params[key].trim() === "") {
        errors.push({
          path: [key],
          message: "This field is required",
        });
      }
    });

    // Validate types
    Object.entries(properties).forEach(([key, param]) => {
      const value = params[key];
      if (!value) return;

      const type = (param as { type: string }).type;
      if (type === "number" && isNaN(Number(value))) {
        errors.push({
          path: [key],
          message: "This field must be a number",
        });
      }
    });

    return errors;
  };

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    setValidationErrors([]);
    setToolParams({});
    onOpen();
  };

  const handleParamChange = (key: string, value: string) => {
    setToolParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExecute = async () => {
    if (!selectedTool) return;

    const errors = validateParams(selectedTool, toolParams);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsExecuting(true);
    try {
      const result = await onExecuteTool(selectedTool.name, toolParams);
      addLog({
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "success",
        name: selectedTool.name,
        params: toolParams,
        result,
      });
      onClose();
    } catch (error) {
      console.error("Error executing tool:", error);
      if (error instanceof Error) {
        addLog({
          type: "tool" as LogType,
          operation: "Execute Tool",
          status: "error",
          name: selectedTool.name,
          params: toolParams,
          error: error.message,
        });
        setValidationErrors([
          {
            path: [],
            message: error.message,
          },
        ]);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const hasError = (key: string): boolean => {
    return validationErrors.some((error) => error.path[0] === key);
  };

  const getErrorMessage = (key: string): string | undefined => {
    const error = validationErrors.find((error) => error.path[0] === key);
    return error?.message;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Available Tools</h2>
        {hasListToolsCapability && onFetchTools && (
          <RefreshButton
            onPress={onFetchTools}
            loading={isLoading}
            data-testid="tools-refresh-button"
          />
        )}
      </div>

      {error ? (
        <div className="text-danger">
          <div>Connection Error</div>
          <div>Failed to connect to server. Tools are unavailable.</div>
        </div>
      ) : tools.length === 0 ? (
        <div>No tools loaded</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.name}
              name={tool.name}
              description={tool.description}
              onExecute={() => handleToolClick(tool)}
            />
          ))}
        </div>
      )}

      <ExecutionHistoryCard type="tool" />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-semibold">
                  {selectedTool?.name || "Execute Tool"}
                </h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {selectedTool?.description && (
                    <p className="text-sm text-gray-600">
                      {selectedTool.description}
                    </p>
                  )}
                  {Object.entries(
                    selectedTool?.inputSchema?.properties || {}
                  ).map(([key, param]) => (
                    <div key={key}>
                      <Input
                        label={key}
                        placeholder={
                          (param as { description?: string })?.description
                        }
                        value={toolParams[key] || ""}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        isRequired={
                          Array.isArray(selectedTool?.inputSchema?.required) &&
                          selectedTool.inputSchema.required.includes(key)
                        }
                        isInvalid={hasError(key)}
                        errorMessage={getErrorMessage(key)}
                      />
                    </div>
                  ))}
                  {validationErrors.length > 0 && (
                    <div className="text-danger">
                      <h4 className="font-semibold">Validation Errors</h4>
                      {validationErrors.map((error, index) => (
                        <div key={index} className="text-danger">
                          {error.path.length > 0
                            ? `${error.path[0]} is required`
                            : error.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <ExecuteButton
                  onPress={handleExecute}
                  loading={isExecuting}
                  disabled={isExecuting}
                  label="Execute"
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
