import { Button, Tooltip, cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { SidebarItem as SidebarItemType } from "./types";

const colorMap = {
  success: "#17c964",
  warning: "#f5a524",
  primary: "#f6933c",
  secondary: "#7e868c",
} as const;

interface SidebarItemProps {
  item: SidebarItemType;
  isCompact?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

export function SidebarItem({
  item,
  isCompact = false,
  isSelected = false,
  onPress,
}: SidebarItemProps) {
  if (!item.icon) {
    console.warn("No icon provided for item:", item);
  }

  const buttonContent = (
    <Button
      className={cn("h-12 justify-start gap-2 rounded-lg hover:bg-content2", {
        "min-w-0 w-[48px] justify-center p-0": isCompact,
        "w-full px-4": !isCompact,
        "bg-content2": isSelected,
      })}
      onPress={() => {
        onPress?.();
      }}
      variant="light"
      aria-label={isCompact && item.description ? item.description : undefined}
    >
      {item.icon && (
        <Icon
          className="flex-none"
          icon={item.icon}
          width={24}
          height={24}
          color={item.color ? colorMap[item.color] : colorMap.secondary}
          data-testid="sidebar-item-icon"
        />
      )}
      {!isCompact && <span className="truncate text-small">{item.label}</span>}
    </Button>
  );

  if (isCompact && item.description) {
    return (
      <Tooltip content={item.description} placement="right" showArrow>
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
}
