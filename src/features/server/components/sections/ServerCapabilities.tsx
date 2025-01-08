// Remove React import since it's not needed
import { Chip, Tooltip, Divider } from "@nextui-org/react";
import {
  ServerCapabilities as IServerCapabilities,
  ServerMetadata,
} from "@/contexts/McpContext.types";
import { BaseCard } from "@/components/Card/BaseCard";
import { Icon } from "@iconify/react";
import { FeatureChip, FeatureType } from "@/components/Chip";

interface ServerCapabilitiesProps {
  info?: {
    name: string;
    version: string;
    protocolVersion: string;
    capabilities: IServerCapabilities;
    metadata?: ServerMetadata;
  };
}

const CAPABILITY_DESCRIPTIONS = {
  "tools.listChanged": "Notifies when tool list changes",
  "prompts.listChanged": "Notifies when prompt list changes",
  "resources.listChanged": "Notifies when resource list changes",
  "resources.subscribe": "Supports real-time resource update subscriptions",
  logging: "Supports server-side logging and diagnostics",
  "tools.execute": "Supports executing tools with parameters",
  "prompts.execute": "Supports executing prompts with parameters",
  "resources.read": "Supports reading resource contents",
  tools: "Supports tool execution and management",
  prompts: "Supports prompt templates and execution",
  resources: "Supports resource management and access",
} as const;

const CATEGORY_ICONS = {
  Features: "solar:widget-2-line-duotone",
  Core: "solar:server-2-line-duotone",
  Experimental: "solar:test-tube-line-duotone",
} as const;

export function ServerCapabilities({ info }: ServerCapabilitiesProps) {
  const renderMetadata = () => {
    if (!info?.metadata) return null;

    const { description, environment, serverStartTime, customData } =
      info.metadata;
    const startTime = serverStartTime
      ? new Date(serverStartTime).toLocaleString()
      : null;

    return (
      <div className="space-y-4">
        {description && (
          <div className="flex items-start gap-2 text-default-600">
            <Icon
              icon="solar:info-circle-line-duotone"
              className="w-5 h-5 mt-0.5 flex-shrink-0 text-default-400"
            />
            <p className="leading-relaxed">{description}</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {environment && (
            <Tooltip content="Server Environment" placement="top" showArrow>
              <Chip
                size="sm"
                variant="flat"
                startContent={
                  <Icon icon="solar:cloud-line-duotone" className="w-4 h-4" />
                }
                classNames={{
                  base: "bg-default-100/50 hover:bg-default-200/50 transition-colors cursor-help",
                  content: "text-default-600 font-medium",
                }}
              >
                {environment}
              </Chip>
            </Tooltip>
          )}
          {startTime && (
            <Tooltip content="Server Start Time" placement="top" showArrow>
              <Chip
                size="sm"
                variant="flat"
                startContent={
                  <Icon icon="solar:clock-line-duotone" className="w-4 h-4" />
                }
                classNames={{
                  base: "bg-default-100/50 hover:bg-default-200/50 transition-colors cursor-help",
                  content: "text-default-600 font-medium",
                }}
              >
                Started: {startTime}
              </Chip>
            </Tooltip>
          )}
        </div>
        {customData?.serverFeatures && customData.serverFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customData.serverFeatures.map((feature: string) => (
              <Chip
                key={feature}
                size="sm"
                variant="flat"
                classNames={{
                  base: "bg-default-100/50 hover:bg-default-200/50 transition-colors",
                  content: "text-default-600 font-medium",
                }}
              >
                {feature}
              </Chip>
            ))}
          </div>
        )}
      </div>
    );
  };

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
              category: key,
              description:
                CAPABILITY_DESCRIPTIONS[
                  `${key}.${subKey}` as keyof typeof CAPABILITY_DESCRIPTIONS
                ],
              isSubCapability: true,
            }));
        }
        // Handle boolean capabilities
        return value === true
          ? [
              {
                key,
                category: key,
                description:
                  CAPABILITY_DESCRIPTIONS[
                    key as keyof typeof CAPABILITY_DESCRIPTIONS
                  ],
                isSubCapability: false,
              },
            ]
          : [];
      }
    );

    if (enabledCapabilities.length === 0) return null;

    // Sort capabilities to show main features first
    const sortedCapabilities = [...enabledCapabilities].sort((a, b) => {
      if (a.isSubCapability === b.isSubCapability) return 0;
      return a.isSubCapability ? 1 : -1;
    });

    return (
      <div key={groupName} className="space-y-3">
        <div className="flex items-center gap-2 text-default-600">
          <Icon
            icon={CATEGORY_ICONS[groupName as keyof typeof CATEGORY_ICONS]}
            className="w-5 h-5"
          />
          <h4 className="text-md font-semibold">{groupName}</h4>
        </div>
        <div className="flex flex-wrap gap-2 pl-7">
          {sortedCapabilities.map(
            ({ key, category, description, isSubCapability }) => {
              const baseCategory = category.split(".")[0] as FeatureType;

              return (
                <FeatureChip
                  key={key}
                  label={key}
                  type={baseCategory}
                  description={description}
                  isSubFeature={isSubCapability}
                />
              );
            }
          )}
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
        // For feature capabilities, include both the main capability and its sub-capabilities
        categories.Features[key] = true; // Show that the feature exists
        if (typeof value === "object" && value !== null) {
          Object.entries(value as Record<string, boolean>).forEach(
            ([subKey, enabled]) => {
              if (enabled) {
                categories.Features[`${key}.${subKey}`] = true;
              }
            }
          );
        }
      } else {
        categories.Core[key] = value;
      }
    });

    const hasAnyCapabilities = Object.values(categories).some(
      (cat) => Object.keys(cat).length > 0
    );

    if (!hasAnyCapabilities) {
      return (
        <div className="text-center text-default-500 py-8">
          <Icon
            icon="solar:server-path-broken"
            className="w-12 h-12 mx-auto mb-3 text-default-300"
          />
          <p>No capabilities available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(categories).map(([category, caps]) => {
          if (Object.keys(caps).length === 0) return null;
          return renderCapabilityGroup(category, caps);
        })}
      </div>
    );
  };

  return (
    <BaseCard
      title="Server Capabilities"
      subtitle={
        info
          ? `${info.name} • v${info.version}${
              info.protocolVersion ? ` • Protocol v${info.protocolVersion}` : ""
            }`
          : "Not Connected"
      }
      icon={info?.metadata?.icon || "solar:server-2-line-duotone"}
      className={`${
        info?.metadata?.color ? `border-${info.metadata.color}` : ""
      } bg-default-50/50 backdrop-blur-sm shadow-sm hover:shadow transition-shadow`}
    >
      {info && (
        <div className="space-y-6">
          {renderMetadata()}
          {info.metadata && <Divider className="my-6" />}
          {renderCapabilities()}
        </div>
      )}
    </BaseCard>
  );
}
