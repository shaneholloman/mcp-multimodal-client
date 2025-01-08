import { render } from "@testing-library/react";
import { NextUIProvider } from "@nextui-org/react";
import { McpProvider } from "@/contexts/McpContext";

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <NextUIProvider>
      <McpProvider>{ui}</McpProvider>
    </NextUIProvider>
  );
};

export const mockServerInfo = {
  name: "Test Server",
  version: "1.0.0",
  protocolVersion: "1.0",
  capabilities: {
    tools: true,
    prompts: true,
    resources: true,
  },
};
