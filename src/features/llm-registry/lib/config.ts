import { LlmConfig } from "./types";

const CONFIG_KEY = "llm-settings";

export async function loadLlmSettings(): Promise<LlmConfig> {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load LLM settings:", error);
  }

  // Default settings
  return {
    provider: "gemini",
    config: {},
  };
}

export async function saveLlmSettings(settings: LlmConfig): Promise<void> {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save LLM settings:", error);
    throw error;
  }
}
