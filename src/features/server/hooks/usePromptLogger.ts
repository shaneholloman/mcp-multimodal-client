import { useLogStore } from "@/stores/log-store";

type OperationType = "View Prompt" | "Execute Prompt";

interface LogEntry {
  type: "prompt";
  operation: OperationType;
  status: "success" | "error";
  name: string;
  params?: Record<string, string>;
  result?: unknown;
  error?: string;
}

interface UsePromptLoggerReturn {
  log: (entry: Omit<LogEntry, "type">) => void;
  logSuccess: (
    operation: OperationType,
    name: string,
    params?: Record<string, string>,
    result?: unknown
  ) => void;
  logError: (
    operation: OperationType,
    name: string,
    error: Error | string,
    params?: Record<string, string>
  ) => void;
}

export function usePromptLogger(): UsePromptLoggerReturn {
  const { addLog } = useLogStore();

  const log = (entry: Omit<LogEntry, "type">) => {
    addLog({
      type: "prompt",
      ...entry,
    });
  };

  const logSuccess = (
    operation: OperationType,
    name: string,
    params?: Record<string, string>,
    result?: unknown
  ) => {
    log({
      operation,
      status: "success",
      name,
      params,
      result,
    });
  };

  const logError = (
    operation: OperationType,
    name: string,
    error: Error | string,
    params?: Record<string, string>
  ) => {
    log({
      operation,
      status: "error",
      name,
      params,
      error: error instanceof Error ? error.message : error,
    });
  };

  return {
    log,
    logSuccess,
    logError,
  };
}
