import { useState } from "react";
import { useLogStore } from "@/stores/log-store";

interface Prompt {
  name: string;
  description?: string;
  type?: string;
  inputSchema?: {
    type: "object";
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
  messages?: Array<{
    role: string;
    content: {
      type: string;
      text: string;
    };
  }>;
}

interface ValidationError {
  path: string[];
  message: string;
}

interface UsePromptExecutionProps {
  onExecutePrompt: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<unknown>;
  onGetPromptDetails: (
    name: string,
    args?: Record<string, string>
  ) => Promise<Prompt>;
}

interface UsePromptExecutionReturn {
  selectedPrompt: Prompt | null;
  promptParams: Record<string, string>;
  validationErrors: ValidationError[];
  isExecuting: boolean;
  isLoading: boolean;
  handlePromptSelect: (prompt: Prompt) => Promise<void>;
  handleParameterChange: (key: string, value: string) => void;
  executePrompt: () => Promise<boolean>;
  resetPrompt: () => void;
}

export function usePromptExecution({
  onExecutePrompt,
  onGetPromptDetails,
}: UsePromptExecutionProps): UsePromptExecutionReturn {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [promptParams, setPromptParams] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addLog } = useLogStore();

  const validateParameters = () => {
    const errors: ValidationError[] = [];
    if (!selectedPrompt?.inputSchema) return errors;

    const { required = [] } = selectedPrompt.inputSchema;
    required.forEach((key) => {
      if (!promptParams[key] || promptParams[key].trim() === "") {
        errors.push({
          path: [key],
          message: `${key} is required`,
        });
      }
    });

    return errors;
  };

  const handlePromptSelect = async (prompt: Prompt) => {
    setIsLoading(true);
    try {
      const promptDetails = await onGetPromptDetails(prompt.name);
      setSelectedPrompt(promptDetails);
      setValidationErrors([]);

      const initialParams: Record<string, string> = {};
      if (promptDetails.inputSchema?.properties) {
        Object.keys(promptDetails.inputSchema.properties).forEach((key) => {
          initialParams[key] = "";
        });
      }
      setPromptParams(initialParams);
      addLog({
        type: "prompt",
        operation: "View Prompt",
        status: "success",
        name: prompt.name,
        result: promptDetails,
      });
    } catch (error) {
      addLog({
        type: "prompt",
        operation: "View Prompt",
        status: "error",
        name: prompt.name,
        error: error instanceof Error ? error.message : "Failed to view prompt",
      });
      console.error("Error fetching prompt details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParameterChange = (key: string, value: string) => {
    setPromptParams((prev) => ({ ...prev, [key]: value }));
    setValidationErrors((prev) =>
      prev.filter((error) => error.path[0] !== key)
    );
  };

  const executePrompt = async (): Promise<boolean> => {
    if (!selectedPrompt) return false;

    const errors = validateParameters();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }

    setIsExecuting(true);
    try {
      const result = await onExecutePrompt(selectedPrompt.name, promptParams);
      addLog({
        type: "prompt",
        operation: "Execute Prompt",
        status: "success",
        name: selectedPrompt.name,
        params: promptParams,
        result,
      });
      return true;
    } catch (error) {
      addLog({
        type: "prompt",
        operation: "Execute Prompt",
        status: "error",
        name: selectedPrompt.name,
        params: promptParams,
        error: error instanceof Error ? error.message : "An error occurred",
      });
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  const resetPrompt = () => {
    setSelectedPrompt(null);
    setPromptParams({});
    setValidationErrors([]);
  };

  return {
    selectedPrompt,
    promptParams,
    validationErrors,
    isExecuting,
    isLoading,
    handlePromptSelect,
    handleParameterChange,
    executePrompt,
    resetPrompt,
  };
}
