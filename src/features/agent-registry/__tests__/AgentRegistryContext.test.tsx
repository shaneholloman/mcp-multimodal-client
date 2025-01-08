import { renderHook, act, waitFor } from "@testing-library/react";
import {
  AgentRegistryProvider,
  useAgentRegistry,
} from "../contexts/AgentRegistryContext";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AgentConfig } from "../lib/types";
import { writeAgentConfig, readAgentConfig } from "@/utils/config";
import { useMcp } from "@/contexts/McpContext";
import type { McpContextType } from "@/contexts/McpContext.types";

vi.mock("@/utils/config", () => ({
  writeAgentConfig: vi.fn(),
  readAgentConfig: vi.fn(),
}));

vi.mock("@/contexts/McpContext", () => ({
  useMcp: vi.fn(),
}));

describe("AgentRegistryContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockMcpContext: McpContextType = {
      clients: {},
      activeClients: [],
      connectServer: vi.fn(),
      disconnectServer: vi.fn(),
      selectPrompt: vi.fn(),
      executePrompt: vi.fn(),
      listResources: vi.fn(),
      listPrompts: vi.fn(),
      listTools: vi.fn(),
      executeTool: vi.fn(),
      readResource: vi.fn(),
    };
    vi.mocked(useMcp).mockReturnValue(mockMcpContext);
  });

  it("should save new agent", async () => {
    const mockAgents: AgentConfig[] = [
      {
        name: "TestAgent1",
        description: "Test agent 1",
        instruction: "Test instruction 1",
        knowledge: "Test knowledge 1",
        config: {
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
        },
        dependencies: [],
        tools: [],
        voice: "Kore",
      },
    ];

    const newAgent: AgentConfig = {
      name: "NewAgent",
      description: "New agent",
      instruction: "New instruction",
      knowledge: "New knowledge",
      config: {
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
      },
      dependencies: [],
      tools: [],
      voice: "Kore",
    };

    vi.mocked(readAgentConfig).mockResolvedValue({ agents: mockAgents });

    const { result } = renderHook(() => useAgentRegistry(), {
      wrapper: ({ children }) => (
        <AgentRegistryProvider>{children}</AgentRegistryProvider>
      ),
    });

    // Wait for initial agents to load
    await waitFor(() => {
      expect(result.current.agents).toEqual(mockAgents);
    });

    // Save new agent
    await act(async () => {
      await result.current.saveAgent(newAgent);
    });

    expect(writeAgentConfig).toHaveBeenCalledWith({
      agents: [mockAgents[0], newAgent],
    });

    expect(result.current.agents).toEqual([mockAgents[0], newAgent]);
  });

  it("should handle multiple agents", async () => {
    const mockAgents: AgentConfig[] = [
      {
        name: "TestAgent1",
        description: "Test agent 1",
        instruction: "Test instruction 1",
        knowledge: "Test knowledge 1",
        config: {
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
        },
        dependencies: [],
        tools: [],
        voice: "Kore",
      },
    ];

    const additionalAgent: AgentConfig = {
      name: "TestAgent2",
      description: "Test agent 2",
      instruction: "Test instruction 2",
      knowledge: "Test knowledge 2",
      config: {
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
      },
      dependencies: [],
      tools: [],
      voice: "Kore",
    };

    vi.mocked(readAgentConfig).mockResolvedValue({ agents: mockAgents });

    const { result } = renderHook(() => useAgentRegistry(), {
      wrapper: ({ children }) => (
        <AgentRegistryProvider>{children}</AgentRegistryProvider>
      ),
    });

    // Wait for initial agents to load
    await waitFor(() => {
      expect(result.current.agents).toEqual(mockAgents);
    });

    // Add additional agent
    await act(async () => {
      await result.current.saveAgent(additionalAgent);
    });

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2);
      expect(result.current.agents).toEqual([mockAgents[0], additionalAgent]);
    });
  });
});
