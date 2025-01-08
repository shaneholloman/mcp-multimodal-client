import { BaseCard } from "@/components/Card/BaseCard";
import { ConnectButton } from "@/components/Button";

interface ServerHeaderProps {
  serverName: string;
  serverId: string;
  isConnected: boolean;
  isConnecting: boolean;
  hasError: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ServerHeader({
  serverName,
  serverId,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
}: ServerHeaderProps) {
  return (
    <BaseCard
      icon="solar:server-line-duotone"
      iconClassName={`text-2xl ${
        isConnected ? "text-primary" : "text-default-400"
      }`}
      iconTestId={`server-icon-${isConnected ? "connected" : "disconnected"}`}
      title={
        <div className="flex flex-col gap-2 py-1">
          <h1 className="text-2xl font-bold tracking-tight">{serverName}</h1>
          <p className="text-sm text-default-500">
            Server ID:{" "}
            <code className="text-primary bg-primary-50/30 px-3 py-1 rounded-md font-mono">
              {serverId}
            </code>
          </p>
        </div>
      }
      headerAction={
        <div className="flex items-center">
          <ConnectButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            connectMessage="Connect"
            disconnectMessage="Disconnect"
            connectingMessage="..."
            size="sm"
            className="min-w-[120px]"
            disabled={isConnecting}
          />
        </div>
      }
      className="w-full"
    />
  );
}
