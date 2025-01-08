import { ReactNode, useState } from "react";
import { useSidebarItems } from "../sidebar/sidebar-items";
import Sidebar from "../sidebar";
import ControlTray from "@/features/multimodal-agent/components/control-tray/ControlTray";
import { Icon } from "@iconify/react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sections, handleItemClick } = useSidebarItems();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside
        className={`relative flex h-full flex-col border-r-small border-divider bg-background/60 transition-all duration-200 ${
          isCollapsed ? "w-[68px] px-2 py-6" : "w-72 p-6"
        }`}
      >
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          {isCollapsed ? (
            <img
              src="/icon.svg"
              alt="Systemprompt icon"
              className="w-6 h-6 text-primary"
            />
          ) : (
            <img
              src="/logo.png"
              alt="Systemprompt logo"
              className="h-8 w-auto"
            />
          )}
        </div>

        {/* Navigation */}
        <nav className={`${isCollapsed ? "mt-4" : "mt-8"} flex-1`}>
          <Sidebar
            items={sections}
            onItemClick={handleItemClick}
            isCompact={isCollapsed}
          />
        </nav>

        {/* Footer */}
        <div
          className={`mt-auto pt-4 border-t border-divider ${
            isCollapsed ? "px-2" : ""
          }`}
        >
          <div className="flex justify-center items-center gap-2">
            {!isCollapsed && (
              <div className="text-small text-default-500">SystemPrompt.io</div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-default/40 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon
                icon={
                  isCollapsed
                    ? "solar:alt-arrow-right-line-duotone"
                    : "solar:alt-arrow-left-line-duotone"
                }
                className="w-4 h-4 text-default-500"
              />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto p-6">{children}</div>
        <ControlTray />
      </main>
    </div>
  );
}
