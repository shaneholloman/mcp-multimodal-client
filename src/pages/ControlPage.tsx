import { Spinner } from "@nextui-org/react";
import { useMcpData } from "../contexts/McpDataContext";
import { UserInfoCard } from "../components/Card/UserInfoCard";
import { McpServerCard } from "../components/Card/McpServerCard";
import { AvailableServerCard } from "../components/Card/AvailableServerCard";
import { StatusCard } from "../components/Card/StatusCard";
import { ThreeColumnLayout, GridLayout } from "../components/Layout/GridLayout";
import { Card, CardBody } from "@nextui-org/react";

export default function ControlPage() {
  const { user, mcpData, isLoading, error } = useMcpData();

  console.log("ControlPage render:", { user, mcpData, isLoading, error });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.error("ControlPage error:", error);
    return (
      <div className="p-6">
        <StatusCard
          status="danger"
          title="Error Loading Data"
          description={error.message}
          icon="solar:shield-warning-bold-duotone"
        />
      </div>
    );
  }

  if (!user || !mcpData) {
    console.warn("ControlPage: Missing data:", { user, mcpData });
    return (
      <div className="p-6">
        <StatusCard
          status="warning"
          title="No Data Available"
          description="Unable to load MCP data. Please try again later."
          icon="solar:shield-warning-bold-duotone"
        />
      </div>
    );
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(user.api_key);
  };

  const activeServers = Object.entries(mcpData.mcpServers);
  const installedServerIds = new Set(Object.keys(mcpData.mcpServers));

  // Sort available servers: installed first, then alphabetically
  const availableServers = Object.entries(mcpData.available).sort(
    ([keyA], [keyB]) => {
      const isInstalledA = installedServerIds.has(keyA);
      const isInstalledB = installedServerIds.has(keyB);
      if (isInstalledA === isInstalledB) {
        return keyA.localeCompare(keyB);
      }
      return isInstalledA ? -1 : 1;
    }
  );
  return (
    <div className="flex flex-col space-y-6">
      {/* Full-width header section */}
      <div className="w-full bg-default-50 border-b border-divider">
        <div className="max-w-[1400px] mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            MCP Control Center
          </h1>
          <UserInfoCard
            userId={user.user.name}
            email={user.user.email}
            apiKey={user.api_key}
            roles={user.user.roles}
            onCopyApiKey={handleCopyApiKey}
          />
        </div>
      </div>

      {/* Cards section */}
      <div className="max-w-[1400px] mx-auto w-full px-6 space-y-6">
        <Card>
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Active Servers</h2>
              <span className="text-default-500">
                {activeServers.length} servers running
              </span>
            </div>
            {activeServers.length === 0 ? (
              <StatusCard
                status="warning"
                title="No Active Servers"
                description="There are currently no active MCP servers."
                icon="solar:server-square-line-duotone"
              />
            ) : (
              <>
                {activeServers.map(([key, server]) => {
                  const availableInfo = mcpData.available[key];
                  return (
                    <McpServerCard
                      key={key}
                      serverId={key}
                      command={server.command}
                      args={server.args}
                      env={server.env}
                      additionalInfo={
                        availableInfo
                          ? {
                              title: availableInfo.title,
                              description: availableInfo.description,
                              content: availableInfo.content,
                              github_link: availableInfo.github_link,
                              npm_link: availableInfo.npm_link,
                              environment_variables:
                                availableInfo.environment_variables,
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Available Servers</h2>
              <span className="text-default-500">
                {availableServers.length} servers available
              </span>
            </div>
            {availableServers.length === 0 ? (
              <StatusCard
                status="warning"
                title="No Available Servers"
                description="There are currently no available MCP servers."
                icon="solar:server-square-line-duotone"
              />
            ) : (
              <GridLayout
                cols={1}
                gap={4}
                responsive={{
                  md: { cols: 2 },
                  lg: { cols: 3 },
                }}
              >
                {availableServers.map(([key, server]) => (
                  <AvailableServerCard
                    key={key}
                    title={server.title}
                    description={server.description}
                    icon={server.icon}
                    environmentVariables={server.environment_variables}
                    githubLink={server.github_link}
                    npmLink={server.npm_link}
                    isInstalled={installedServerIds.has(key)}
                  />
                ))}
              </GridLayout>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
