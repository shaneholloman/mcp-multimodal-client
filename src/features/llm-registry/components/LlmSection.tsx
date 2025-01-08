import { useLlmRegistry } from "../contexts/LlmRegistryContext";
import { LlmConfigCard } from "./LlmConfigCard";

export function LlmSection() {
  const { activeProvider, providerConfig, getProviderConfig, providers } =
    useLlmRegistry();

  const currentProvider = activeProvider
    ? getProviderConfig(activeProvider)
    : null;

  // Determine the display state
  const isProviderConfigured = activeProvider !== null;
  const isProviderRegistered = providers.some((p) => p.id === activeProvider);
  const isProviderMissing = isProviderConfigured && !isProviderRegistered;

  return (
    <LlmConfigCard
      provider={currentProvider}
      isMissing={isProviderMissing}
      config={providerConfig}
    />
  );
}
