import { ReactNode } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { McpProvider } from "@/contexts/McpContext";
import { LiveAPIProvider } from "@/features/multimodal-agent/contexts/LiveAPIContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NextUIProvider>
      <McpProvider>
        <LiveAPIProvider>{children}</LiveAPIProvider>
      </McpProvider>
    </NextUIProvider>
  );
}
