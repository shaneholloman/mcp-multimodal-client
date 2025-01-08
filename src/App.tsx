"use client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { LlmRegistryProvider } from "./features/llm-registry/contexts/LlmRegistryContext";
import { GeminiProvider } from "./providers/gemini/GeminiProvider";
import { GlobalLlmProvider } from "./contexts/LlmProviderContext";
import { McpProvider } from "./contexts/McpProvider";
import { AgentRegistryProvider } from "./features/agent-registry";
import { LiveAPIProvider } from "./features/multimodal-agent/contexts/LiveAPIContext";
import Layout from "./components/Layout/Layout";
import SettingsPage from "./pages/SettingsPage";
import AgentPage from "./pages/AgentPage";
import AgentsPage from "./pages/AgentsPage";
import AgentExecutePage from "./pages/AgentExecutePage";
import LoggerPage from "./pages/LoggerPage";
import { ServerPage } from "./pages/ServerPage";

export default function App() {
  return (
    <NextUIProvider>
      <div className="dark text-foreground bg-background min-h-screen">
        <LlmRegistryProvider>
          <GeminiProvider>
            <GlobalLlmProvider>
              <McpProvider>
                <AgentRegistryProvider>
                  <LiveAPIProvider>
                    <Router>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<AgentsPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/agent" element={<AgentPage />} />
                          <Route
                            path="/agent/:id"
                            element={<AgentExecutePage />}
                          />
                          <Route path="/logs" element={<LoggerPage />} />
                          <Route
                            path="/servers/:serverId"
                            element={<ServerPage />}
                          />
                          <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                          />
                        </Routes>
                      </Layout>
                    </Router>
                  </LiveAPIProvider>
                </AgentRegistryProvider>
              </McpProvider>
            </GlobalLlmProvider>
          </GeminiProvider>
        </LlmRegistryProvider>
      </div>
    </NextUIProvider>
  );
}
