import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { BaseCard } from "@/components/Card";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { ToolCard } from "@/components/Card";
import { RefreshButton, Button, ExecuteButton } from "@/components/Button";
import { ExecutionHistoryCard } from "@/components/Card/ExecutionHistoryCard";
import { useLogStore } from "@/stores/log-store";

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { addLog } = useLogStore();

  if (!hasListResourcesCapability) {
    return null;
  }

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    onOpen();
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
      onClose();
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
          <RefreshButton onPress={onFetchResources} loading={isLoading} />
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

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon
                    icon="solar:book-line-duotone"
                    className="h-5 w-5 text-primary"
                  />
                  <div className="flex flex-col gap-1">
                    <span>Read Resource: {selectedResource?.name}</span>
                    {selectedResource?.description && (
                      <span className="text-sm text-default-500">
                        {selectedResource.description}
                      </span>
                    )}
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to read this resource?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <ExecuteButton
                  onPress={handleResourceRead}
                  loading={isExecuting}
                  label="Read"
                  loadingLabel="Reading..."
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </BaseCard>
  );
}
