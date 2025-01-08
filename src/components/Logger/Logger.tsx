import {
  ScrollShadow,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import cn from "classnames";
import { useLogStore, LogEntry, LogType } from "@/stores/log-store";
import { useState } from "react";

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString().slice(0, -3);
};

function JsonViewModal({
  isOpen,
  onClose,
  data,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: unknown;
  title: string;
}) {
  let displayData: string;

  try {
    if (typeof data === "string") {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(data);
        displayData = JSON.stringify(parsed, null, 2);
      } catch {
        // If parsing fails, use the raw string
        displayData = data;
      }
    } else {
      // For non-string data, try to stringify it
      displayData = JSON.stringify(data, null, 2) || String(data);
    }
  } catch {
    // Final fallback if all else fails
    displayData = String(data);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody className="pb-6">
          <pre className="font-mono text-sm bg-default-100 p-4 rounded-lg overflow-auto max-h-[70vh]">
            {displayData}
          </pre>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function CompactJson({ data, label }: { data: unknown; label?: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const preview = JSON.stringify(data)?.slice(0, 50) ?? "";
  const hasMore = (JSON.stringify(data)?.length ?? 0) > 50;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-default-500 truncate flex-1">
        {preview + (hasMore ? "..." : "")}
      </span>
      <Button
        size="sm"
        variant="flat"
        color="primary"
        onClick={onOpen}
        className="min-w-0 px-2"
      >
        <Icon icon="solar:eye-linear" className="w-4 h-4" />
      </Button>
      <JsonViewModal
        isOpen={isOpen}
        onClose={onClose}
        data={data}
        title={label || "JSON View"}
      />
    </div>
  );
}

function LogMessage({ log }: { log: LogEntry }) {
  const renderContent = (content: unknown): string => {
    if (content === null || content === undefined) return "";
    if (typeof content === "string") return content;
    return JSON.stringify(content);
  };

  const renderJsonContent = (content: unknown, label: string) => {
    if (!content) return null;
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-success min-w-[200px]">
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex-1">
          <CompactJson data={content} label={label} />
        </div>
      </div>
    );
  };

  if (log.message) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-foreground">{renderContent(log.message)}</span>
        {renderJsonContent(log.params, "Parameters")}
        {renderJsonContent(log.result, "Result")}
      </div>
    );
  }

  if (log.params || log.result) {
    return (
      <div className="flex flex-col gap-2">
        {renderJsonContent(log.params, "Parameters")}
        {renderJsonContent(log.result, "Result")}
      </div>
    );
  }

  return null;
}

const getLogTypeColor = (type: LogType) => {
  switch (type) {
    case "tool":
      return "bg-primary-100/20";
    case "prompt":
      return "bg-success-100/20";
    case "multimodal":
      return "bg-warning-100/20";
    case "system":
      return "bg-default-100/20";
    default:
      return "bg-default-100/20";
  }
};

const getStatusColor = (status: LogEntry["status"]) => {
  switch (status) {
    case "success":
      return "success";
    case "error":
      return "danger";
    case "warning":
      return "warning";
    case "info":
      return "primary";
    default:
      return "default";
  }
};

function LogEntryComponent({ log }: { log: LogEntry }) {
  return (
    <li className="border-b border-default-200/20">
      <div className="flex items-start gap-2 p-2 text-sm">
        <div className="flex flex-col items-start gap-1 min-w-[180px] shrink-0">
          <Chip
            size="sm"
            variant="flat"
            className="min-w-[80px] justify-center bg-background/50"
          >
            {formatTime(log.timestamp)}
          </Chip>
          <div className="flex gap-1">
            <Chip
              size="sm"
              variant="flat"
              className={cn(
                "min-w-[80px] justify-center",
                getLogTypeColor(log.type)
              )}
            >
              {log.type}
            </Chip>
            <Chip
              size="sm"
              variant="flat"
              color={getStatusColor(log.status)}
              className="min-w-[80px] justify-center"
            >
              {log.status}
            </Chip>
          </div>
        </div>
        <div className="flex-grow py-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{log.name}</span>
              <span className="text-default-500">•</span>
              <span className="text-default-500">{log.operation}</span>
            </div>
            <LogMessage log={log} />
            {log.error && (
              <div className="text-danger text-sm mt-1">{log.error}</div>
            )}
          </div>
        </div>
        {log.count && log.count > 1 && (
          <Chip size="sm" variant="flat" className="shrink-0">
            ×{log.count}
          </Chip>
        )}
      </div>
    </li>
  );
}

export function Logger() {
  const { logs, clearLogs } = useLogStore();
  const [selectedTypes, setSelectedTypes] = useState<Set<LogType>>(new Set());

  const filteredLogs = logs.filter(
    (log) => selectedTypes.size === 0 || selectedTypes.has(log.type)
  );

  const handleTypeToggle = (type: LogType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2 border-b border-default-200/30">
        <h3 className="text-sm font-medium text-foreground">Activity Log</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {["tool", "prompt", "multimodal", "system"].map((type) => (
              <Chip
                key={type}
                size="sm"
                variant={selectedTypes.has(type as LogType) ? "solid" : "flat"}
                className={cn(
                  "cursor-pointer",
                  getLogTypeColor(type as LogType),
                  selectedTypes.has(type as LogType) && "opacity-100",
                  !selectedTypes.has(type as LogType) && "opacity-50"
                )}
                onClick={() => handleTypeToggle(type as LogType)}
              >
                {type}
              </Chip>
            ))}
          </div>
          <Button
            size="sm"
            variant="light"
            onClick={() => clearLogs()}
            aria-label="clear logs"
          >
            Clear
          </Button>
        </div>
      </div>
      <ScrollShadow className="flex-1 min-h-0">
        <ul className="divide-y divide-default-200/20">
          {filteredLogs.length === 0 ? (
            <li className="p-4 text-center text-default-400">No logs yet</li>
          ) : (
            filteredLogs.map((log) => (
              <LogEntryComponent key={log.id} log={log} />
            ))
          )}
        </ul>
      </ScrollShadow>
    </div>
  );
}
