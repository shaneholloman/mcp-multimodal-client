import { Icon } from "@iconify/react";

export interface StatusIndicatorProps {
  type?: "success" | "warning" | "danger" | "default";
  title: string;
  description?: string;
  icon?: string;
  className?: string;
}

export function StatusIndicator({
  type = "default",
  title,
  description = "",
  icon,
  className = "",
}: StatusIndicatorProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: icon || "solar:shield-check-line-duotone",
          iconClass: "text-success",
          bgClass: "bg-success-50/50",
        };
      case "warning":
        return {
          icon: icon || "solar:shield-warning-line-duotone",
          iconClass: "text-warning",
          bgClass: "bg-warning-50/50",
        };
      case "danger":
        return {
          icon: icon || "solar:shield-warning-line-duotone",
          iconClass: "text-danger",
          bgClass: "bg-danger-50/50",
        };
      default:
        return {
          icon: icon || "solar:shield-minimalistic-line-duotone",
          iconClass: "text-default-400",
          bgClass: "bg-default-50",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      data-testid={`status-container-${type}`}
      className={`flex items-center gap-3 p-4 rounded-xl border border-default-200 ${styles.bgClass} ${className}`}
    >
      <Icon
        data-testid={`status-icon-${type}`}
        icon={styles.icon}
        width={24}
        className="flex-none"
        color={type === "default" ? "#f6933c" : undefined}
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-default-500">{description}</p>
        )}
      </div>
    </div>
  );
}
