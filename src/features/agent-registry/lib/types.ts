import { Tool, Resource } from "@modelcontextprotocol/sdk/types.js";
import { LiveConfig } from "@/features/multimodal-agent/multimodal-live-types";

export interface PromptPost {
  instruction: {
    static: string;
    state: string;
    dynamic: string;
  };
  input: {
    name: string;
    description: string;
    type: string[];
    reference: string[];
  };
  output: {
    name: string;
    description: string;
    type: string[];
    reference: string[];
  };
  metadata: {
    title: string;
    description: string;
    tag: string[];
    log_message: string;
  };
}

export interface AgentConfig {
  name: string;
  description: string;
  instruction: string;
  knowledge: string;
  voice: string;
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  resources: Resource[];
  dependencies: string[];
  config: {
    model: string;
    generationConfig: {
      responseModalities: "audio" | "image" | "text";
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: string;
          };
        };
      };
    };
  };
}

export interface AgentRegistryContextType {
  agents: AgentConfig[];
  activeAgent: string | null;
  loadAgents: () => Promise<void>;
  saveAgent: (agent: AgentConfig) => Promise<void>;
  deleteAgent: (agentName: string) => Promise<void>;
  getAgent: (agentName: string) => AgentConfig | null;
  setActiveAgent: (agentName: string | null) => void;
  tools: Tool[];
  resources: Resource[];
  activeTools: Tool[];
  activeResources: Resource[];
  toggleTool: (tool: Tool) => void;
  toggleResource: (resource: Resource) => void;
  config: LiveConfig;
}
