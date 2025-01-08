declare module "*/llm.config.json" {
  interface LLMConfig {
    provider: string;
    config: {
      apiKey: string;
      model: string;
      temperature: number;
      maxTokens: number;
    };
  }
  const config: LLMConfig;
  export default config;
}
