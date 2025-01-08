import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";

export interface ConnectButtonProps {
  isConnected: boolean;
  isConnecting?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  connectMessage?: string;
  disconnectMessage?: string;
  connectingMessage?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function ConnectButton({
  isConnected,
  isConnecting = false,
  onConnect,
  onDisconnect,
  connectMessage = "Connect",
  disconnectMessage = "Connected",
  connectingMessage = "Connecting",
  size = "md",
  className = "",
  disabled = false,
  hasError = false,
}: ConnectButtonProps) {
  const getTypeStyles = () => {
    if (isConnecting) return "bg-default-50/50 border-default-200";
    if (hasError)
      return "bg-danger-50/50 border-danger-200 hover:bg-danger-100/50";
    if (isConnected)
      return "bg-success-50/50 border-success-200 hover:bg-success-100/50";
    return "bg-default-50/50 border-default-200 hover:bg-default-100/50";
  };

  const getIcon = () => {
    if (isConnecting) return "solar:refresh-circle-line-duotone";
    if (hasError) return "solar:shield-warning-line-duotone";
    if (isConnected) return "solar:shield-check-line-duotone";
    return "solar:power-line-duotone";
  };

  const getIconColor = () => {
    if (isConnecting) return "#f6933c";
    if (hasError) return "var(--danger)";
    if (isConnected) return "var(--success)";
    return "#f6933c";
  };

  const getMessage = () => {
    if (isConnecting) return connectingMessage;
    if (hasError) return "Error";
    if (isConnected) return disconnectMessage;
    return connectMessage;
  };

  const getStatusDot = () => {
    if (hasError) return "bg-danger-500";
    if (isConnected) return "bg-success-500 animate-pulse";
    return "bg-default-500";
  };

  return (
    <Button
      variant="bordered"
      size={size}
      className={`
        group transition-all duration-200 min-w-[140px] h-12 px-4
        border rounded-xl
        ${getTypeStyles()}
        ${className}
      `}
      onClick={isConnected ? onDisconnect : onConnect}
      disabled={disabled || isConnecting}
      startContent={
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
          <Icon
            icon={getIcon()}
            width={24}
            className={`flex-none ${isConnecting ? "animate-spin" : ""}`}
            color={getIconColor()}
          />
        </div>
      }
    >
      {getMessage()}
    </Button>
  );
}
