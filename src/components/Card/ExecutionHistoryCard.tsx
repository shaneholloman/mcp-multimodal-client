import { useLogStore, LogType, LogEntry } from "@/stores/log-store";
import { BaseCard } from "./BaseCard";
import { Button } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

export interface ExecutionHistoryCardProps {
  type?: LogType;
}

interface TypedLogEntry extends LogEntry {
  result?: string | number | boolean | object | null;
}

export function ExecutionHistoryCard({ type }: ExecutionHistoryCardProps) {
  const { logs = [], clearLogs } = useLogStore();
  const filteredLogs = type ? logs.filter((log) => log.type === type) : logs;
  const executionLogs = filteredLogs.filter(
    (log) => log.params || log.result || log.error
  ) as TypedLogEntry[];

  const handleClearLogs = () => {
    clearLogs(type);
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "null";
    try {
      if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    } catch {
      return "Error formatting value";
    }
  };

  return (
    <BaseCard
      title="Execution History"
      subtitle={`${executionLogs.length} executions`}
      icon="solar:document-text-line-duotone"
      headerAction={
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onClick={handleClearLogs}
          aria-label="Clear logs"
        >
          <i className="solar:refresh-line-duotone text-xl" />
        </Button>
      }
      data-testid="execution-history-card"
    >
      <ScrollShadow className="h-[500px]">
        <div className="space-y-8">
          {executionLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-2"
              data-testid="execution-log-entry"
            >
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-lg font-semibold"
                  data-testid="execution-log-name"
                >
                  {log.name}
                </h3>
                <div
                  className="relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 h-6 text-tiny rounded-full bg-primary/20 text-primary-600"
                  data-testid="execution-log-operation"
                >
                  <span className="flex-1 text-inherit font-normal px-1">
                    {log.operation}
                  </span>
                </div>
              </div>
              {log.params && (
                <div
                  className="flex flex-col gap-1"
                  data-testid="execution-log-params"
                >
                  <h4 className="text-sm font-semibold">Parameters</h4>
                  <pre className="text-xs text-default-500 whitespace-pre-wrap">
                    {formatValue(log.params as Record<string, unknown>)}
                  </pre>
                </div>
              )}
              {log.result && (
                <div
                  className="flex flex-col gap-1"
                  data-testid="execution-log-result"
                >
                  <h4 className="text-sm font-semibold">Result</h4>
                  <pre className="text-xs text-default-500 whitespace-pre-wrap">
                    {formatValue(log.result)}
                  </pre>
                </div>
              )}
              {log.error && (
                <div
                  className="flex flex-col gap-1"
                  data-testid="execution-log-error"
                >
                  <h4 className="text-sm font-semibold text-danger">Error</h4>
                  <pre className="text-xs text-danger whitespace-pre-wrap">
                    {log.error}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollShadow>
    </BaseCard>
  );
}
