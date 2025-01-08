import fs from "fs";
import path from "path";
import { LlmConfig } from "@/features/llm-registry/lib/types";

const CONFIG_DIR = path.join(process.cwd(), "config");
const LLM_CONFIG_PATH = path.join(CONFIG_DIR, "llm.config.json");

export async function getLlmConfig(): Promise<LlmConfig> {
  try {
    const configData = await fs.promises.readFile(LLM_CONFIG_PATH, "utf-8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("Error reading LLM config:", error);
    // Return default config if file doesn't exist
    return {
      provider: "gemini",
      config: {
        apiKey: "",
        model: "gemini-pro",
        temperature: 0.7,
        maxTokens: 1000,
      },
    };
  }
}

export async function updateLlmConfig(config: LlmConfig): Promise<void> {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      await fs.promises.mkdir(CONFIG_DIR, { recursive: true });
    }
    await fs.promises.writeFile(
      LLM_CONFIG_PATH,
      JSON.stringify(config, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing LLM config:", error);
    throw error;
  }
}
