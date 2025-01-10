import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  AgentConfig,
  AgentRegistryContextType,
  PromptPost,
} from "../lib/types";
import { readAgentConfig, writeAgentConfig } from "@/utils/config";
import { Resource, Tool } from "@modelcontextprotocol/sdk/types.js";
import { LiveConfig } from "@/features/multimodal-agent/multimodal-live-types";
import { useMcp } from "@/contexts/McpContext";
import { mapToolsToGeminiFormat } from "@/features/multimodal-agent/utils/tool-mappers";

const AgentRegistryContext = createContext<AgentRegistryContextType | null>(
  null
);

interface Props {
  children: ReactNode;
}

const defaultConfig = {
  model: "models/gemini-2.0-flash-exp",
  generationConfig: {
    responseModalities: "audio" as const,
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: "Kore",
        },
      },
    },
  },
};

export function AgentRegistryProvider({ children }: Props) {
  const { clients, activeClients } = useMcp();
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [config, setConfig] = useState<LiveConfig>({
    model: "models/gemini-2.0-flash-exp",
    generationConfig: {
      responseModalities: "audio",
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
      },
    },
    systemInstruction: {
      parts: [{ text: "test" }],
    },
    tools: [{ googleSearch: {} }],
  });
  const [prompt, setPrompt] = useState<PromptPost>({
    instruction: {
      static: "",
      state: "{{conversation.history}}",
      dynamic: "{{audio}}",
    },
    input: {
      name: "Input Schema",
      description: "An audio input schema",
      type: ["audio"],
      reference: [],
    },
    output: {
      name: "Output schema",
      description: "An audio output schema",
      type: ["audio"],
      reference: [],
    },
    metadata: {
      title: "",
      description: "",
      tag: [""],
      log_message: "Created a new research analysis",
    },
  });

  // Load agents
  const loadAgents = useCallback(async () => {
    try {
      const config = await readAgentConfig();
      const agentsWithConfig = (config.agents || []).map(
        (
          agent: Omit<AgentConfig, "config"> & {
            config?: AgentConfig["config"];
          }
        ) => ({
          ...agent,
          config: agent.config || defaultConfig,
        })
      );
      setAgents(agentsWithConfig);
      if (!activeAgent && agentsWithConfig.length > 0) {
        setActiveAgent(agentsWithConfig[0].name);
      }
    } catch (error) {
      console.error("Failed to load agent configuration:", error);
      setAgents([]);
      throw error;
    }
  }, [activeAgent]);

  // Update config and prompt when active agent changes
  useEffect(() => {
    if (activeAgent) {
      const agent = agents.find((a) => a.name === activeAgent);
      if (agent) {
        setConfig((prevConfig) => ({
          ...prevConfig,
          ...agent.config,
          systemInstruction: {
            parts: [
              {
                text: agent.instruction,
              },
              {
                text: `The resources you have available are: ${JSON.stringify(
                  resources,
                  null,
                  2
                )}`,
              },
              {
                text: `The tools you have available are: ${JSON.stringify(
                  tools,
                  null,
                  2
                )}`,
              },
            ],
          },
        }));

        setPrompt((prev) => ({
          ...prev,
          instruction: {
            ...prev.instruction,
            static: agent.instruction,
          },
          metadata: {
            ...prev.metadata,
            title: agent.name,
            description: agent.description,
          },
        }));
      }
    }
  }, [activeAgent, agents, resources, tools]);

  // Update tools and resources from MCP
  useEffect(() => {
    const allTools = activeClients.reduce<Tool[]>((acc, clientId) => {
      const client = clients[clientId];
      if (client?.tools) {
        return [...acc, ...client.tools];
      }
      return acc;
    }, []);
    setTools(allTools);
    setConfig((prevConfig) => {
      const parsedTools = mapToolsToGeminiFormat(allTools);
      return {
        ...prevConfig,
        tools: [
          {
            googleSearch: {},
            functionDeclarations: parsedTools,
          },
        ],
      };
    });

    const allResources = activeClients.reduce<Resource[]>((acc, clientId) => {
      const client = clients[clientId];
      if (client?.resources) {
        return [...acc, ...client.resources];
      }
      return acc;
    }, []);
    setResources(allResources);
  }, [clients, activeClients]);

  useEffect(() => {
    loadAgents().catch(console.error);
  }, [loadAgents]);

  const saveAgent = useCallback(
    async (agent: AgentConfig) => {
      try {
        console.log("Saving agent:", agent.name);
        const newAgents = agents.filter((a) => a.name !== agent.name);
        newAgents.push(agent);
        await writeAgentConfig({ agents: newAgents });
        setAgents(newAgents);
        console.log("Agent saved successfully");
      } catch (error) {
        console.error("Failed to save agent:", error);
        throw error;
      }
    },
    [agents]
  );

  const deleteAgent = useCallback(
    async (agentName: string) => {
      try {
        console.log("Deleting agent:", agentName);
        const newAgents = agents.filter((a) => a.name !== agentName);
        await writeAgentConfig({ agents: newAgents });
        setAgents(newAgents);
        console.log("Agent deleted successfully");
      } catch (error) {
        console.error("Failed to delete agent:", error);
        throw error;
      }
    },
    [agents]
  );

  const getAgent = useCallback(
    (agentName: string) => {
      return agents.find((a) => a.name === agentName) || null;
    },
    [agents]
  );

  return (
    <AgentRegistryContext.Provider
      value={{
        agents,
        activeAgent,
        loadAgents,
        saveAgent,
        deleteAgent,
        getAgent,
        setActiveAgent,
        tools,
        setTools,
        resources,
        setResources,
        prompt,
        config,
      }}
    >
      {children}
    </AgentRegistryContext.Provider>
  );
}

export function useAgentRegistry() {
  const context = useContext(AgentRegistryContext);
  if (!context) {
    throw new Error(
      "useAgentRegistry must be used within an AgentRegistryProvider"
    );
  }
  return context;
}
