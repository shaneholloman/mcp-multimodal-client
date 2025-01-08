import { Chip, Divider, Input } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AccordionCard } from "@/components/Card/AccordionCard";
import { LlmProviderConfig } from "../lib/types";

interface LlmConfigCardProps {
  /** The active provider configuration */
  provider: LlmProviderConfig | null;
  /** Whether the provider is missing (configured but not registered) */
  isMissing?: boolean;
  /** The current provider configuration values */
  config: Record<string, unknown>;
  /** Additional class names */
  className?: string;
}

/**
 * A specialized card component for displaying LLM provider configuration.
 * Uses AccordionCard for collapsible content with a consistent header.
 */
export function LlmConfigCard({
  provider,
  isMissing = false,
  config,
  className = "",
}: LlmConfigCardProps) {
  return (
    <AccordionCard
      header={
        <div className="flex items-center gap-3">
          <Icon
            icon="solar:chat-square-code-line-duotone"
            className="w-6 h-6 text-primary"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-md ">LLM Provider</p>
              {provider && (
                <Chip
                  size="sm"
                  color="primary"
                  variant="dot"
                  classNames={{
                    base: "pl-2 pr-3",
                  }}
                >
                  {provider.name}
                </Chip>
              )}
            </div>
            <p className="text-small text-default-500">
              Current language model configuration
            </p>
          </div>
        </div>
      }
      className={className}
    >
      <div className="flex flex-col gap-4">
        <div className="bg-default-100 p-4 rounded-lg">
          <p className="text-sm">
            LLM providers are configured in{" "}
            <code className="text-primary">config/llm.json</code>. Edit this
            file to change the active provider and its settings. The
            configuration will be automatically loaded on application startup.
          </p>
        </div>

        {isMissing ? (
          <div className="text-center p-6">
            <p className="text-warning">
              Provider &quot;{provider?.id}&quot; is configured but not
              registered. Make sure the provider package is properly installed
              and initialized.
            </p>
          </div>
        ) : provider ? (
          <>
            <p className="text-sm text-default-500">{provider.description}</p>

            <Divider />

            <div className="flex flex-col gap-4">
              {Object.entries(provider.configSchema).map(([key, schema]) => {
                const value = config[key];
                const displayValue =
                  schema.isSecret && value
                    ? "••••••••"
                    : value?.toString() || "Not configured";

                return (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      {schema.label}
                    </label>
                    <Input
                      value={displayValue}
                      type="text"
                      isReadOnly
                      description={schema.description}
                      classNames={{
                        input: "bg-default-100",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <p className="text-default-500">
              No LLM provider configured. Please check{" "}
              <code className="text-primary">config/llm.json</code>.
            </p>
          </div>
        )}

        <Divider />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Need help?</p>
          <p className="text-sm text-default-500">
            Check the LLM Registry documentation for configuration examples and
            supported providers.
          </p>
        </div>
      </div>
    </AccordionCard>
  );
}
