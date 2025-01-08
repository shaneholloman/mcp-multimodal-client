import { Card } from "@nextui-org/react";
import { useMcp } from "@/contexts/McpContext";
import { CollapsibleSection } from "@/components/Layout/CollapsibleSection";
import { ToolCard } from "@/components/Card";
import { isCodeExecutionTool, isGoogleSearchTool } from "../../types";
import { useAgentRegistry } from "@/features/agent-registry";

export function ConfigCard() {
  const { config } = useAgentRegistry();
  const { clients, activeClients } = useMcp();

  const mcpTools = activeClients.flatMap((serverId) => {
    const clientState = clients[serverId];
    return (clientState?.tools || []).map((tool) => ({
      ...tool,
      serverId,
    }));
  });

  const mcpToolsByServer = mcpTools.reduce((acc, tool) => {
    const serverId = tool.serverId;
    if (!acc[serverId]) {
      acc[serverId] = [];
    }
    acc[serverId].push(tool);
    return acc;
  }, {} as Record<string, typeof mcpTools>);

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-4">
        <CollapsibleSection title="Configuration">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-default-500">Model</p>
              <p className="font-medium">{config.model}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-default-500">Response Type</p>
              <p className="font-medium">
                {config.generationConfig?.responseModalities || "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-default-500">Voice</p>
              <p className="font-medium">
                {config.generationConfig?.speechConfig?.voiceConfig
                  ?.prebuiltVoiceConfig?.voiceName || "Not set"}
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Available Tools">
          <div className="space-y-6">
            {config.tools && config.tools.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-default-500">
                  Built-in Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {config.tools.map((tool, index) => {
                    let name = "Unknown Tool";
                    let type = "";

                    if (isGoogleSearchTool(tool)) {
                      name = "Google Search";
                      type = "Search";
                    } else if (isCodeExecutionTool(tool)) {
                      name = "Code Execution";
                      type = "Code";
                    } else if (
                      "functionDeclarations" in tool &&
                      tool.functionDeclarations
                    ) {
                      return tool.functionDeclarations.map(
                        (func, funcIndex) => (
                          <ToolCard
                            key={`func-${index}-${funcIndex}`}
                            name={func.name}
                            description={func.description}
                            type="Function"
                          />
                        )
                      );
                    }

                    return (
                      <ToolCard
                        key={`builtin-${index}`}
                        name={name}
                        type={type}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* MCP Server Tools */}
            {Object.entries(mcpToolsByServer).map(([serverId, tools]) => (
              <div key={serverId} className="space-y-2">
                <h3 className="text-sm font-medium text-default-500">
                  {serverId.charAt(0).toUpperCase() + serverId.slice(1)} Server
                  Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tools.map((tool, index) => (
                    <ToolCard
                      key={`${serverId}-${index}`}
                      name={tool.name}
                      description={tool.description}
                      type="MCP"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* System Instructions */}
        <CollapsibleSection title="System Instructions" defaultExpanded={false}>
          <div className="prose prose-sm max-w-none">
            <div className="font-mono text-sm whitespace-pre-wrap bg-default-50 p-3 rounded-lg border border-default-200">
              {config.systemInstruction?.parts[0]?.text ||
                "No system instructions set"}
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </Card>
  );
}

export default ConfigCard;
