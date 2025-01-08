import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

export interface LlmProviderConfig {
  id: string;
  name: string;
  description: string;
  configSchema: {
    [key: string]: {
      type: "string" | "number" | "boolean" | "select";
      label: string;
      description?: string;
      default?: unknown;
      options?: Array<{ label: string; value: string }>;
      isSecret?: boolean;
    };
  };
}

export interface LlmProviderInstance {
  id: string;
  name: string;
  executePrompt: (prompt: {
    name: string;
    messages: PromptMessage[];
    params?: Record<string, unknown>;
  }) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export interface LlmRegistryContextType {
  providers: LlmProviderConfig[];
  activeProvider: string | null;
  providerConfig: Record<string, unknown>;
  getProviderConfig: (providerId: string) => LlmProviderConfig | null;
  getProviderInstance: (providerId: string) => LlmProviderInstance | null;
  registerProvider: (
    config: LlmProviderConfig,
    instance: LlmProviderInstance
  ) => void;
  unregisterProvider: (providerId: string) => void;
}

export interface LlmConfig {
  provider: string;
  config: Record<string, unknown>;
}
