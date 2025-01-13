import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./types";
import { cn } from "@nextui-org/react";

interface SidebarProps {
  isCompact?: boolean;
  items: SidebarSection[];
  defaultSelectedKey?: string;
  onItemClick?: (href: string | undefined) => void;
}

export default function Sidebar({
  isCompact = false,
  items,
  defaultSelectedKey,
  onItemClick,
}: SidebarProps) {
  return (
    <nav
      className={cn("flex flex-col gap-4", {
        "max-w-[52px]": isCompact,
        "w-full": !isCompact,
      })}
    >
      {items.map((section) => (
        <div key={section.title} className="flex flex-col gap-2 w-full">
          {!isCompact && (
            <h2 className="text-small font-medium text-default-600">
              {section.title}
            </h2>
          )}
          <div className="flex flex-col gap-1 w-full">
            {section.items.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                isCompact={isCompact}
                isSelected={item.key === defaultSelectedKey}
                onPress={() => {
                  onItemClick?.(item.href);
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
