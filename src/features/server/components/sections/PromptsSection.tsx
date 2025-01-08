import React from "react";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { RefreshButton } from "@/components/Button";
import { Tooltip } from "@nextui-org/react";
import { BaseCard } from "@/components/Card";
import { PromptCard } from "@/components/Card/PromptCard";
import { ExecutionHistoryCard } from "@/components/Card/ExecutionHistoryCard";
import { PromptModal } from "@/components/Modal/PromptModal";
import { useModal } from "../../hooks/useModal";
import { useParameters } from "../../hooks/useParameters";
import { useLlmPrompt } from "../../hooks/useLlmPrompt";
import { usePromptLogger } from "../../hooks/usePromptLogger";

interface Prompt {
  name: string;
  description?: string;
  type?: string;
  inputSchema?: {
    type: "object";
    properties?: Record<string, { type: string; description?: string }>;
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
  // Core hooks
  const modal = useModal();
  const params = useParameters();
  const llm = useLlmPrompt();
  const logger = usePromptLogger();

  // State
  const [selectedPrompt, setSelectedPrompt] = React.useState<Prompt | null>(
    null
  );
  const [isExecuting, setIsExecuting] = React.useState(false);

  // Handlers
  const handlePromptAction = async (
    prompt: Prompt,
    mode: "view" | "execute"
  ) => {
    try {
      setIsExecuting(true);
      const promptDetails = await onGetPromptDetails(prompt.name);
      setSelectedPrompt(promptDetails);
      params.reset();
      modal.open(mode);
    } catch (error) {
      logger.logError(
        mode === "view" ? "View Prompt" : "Execute Prompt",
        prompt.name,
        error instanceof Error ? error : "Failed to get prompt details"
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPrompt) return;

    try {
      setIsExecuting(true);
      if (modal.mode === "view") {
        const result = await onGetPromptDetails(
          selectedPrompt.name,
          params.values
        );
        logger.logSuccess(
          "View Prompt",
          selectedPrompt.name,
          params.values,
          result
        );
        modal.close();
      } else if (modal.mode === "execute") {
        const promptDetails = await onGetPromptDetails(
          selectedPrompt.name,
          params.values
        );
        await onExecutePrompt(selectedPrompt.name, params.values);
        const result = await llm.execute(promptDetails, params.values);
        logger.logSuccess(
          "Execute Prompt",
          selectedPrompt.name,
          params.values,
          result
        );
        modal.close();
      }
    } catch (error) {
      logger.logError(
        modal.mode === "view" ? "View Prompt" : "Execute Prompt",
        selectedPrompt.name,
        error instanceof Error ? error : "Operation failed",
        params.values
      );
    } finally {
      setIsExecuting(false);
    }
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
          <RefreshButton onPress={onFetchPrompts} loading={isLoadingPrompts} />
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
                onExecute={() => handlePromptAction(prompt, "execute")}
                onView={() => handlePromptAction(prompt, "view")}
                isLoading={isExecuting}
                data-testid={`prompt-card-${prompt.name}`}
              />
            ))}
          </div>
        )}

        {!error && <ExecutionHistoryCard type="prompt" />}
      </div>

      <PromptModal
        isOpen={modal.isOpen}
        onClose={() => {
          modal.close();
          params.reset();
        }}
        title={`${modal.mode === "execute" ? "Execute" : "View"} Prompt: ${
          selectedPrompt?.name
        }`}
        description={selectedPrompt?.description}
        parameters={selectedPrompt?.inputSchema?.properties}
        parameterValues={params.values}
        onParameterChange={params.setValue}
        validationErrors={params.errors}
        requiredParameters={selectedPrompt?.inputSchema?.required}
        primaryAction={{
          label: "Execute Prompt",
          loadingLabel: "Executing...",
          onClick: handleSubmit,
          isLoading: isExecuting,
        }}
        data-testid="prompt-modal"
      />
    </BaseCard>
  );
}
