import { Button, ButtonProps, Tooltip } from "@nextui-org/react";
import { Icon } from "@iconify/react";

export type FeatureType =
  | "tools"
  | "prompts"
  | "resources"
  | "logging"
  | "experimental";

const FEATURE_ICONS: Record<FeatureType, string> = {
  tools: "solar:widget-2-line-duotone",
  prompts: "solar:chat-square-code-line-duotone",
  resources: "solar:folder-with-files-line-duotone",
  logging: "solar:notebook-line-duotone",
  experimental: "solar:test-tube-line-duotone",
};

const FEATURE_STYLES: Record<
  FeatureType,
  {
    border: string;
    hover: string;
    icon: string;
  }
> = {
  tools: {
    border: "border-orange-200",
    hover: "hover:bg-orange-100/10",
    icon: "#f6933c",
  },
  prompts: {
    border: "border-orange-200",
    hover: "hover:bg-orange-100/10",
    icon: "#f6933c",
  },
  resources: {
    border: "border-orange-200",
    hover: "hover:bg-orange-100/10",
    icon: "#f6933c",
  },
  logging: {
    border: "border-primary-200",
    hover: "hover:bg-primary-100/10",
    icon: "var(--primary-600)",
  },
  experimental: {
    border: "border-warning-200",
    hover: "hover:bg-warning-100/10",
    icon: "var(--warning-600)",
  },
};

export interface FeatureChipProps extends Omit<Partial<ButtonProps>, "type"> {
  label: string;
  type: FeatureType;
  description?: string;
  isSubFeature?: boolean;
}

export function FeatureChip({
  label,
  type,
  description,
  isSubFeature = false,
  className = "",
  ...props
}: FeatureChipProps) {
  const icon = FEATURE_ICONS[type];
  const styles = FEATURE_STYLES[type];
  const displayText = label.split(".").pop() || "";

  const chipContent = (
    <Button
      variant="bordered"
      size="sm"
      className={`
        group
        transition-all
        duration-200
        ${styles.border}
        ${styles.hover}
        ${isSubFeature ? "min-w-[100px] h-8 px-3" : "min-w-[120px] h-9"}
        border
        rounded-xl
        bg-transparent
        backdrop-blur-sm
        ${className}
      `}
      startContent={
        <div className="flex items-center pl-2">
          {!isSubFeature && (
            <Icon
              icon={icon}
              width={20}
              height={20}
              style={{ color: styles.icon }}
            />
          )}
        </div>
      }
      {...props}
    >
      <span className="pr-2">{displayText}</span>
    </Button>
  );

  if (description) {
    return (
      <Tooltip
        content={description}
        placement="top"
        showArrow
        delay={0}
        closeDelay={0}
        motionProps={{
          variants: {
            exit: {
              opacity: 0,
              transition: {
                duration: 0.1,
                ease: "easeIn",
              },
            },
            enter: {
              opacity: 1,
              transition: {
                duration: 0.15,
                ease: "easeOut",
              },
            },
          },
        }}
        classNames={{
          content: "text-sm py-2 px-3 font-medium",
          base: "shadow-xl bg-background/80 backdrop-blur-md",
        }}
      >
        {chipContent}
      </Tooltip>
    );
  }

  return chipContent;
}
