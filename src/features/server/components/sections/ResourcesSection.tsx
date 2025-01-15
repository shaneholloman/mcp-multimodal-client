import { useState } from "react";
import { Tooltip } from "@nextui-org/react";
import { BaseCard } from "@/components/Card";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { ToolCard } from "@/components/Card";
import { RefreshButton } from "@/components/Button";
import { ExecutionHistoryCard } from "@/components/Card/ExecutionHistoryCard";
import { useLogStore } from "@/stores/log-store";
import { ContentModal } from "@/components/Modal/ContentModal";

interface Resource {
  name: string;
  description?: string;
  type?: string;
  uri: string;
}

interface ResourcesSectionProps {
  resources: Resource[];
  onReadResource: (resourceUri: string) => Promise<unknown>;
  isLoading: boolean;
  onFetchResources?: () => Promise<void>;
  hasListResourcesCapability: boolean;
  error: boolean;
}

export function ResourcesSection({
  resources,
  onReadResource,
  isLoading,
  onFetchResources,
  hasListResourcesCapability,
  error,
}: ResourcesSectionProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { addLog } = useLogStore();

  if (!hasListResourcesCapability) {
    return null;
  }

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsOpen(true);
  };

  const handleResourceRead = async () => {
    if (!selectedResource) return;
    setIsExecuting(true);

    try {
      const result = await onReadResource(selectedResource.uri);
      addLog({
        type: "system",
        operation: "Read Resource",
        status: "success",
        name: selectedResource.name,
        result,
      });
      setIsOpen(false);
      setSelectedResource(null);
    } catch (error) {
      addLog({
        type: "system",
        operation: "Read Resource",
        status: "error",
        name: selectedResource.name,
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <BaseCard
      icon="solar:library-line-duotone"
      title="Available Resources"
      subtitle={
        resources.length > 0
          ? `${resources.length} resource${
              resources.length === 1 ? "" : "s"
            } available`
          : "No resources loaded"
      }
      headerAction={
        <Tooltip content="Refresh available resources">
          <RefreshButton
            onPress={onFetchResources}
            loading={isLoading}
            aria-label="Refresh resources list"
          />
        </Tooltip>
      }
    >
      <div className="space-y-8">
        {error ? (
          <StatusIndicator
            type="danger"
            title="Connection Error"
            description="Failed to connect to server. Resources are unavailable."
            icon="solar:shield-warning-line-duotone"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3)
                .fill(null)
                .map((_, i) => <ToolCard key={i} isLoading />)
            ) : resources.length > 0 ? (
              resources.map((resource) => (
                <ToolCard
                  key={resource.name}
                  name={resource.name}
                  description={resource.description}
                  type={resource.type || "Resource"}
                  onExecute={() => handleResourceClick(resource)}
                  actionLabel="Read Resource"
                  aria-label={`Resource: ${resource.name}`}
                />
              ))
            ) : (
              <ToolCard
                isEmpty
                name="No Resources Available"
                description="Click refresh to load available resources"
                type="Empty"
              />
            )}
          </div>
        )}

        {!error && <ExecutionHistoryCard type="system" />}
      </div>

      <ContentModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedResource(null);
        }}
        title={selectedResource?.name || "Read Resource"}
        sections={[
          {
            title: "Confirm Action",
            content: "Are you sure you want to read this resource?",
          },
          ...(selectedResource?.description
            ? [
                {
                  title: "Description",
                  content: selectedResource.description,
                },
              ]
            : []),
        ]}
        primaryAction={{
          label: "Read",
          loadingLabel: "Reading...",
          onClick: handleResourceRead,
          isLoading: isExecuting,
        }}
      />
    </BaseCard>
  );
}
