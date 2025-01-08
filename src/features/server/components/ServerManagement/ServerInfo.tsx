import { Chip } from "@nextui-org/react";
import { ServerCapabilities } from "@/contexts/McpContext.types";
import { BaseCard } from "@/components/Card/BaseCard";
import { Icon } from "@iconify/react";

interface ServerInfoProps {
  info?: {
    name: string;
    version: string;
    protocolVersion: string;
    capabilities: ServerCapabilities;
  };
}

const CAPABILITY_DESCRIPTIONS = {
  "tools.listChanged": "Notifies when tool list changes",
  "prompts.listChanged": "Notifies when prompt list changes",
  "resources.listChanged": "Notifies when resource list changes",
  "resources.subscribe": "Supports resource update subscriptions",
  logging: "Supports server-side logging",
} as const;

export function ServerInfo({ info }: ServerInfoProps) {
  const renderCapabilityGroup = (
    groupName: string,
    capabilities: Record<string, unknown>
  ) => {
    const enabledCapabilities = Object.entries(capabilities).flatMap(
      ([key, value]) => {
        if (typeof value === "object" && value !== null) {
          // Handle nested capabilities
          return Object.entries(value as Record<string, boolean>)
            .filter(([, enabled]) => enabled)
            .map(([subKey]) => ({
              key: `${key}.${subKey}`,
              description:
                CAPABILITY_DESCRIPTIONS[
                  `${key}.${subKey}` as keyof typeof CAPABILITY_DESCRIPTIONS
                ],
            }));
        }
        // Handle boolean capabilities
        return value === true
          ? [
              {
                key,
                description:
                  CAPABILITY_DESCRIPTIONS[
                    key as keyof typeof CAPABILITY_DESCRIPTIONS
                  ],
              },
            ]
          : [];
      }
    );

    if (enabledCapabilities.length === 0) return null;

    return (
      <div key={groupName} className="space-y-2">
        <h4 className="text-md font-semibold">{groupName}</h4>
        <div className="flex flex-wrap gap-2">
          {enabledCapabilities.map(({ key, description }) => (
            <Chip
              key={key}
              variant="flat"
              color="success"
              classNames={{
                base: "bg-success-50 hover:bg-success-100 transition-colors cursor-help",
                content: "text-success-600 font-medium",
              }}
              title={description}
            >
              {key}
            </Chip>
          ))}
        </div>
      </div>
    );
  };

  const renderCapabilities = () => {
    if (!info?.capabilities) return null;

    // Group capabilities by their main category
    const categories = {
      Features: {} as Record<string, unknown>,
      Core: {} as Record<string, unknown>,
      Experimental: {} as Record<string, unknown>,
    };

    Object.entries(info.capabilities).forEach(([key, value]) => {
      if (key === "experimental") {
        categories.Experimental = value as Record<string, unknown>;
      } else if (["tools", "prompts", "resources"].includes(key)) {
        categories.Features[key] = value;
      } else {
        categories.Core[key] = value;
      }
    });

    const hasAnyCapabilities = Object.values(categories).some(
      (cat) => Object.keys(cat).length > 0
    );

    if (!hasAnyCapabilities) {
      return (
        <div className="text-center text-default-500 py-4">
          <Icon
            icon="solar:server-path-line-duotone"
            className="w-12 h-12 mx-auto mb-2 text-default-300"
          />
          <p>No capabilities available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(categories).map(([category, caps]) => {
          if (Object.keys(caps).length === 0) return null;
          return renderCapabilityGroup(category, caps);
        })}
      </div>
    );
  };

  return (
    <BaseCard
      title="Server Information"
      subtitle={
        info
          ? `Version ${info.version}${
              info.protocolVersion ? ` • Protocol v${info.protocolVersion}` : ""
            }`
          : "Not Connected"
      }
      icon="solar:server-2-line-duotone"
    >
      {info && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon icon="solar:widget-2-line-duotone" className="w-5 h-5" />
            Server Capabilities
          </h3>
          {renderCapabilities()}
        </div>
      )}
    </BaseCard>
  );
}
