import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useMcp } from "@/contexts/McpContext";
import type { McpClientState } from "@/contexts/McpContext.types";
import { useLiveAPI } from "../features/multimodal-agent/hooks/use-live-api";
import { useAgentRegistry, AgentConfig } from "@/features/agent-registry";

export default function AgentExecutePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAgent } = useAgentRegistry();
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [executing, setExecuting] = useState(false);
  const { clients } = useMcp();
  const { executeToolAction } = useLiveAPI({ url: "" }); // TODO: Get URL from config

  useEffect(() => {
    const loadAgent = async () => {
      try {
        if (!id) {
          setError("No agent ID provided");
          return;
        }

        const foundAgent = getAgent(id);
        if (foundAgent) {
          setAgent(foundAgent);
        } else {
          setError("Agent not found");
        }
      } catch (err) {
        console.error("Failed to load agent:", err);
        setError("Failed to load agent");
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [id, getAgent]);

  const handleBack = () => {
    navigate("/");
  };

  const handleExecute = async () => {
    if (!agent || !userInput.trim() || !executeToolAction) return;

    setExecuting(true);
    try {
      // Type-safe access to clients
      const clientsMap: Record<string, McpClientState> = clients;

      // Check if all required clients are connected
      const missingClients = agent.dependencies.filter((dep) => {
        const client = clientsMap[dep];
        return !client || client.connectionStatus !== "connected";
      });

      if (missingClients.length > 0) {
        throw new Error(
          `Missing required clients: ${missingClients.join(", ")}`
        );
      }

      // Execute the agent's instruction with the user input
      await executeToolAction("execute_agent", {
        name: agent.name,
        input: userInput,
      });

      setUserInput("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to execute agent"
      );
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!agent) {
    return (
      <Card className="m-6 bg-danger-50">
        <CardBody>
          <p className="text-danger">{error || "Agent not found"}</p>
          <Button
            color="primary"
            variant="light"
            startContent={<Icon icon="solar:arrow-left-line-duotone" />}
            onPress={handleBack}
            className="mt-4"
          >
            Back to Agents
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={handleBack}
          className="text-2xl"
        >
          <Icon icon="solar:arrow-left-line-duotone" />
        </Button>
        <h1 className="text-2xl font-bold">{agent.name}</h1>
      </div>

      <Card>
        <CardHeader className="flex gap-3">
          <Icon
            icon="solar:bot-line-duotone"
            className="w-8 h-8 text-primary"
          />
          <div className="flex flex-col">
            <p className="text-md">{agent.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.dependencies.map((dep) => (
                <Chip
                  key={dep}
                  size="sm"
                  color={
                    clients[dep]?.connectionStatus === "connected"
                      ? "success"
                      : "danger"
                  }
                  variant="flat"
                >
                  {dep}
                </Chip>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-small font-medium mb-1">Instruction</h3>
              <p className="text-default-500">{agent.instruction}</p>
            </div>
            <div>
              <h3 className="text-small font-medium mb-1">Knowledge</h3>
              <p className="text-default-500">{agent.knowledge}</p>
            </div>
            <div>
              <h3 className="text-small font-medium mb-1">Tools</h3>
              <div className="flex flex-wrap gap-1">
                {agent.tools.map((tool) => (
                  <Chip key={tool.name} size="sm" variant="flat">
                    {tool.name}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4">
            <Textarea
              label="Your Input"
              placeholder="Enter your message for the agent..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              minRows={3}
            />
            <div className="flex justify-end">
              <Button
                color="primary"
                isLoading={executing}
                onPress={handleExecute}
                isDisabled={!userInput.trim()}
              >
                Execute
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {error && (
        <Card className="bg-danger-50">
          <CardBody>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
