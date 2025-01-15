import { useState } from "react";
import { BaseCard } from "@/components/Card";
import { ToolCard } from "@/components/Card";
import { ExecutionHistoryCard } from "@/components/Card/ExecutionHistoryCard";
import { useLogStore } from "@/stores/log-store";
import type { LogType } from "@/stores/log-store";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { RefreshButton } from "@/components/Button";
import { ToolModal } from "@/components/Modal/ToolModal";
import {
  ValidationError,
  convertToolToJsonSchema,
  validateSchema,
} from "@/components/Modal/utils/schema-utils";

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
  const [parameterValues, setParameterValues] = useState<
    Record<string, unknown>
  >({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addLog } = useLogStore();

  const handleToolClick = (tool: Tool) => {
    try {
      convertToolToJsonSchema(tool);
      setSelectedTool(tool);
      setValidationErrors([]);
      setParameterValues({});
      setIsModalOpen(true);
    } catch (error) {
      console.error("Invalid tool schema:", error);
    }
  };

  const handleParameterChange = (key: string, value: unknown) => {
    const newValues = {
      ...parameterValues,
      [key]: value,
    };
    setParameterValues(newValues);

    if (selectedTool) {
      const schema = convertToolToJsonSchema(selectedTool);
      const errors = validateSchema(schema, newValues);
      setValidationErrors(errors);
    }
  };

  const handleExecute = async () => {
    if (!selectedTool) return;

    const schema = convertToolToJsonSchema(selectedTool);
    const errors = validateSchema(schema, parameterValues);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsExecuting(true);
    try {
      const result = await onExecuteTool(selectedTool.name, parameterValues);
      addLog({
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "success",
        name: selectedTool.name,
        params: parameterValues,
        result,
      });
      setIsModalOpen(false);
      setSelectedTool(null);
      setParameterValues({});
    } catch (error) {
      console.error("Error executing tool:", error);
      if (error instanceof Error) {
        addLog({
          type: "tool" as LogType,
          operation: "Execute Tool",
          status: "error",
          name: selectedTool.name,
          params: parameterValues,
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

  return (
    <BaseCard
      icon="solar:tools-line-duotone"
      title="Available Tools"
      subtitle={
        tools.length > 0
          ? `${tools.length} tool${tools.length === 1 ? "" : "s"} available`
          : "No tools loaded"
      }
      headerAction={
        hasListToolsCapability &&
        onFetchTools && (
          <RefreshButton
            onPress={onFetchTools}
            loading={isLoading}
            aria-label="Refresh tools list"
          />
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
            {tools.map((tool) => (
              <ToolCard
                key={tool.name}
                name={tool.name}
                description={tool.description}
                onExecute={() => handleToolClick(tool)}
                aria-label={`Tool: ${tool.name}`}
              />
            ))}
          </div>
        )}

        {!error && <ExecutionHistoryCard type="tool" />}

        {selectedTool && (
          <ToolModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTool(null);
              setParameterValues({});
            }}
            tool={{
              name: selectedTool.name,
              description: selectedTool.description,
              inputSchema: convertToolToJsonSchema(selectedTool),
            }}
            parameterValues={parameterValues}
            onParameterChange={handleParameterChange}
            validationErrors={validationErrors}
            primaryAction={{
              label: "Execute",
              loadingLabel: "Executing...",
              onClick: handleExecute,
              isLoading: isExecuting,
            }}
          />
        )}
      </div>
    </BaseCard>
  );
}
