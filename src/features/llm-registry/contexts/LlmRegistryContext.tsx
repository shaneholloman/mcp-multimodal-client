import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  LlmProviderConfig,
  LlmProviderInstance,
  LlmRegistryContextType,
} from "../lib/types";
import { readLlmConfig } from "@/utils/config";

const LlmRegistryContext = createContext<LlmRegistryContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function LlmRegistryProvider({ children }: Props) {
  const [providers, setProviders] = useState<LlmProviderConfig[]>([]);
  const [instances, setInstances] = useState<Map<string, LlmProviderInstance>>(
    new Map()
  );
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [providerConfig, setProviderConfig] = useState<Record<string, unknown>>(
    {}
  );

  // Load configuration from llm.json on startup
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("Loading LLM configuration...");
        const config = await readLlmConfig();
        console.log("Loaded config:", config);
        if (config.provider) {
          console.log("Setting active provider:", config.provider);
          setActiveProvider(config.provider);
          setProviderConfig(config.config || {});
        }
      } catch (error) {
        console.error("Failed to load LLM configuration:", error);
      }
    };

    loadConfig();
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log("Registry state updated:", {
      activeProvider,
      providers: providers.map((p) => p.id),
      providerConfig,
    });
  }, [activeProvider, providers, providerConfig]);

  const registerProvider = useCallback(
    (config: LlmProviderConfig, instance: LlmProviderInstance) => {
      console.log("Registering provider:", config.id, config.name);
      setProviders((prev) => {
        if (prev.some((p) => p.id === config.id)) {
          console.log("Provider already registered:", config.id);
          return prev;
        }
        console.log("Adding new provider:", config.id);
        return [...prev, config];
      });

      setInstances((prev) => {
        const next = new Map(prev);
        next.set(config.id, instance);
        return next;
      });
    },
    []
  );

  const unregisterProvider = useCallback((providerId: string) => {
    console.log("Unregistering provider:", providerId);
    setProviders((prev) => prev.filter((p) => p.id !== providerId));
    setInstances((prev) => {
      const next = new Map(prev);
      next.delete(providerId);
      return next;
    });
  }, []);

  const getProviderConfig = useCallback(
    (providerId: string): LlmProviderConfig | null => {
      const config = providers.find((p) => p.id === providerId);
      console.log(
        "Getting provider config:",
        providerId,
        config ? "found" : "not found"
      );
      return config || null;
    },
    [providers]
  );

  const getProviderInstance = useCallback(
    (providerId: string): LlmProviderInstance | null => {
      const instance = instances.get(providerId);
      console.log(
        "Getting provider instance:",
        providerId,
        instance ? "found" : "not found"
      );
      return instance || null;
    },
    [instances]
  );

  return (
    <LlmRegistryContext.Provider
      value={{
        providers,
        activeProvider,
        providerConfig,
        getProviderConfig,
        getProviderInstance,
        registerProvider,
        unregisterProvider,
      }}
    >
      {children}
    </LlmRegistryContext.Provider>
  );
}

export function useLlmRegistry() {
  const context = useContext(LlmRegistryContext);
  if (!context) {
    throw new Error("useLlmRegistry must be used within a LlmRegistryProvider");
  }
  return context;
}
