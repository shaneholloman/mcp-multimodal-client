import config from "./llm.config.json";

export interface LLMConfig {
  provider: string;
  config: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export const llmConfig: LLMConfig = config;
