"use client";
import ControlTray from "./components/control-tray/ControlTray";
import ConfigCard from "./components/config-card/ConfigCard";

function MultiModalAgent() {
  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-auto pb-32">
        <div className="px-4">
          <ConfigCard />
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 ml-[256px] bg-gradient-to-t from-background via-background to-background/80 pb-6 pt-4">
        <div className="px-4">
          <ControlTray />
        </div>
      </div>
    </div>
  );
}

export default MultiModalAgent;
