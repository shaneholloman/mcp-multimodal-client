import { useState } from "react";
import { useLogStore } from "@/stores/log-store";
import { useGlobalLlm } from "@/contexts/LlmProviderContext";
import { useModal } from "./useModal";

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

interface UsePromptsProps {
  onExecutePrompt: (
    name: string,
    params: Record<string, unknown>
  ) => Promise<void>;
  onGetPromptDetails: (name: string) => Promise<Prompt>;
}

interface UsePromptsReturn {
  handleExecutePrompt: (prompt: Prompt) => Promise<void>;
  handleViewPrompt: (prompt: Prompt) => Promise<void>;
  isLoading: boolean;
}

export function usePrompts({
  onExecutePrompt,
  onGetPromptDetails,
}: UsePromptsProps): UsePromptsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const modal = useModal();
  const llm = useGlobalLlm();
  const logger = useLogStore();

  const handlePromptAction = async (
    prompt: Prompt,
    mode: "view" | "execute"
  ) => {
    try {
      setIsLoading(true);
      const promptDetails = await onGetPromptDetails(prompt.name);

      modal.open(mode, {
        title: `${mode === "execute" ? "Execute" : "View"} Prompt: ${
          prompt.name
        }`,
        description: promptDetails.description,
        parameters: promptDetails.inputSchema?.properties,
        onSubmit: async (params) => {
          if (mode === "execute") {
            await onExecutePrompt(prompt.name, params);
          }
        },
      });
    } catch (error) {
      logger.addLog({
        type: "prompt",
        operation: mode === "execute" ? "Execute Prompt" : "View Prompt",
        status: "error",
        name: prompt.name,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get prompt details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecutePrompt = async (prompt: Prompt) => {
    await handlePromptAction(prompt, "execute");
  };

  const handleViewPrompt = async (prompt: Prompt) => {
    await handlePromptAction(prompt, "view");
  };

  return {
    handleExecutePrompt,
    handleViewPrompt,
    isLoading: isLoading || llm.isLoading,
  };
}
