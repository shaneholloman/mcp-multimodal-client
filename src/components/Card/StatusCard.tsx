import { BaseCard, BaseCardProps } from "./BaseCard";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";

export type StatusType = "success" | "warning" | "danger" | "default";

interface StatusCardProps extends Omit<BaseCardProps, "children"> {
  status: StatusType;
  title: string;
  description?: string;
  icon?: string;
  statusIcon?: string;
  details?: Array<{
    label: string;
    value: string;
  }>;
}

export function StatusCard({
  status,
  title,
  description,
  icon = "solar:monitor-smartphone-line-duotone",
  statusIcon,
  details,
  ...props
}: StatusCardProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "danger":
        return "text-danger";
      default:
        return "text-default-400";
    }
  };

  const getStatusDot = (status: StatusType) => {
    switch (status) {
      case "success":
        return "bg-success-500";
      case "warning":
        return "bg-warning-500";
      case "danger":
        return "bg-danger-500";
      default:
        return "bg-default-400";
    }
  };

  return (
    <BaseCard
      icon={icon}
      iconClassName={getStatusColor(status)}
      headerAction={
        <div className={`h-2 w-2 rounded-full ${getStatusDot(status)}`} />
      }
      {...props}
    >
      <div className="space-y-4">
        <StatusIndicator
          type={status}
          title={title}
          description={description}
          icon={statusIcon}
        />
        {details && details.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {details.map(({ label, value }) => (
              <div
                key={label}
                className="p-2.5 rounded-lg border bg-default-50 border-default-200"
              >
                <div className="text-sm text-default-500">{label}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseCard>
  );
}
