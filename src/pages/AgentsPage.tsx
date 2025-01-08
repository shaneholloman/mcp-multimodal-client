import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAgentRegistry, AgentConfig } from "@/features/agent-registry";

export default function AgentsPage() {
  const { agents, loadAgents } = useAgentRegistry();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        await loadAgents();
      } catch (err) {
        console.error("Failed to load agents:", err);
        setError("Failed to load agents");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [loadAgents]);

  const handleCreateAgent = () => {
    navigate("/agent/create");
  };

  const handleExecuteAgent = (agent: AgentConfig) => {
    navigate(`/agent/${agent.name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Button
          color="primary"
          startContent={<Icon icon="solar:add-circle-line-duotone" />}
          onPress={handleCreateAgent}
        >
          Create Agent
        </Button>
      </div>

      {error ? (
        <Card className="bg-danger-50">
          <CardBody>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      ) : agents.length === 0 ? (
        <Card className="bg-default-50">
          <CardBody className="text-center py-8">
            <Icon
              icon="solar:user-rounded-line-duotone"
              className="w-12 h-12 mx-auto mb-4 text-default-400"
            />
            <p className="text-default-600">No agents available</p>
            <p className="text-small text-default-400">
              Create your first agent to get started
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card
              key={agent.name}
              isPressable
              onPress={() => handleExecuteAgent(agent)}
              className="hover:scale-[1.02] transition-transform"
            >
              <CardHeader className="flex gap-3">
                <Icon
                  icon="solar:bot-line-duotone"
                  className="w-8 h-8 text-primary"
                />
                <div className="flex flex-col flex-1">
                  <p className="text-md font-semibold">{agent.name}</p>
                  <p className="text-small text-default-400">
                    {agent.description}
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1">
                    {agent.dependencies.map((dep) => (
                      <Chip key={dep} size="sm" variant="flat">
                        {dep}
                      </Chip>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-small text-default-400">
                    <Icon icon="solar:widget-line-duotone" />
                    <span>{agent.tools.length} tools</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
