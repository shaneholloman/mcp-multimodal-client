import { useState, useEffect, useCallback } from "react";
import { useLlmRegistry } from "@/features/llm-registry";
import { useLogStore } from "@/stores/log-store";
import { geminiProvider } from "./provider";
import { generateLlmResponse } from "./implementation";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

export function useGeminiProvider() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addLog } = useLogStore();
  const { registerProvider, unregisterProvider, providerConfig } =
    useLlmRegistry();

  const executePrompt = useCallback(
    async ({
      name,
      messages,
      params,
    }: {
      name: string;
      messages: PromptMessage[];
      params?: Record<string, unknown>;
    }): Promise<string> => {
      if (!messages || messages.length === 0) {
        const error = "No valid content found in messages";
        console.error("Gemini Provider - No Messages Error", { messages });
        setError(error);
        addLog({
          type: "prompt",
          operation: "Execute Prompt",
          status: "error",
          name,
          params,
          error,
        });
        throw new Error(error);
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use provider configuration with Gemini Flash as default
        const result = await generateLlmResponse(messages, {
          model: "gemini-2.0-flash-exp",
          temperature: providerConfig?.temperature as number,
          maxTokens: providerConfig?.maxTokens as number,
        });

        if (result.error) {
          console.error("Gemini Provider - API Error", result.error);
          throw new Error(result.error);
        }

        addLog({
          type: "prompt",
          operation: "Execute Prompt",
          status: "success",
          name,
          params,
          result: {
            full: result.response,
            text: result.response,
          },
        });

        return result.response;
      } catch (err) {
        console.error("Gemini Provider - Execution Error", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        addLog({
          type: "prompt",
          operation: "Execute Prompt",
          status: "error",
          name,
          params,
          error: errorMessage,
        });

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addLog, providerConfig]
  );

  // Register provider instance on mount
  useEffect(() => {
    const instance = {
      id: geminiProvider.id,
      name: geminiProvider.name,
      executePrompt,
      isLoading,
      error,
    };

    registerProvider(geminiProvider, instance);
    return () => {
      unregisterProvider(geminiProvider.id);
    };
  }, [registerProvider, unregisterProvider, executePrompt, isLoading, error]);

  return {
    executePrompt,
    isLoading,
    error,
  };
}
