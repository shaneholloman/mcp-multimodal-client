import React from "react";
import { Tooltip } from "@nextui-org/react";
import { BaseCard } from "@/components/Card";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { PromptCard } from "@/components/Card/PromptCard";
import { ExecutionHistoryCard } from "@/components/Card/ExecutionHistoryCard";
import { PromptModal } from "@/components/Modal/PromptModal";
import { RefreshButton } from "@/components/Button";
import { useLogStore } from "@/stores/log-store";

interface PromptParameter {
  type: string;
  description?: string;
}

interface ValidationError {
  path: string[];
  message: string;
}

interface Prompt {
  name: string;
  description?: string;
  type?: string;
  inputSchema?: {
    type: "object";
    properties?: Record<string, PromptParameter>;
    required?: string[];
  };
}

interface PromptsSectionProps {
  prompts: Prompt[];
  isLoading: boolean;
  onFetchPrompts?: () => Promise<void>;
  hasListPromptsCapability: boolean;
  error: boolean;
  onExecutePrompt: (
    name: string,
    params: Record<string, unknown>
  ) => Promise<unknown>;
  onGetPromptDetails: (
    name: string,
    args?: Record<string, string>
  ) => Promise<Prompt>;
}

export function PromptsSection({
  prompts,
  isLoading: isLoadingPrompts,
  onFetchPrompts,
  hasListPromptsCapability,
  error,
  onExecutePrompt,
  onGetPromptDetails,
}: PromptsSectionProps) {
  const [selectedPrompt, setSelectedPrompt] = React.useState<Prompt | null>(
    null
  );
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [promptResult, setPromptResult] = React.useState<unknown>(null);
  const [paramValues, setParamValues] = React.useState<Record<string, string>>(
    {}
  );
  const [validationErrors, setValidationErrors] = React.useState<
    ValidationError[]
  >([]);
  const { addLog } = useLogStore();

  const handlePromptAction = async (prompt: Prompt) => {
    try {
      setIsExecuting(true);
      setPromptResult(null);
      const promptDetails = await onGetPromptDetails(prompt.name);
      setSelectedPrompt(promptDetails);
      setParamValues({});
      setValidationErrors([]);
      setIsModalOpen(true);
    } catch (error) {
      addLog({
        type: "prompt",
        operation: "View Prompt",
        status: "error",
        name: prompt.name,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get prompt details",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleParamChange = (key: string, value: string) => {
    setParamValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateParams = (
    params: Record<string, string>
  ): ValidationError[] => {
    const errors: ValidationError[] = [];
    const required = selectedPrompt?.inputSchema?.required || [];

    required.forEach((key) => {
      if (!params[key] || params[key].trim() === "") {
        errors.push({
          path: [key],
          message: "This field is required",
        });
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    if (!selectedPrompt) return;

    const errors = validateParams(paramValues);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsExecuting(true);
    try {
      const result = await onExecutePrompt(selectedPrompt.name, paramValues);
      setPromptResult(result);
      addLog({
        type: "prompt",
        operation: "Execute Prompt",
        status: "success",
        name: selectedPrompt.name,
        params: paramValues,
        result,
      });
    } catch (error) {
      addLog({
        type: "prompt",
        operation: "Execute Prompt",
        status: "error",
        name: selectedPrompt.name,
        params: paramValues,
        error: error instanceof Error ? error.message : "Operation failed",
      });
      setValidationErrors([
        {
          path: [],
          message: error instanceof Error ? error.message : "Operation failed",
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
    setParamValues({});
    setPromptResult(null);
    setValidationErrors([]);
  };

  if (!hasListPromptsCapability) {
    return null;
  }

  return (
    <BaseCard
      icon="solar:document-text-line-duotone"
      title="Available Prompts"
      subtitle={
        prompts.length > 0
          ? `${prompts.length} prompt${
              prompts.length === 1 ? "" : "s"
            } available`
          : "No prompts loaded"
      }
      headerAction={
        <Tooltip content="Refresh available prompts">
          <RefreshButton
            onPress={onFetchPrompts}
            loading={isLoadingPrompts}
            aria-label="Refresh prompts list"
          />
        </Tooltip>
      }
    >
      <div className="space-y-8">
        {error ? (
          <StatusIndicator
            type="danger"
            title="Connection Error"
            description="Failed to connect to server. Prompts are unavailable."
            icon="solar:shield-warning-line-duotone"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.name}
                prompt={prompt}
                onExecute={() => handlePromptAction(prompt)}
                onView={() => handlePromptAction(prompt)}
                isLoading={isExecuting}
                aria-label={`Prompt: ${prompt.name}`}
              />
            ))}
          </div>
        )}

        {!error && <ExecutionHistoryCard type="prompt" />}

        <PromptModal
          isOpen={isModalOpen}
          onClose={handleClose}
          title={selectedPrompt?.name || "Execute Prompt"}
          description={selectedPrompt?.description}
          parameters={selectedPrompt?.inputSchema?.properties}
          parameterValues={paramValues}
          onParameterChange={handleParamChange}
          validationErrors={validationErrors}
          requiredParameters={selectedPrompt?.inputSchema?.required}
          primaryAction={{
            label: promptResult ? "Close" : "Execute",
            loadingLabel: "Executing...",
            onClick: promptResult ? handleClose : handleSubmit,
            isLoading: isExecuting,
          }}
          result={
            promptResult ? JSON.stringify(promptResult, null, 2) : undefined
          }
        />
      </div>
    </BaseCard>
  );
}
