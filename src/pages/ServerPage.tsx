import { useParams } from "react-router-dom";
import { useMcp } from "@/contexts/McpContext";
import { ServerPageContent } from "@/features/server/components/ServerPageContent";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";

export function ServerPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const { clients } = useMcp();

  if (!serverId) {
    return (
      <div className="container mx-auto p-4">
        <StatusIndicator
          type="danger"
          title="Server Not Found"
          description="Please provide a valid server ID."
        />
      </div>
    );
  }

  const clientState = clients[serverId];
  const serverName = clientState?.serverInfo?.name || serverId;

  return <ServerPageContent serverId={serverId} serverName={serverName} />;
}
