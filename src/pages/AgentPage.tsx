import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, Input, Textarea, Button, Checkbox } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useAgentRegistry } from "@/features/agent-registry";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export default function AgentPage() {
  const navigate = useNavigate();
  const { saveAgent, tools: availableTools } = useAgentRegistry();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instruction, setInstruction] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [voice, setVoice] = useState("");
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [nameError, setNameError] = useState<string>("");

  const handleSave = async () => {
    if (!name) {
      setNameError("Name is required");
      return;
    }
    setNameError("");

    try {
      await saveAgent({
        name,
        description,
        instruction,
        knowledge,
        voice,
        tools: selectedTools.map((tool) => ({
          name: tool.name,
          description: tool.description || "",
          parameters: (tool.parameters as Record<string, unknown>) || {},
        })),
        dependencies: [],
        config: {
          model: "models/gemini-2.0-flash-exp",
          generationConfig: {
            responseModalities: "audio",
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Kore",
                },
              },
            },
          },
        },
      });
      navigate("/");
    } catch (error) {
      console.error("Failed to save agent:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Agent</h1>
        <Button
          color="default"
          variant="light"
          startContent={<Icon icon="solar:arrow-left-line-duotone" />}
          onPress={() => navigate("/")}
        >
          Back
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="flex flex-col gap-6"
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="flex flex-col gap-4">
            <Input
              label="Name"
              placeholder="Enter agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              errorMessage={nameError}
              isInvalid={!!nameError}
            />
            <Input
              label="Description"
              placeholder="Enter agent description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Textarea
              label="Instruction"
              placeholder="Enter agent instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <Textarea
              label="Knowledge"
              placeholder="Enter agent knowledge"
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
            />
            <Input
              label="Voice"
              placeholder="Enter agent voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tools</h2>
          <div className="flex flex-col gap-4">
            {availableTools.map((tool) => (
              <Checkbox
                key={tool.name}
                isSelected={selectedTools.some((t) => t.name === tool.name)}
                onChange={() => {
                  const isSelected = selectedTools.some(
                    (t) => t.name === tool.name
                  );
                  if (isSelected) {
                    setSelectedTools(
                      selectedTools.filter((t) => t.name !== tool.name)
                    );
                  } else {
                    setSelectedTools([...selectedTools, tool]);
                  }
                }}
              >
                <div className="flex flex-col">
                  <span className="text-small font-medium">{tool.name}</span>
                  <span className="text-tiny text-default-400">
                    {tool.description}
                  </span>
                </div>
              </Checkbox>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-primary-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Save Agent Configuration
              </h3>
              <p className="text-small text-default-500">
                Save your agent configuration to make it available for use
              </p>
            </div>
            <Button
              color="primary"
              size="lg"
              onClick={handleSave}
              className="px-8"
            >
              Save Agent
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
