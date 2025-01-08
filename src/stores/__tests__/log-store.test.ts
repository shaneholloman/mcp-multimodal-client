import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLogStore, LogType } from "../log-store";

describe("useLogStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useLogStore());
    act(() => {
      result.current.clearLogs();
    });
  });

  describe("initialization", () => {
    it("should start with empty logs", () => {
      const { result } = renderHook(() => useLogStore());
      expect(result.current.logs).toHaveLength(0);
    });

    it("should have default maxLogs of 500", () => {
      const { result } = renderHook(() => useLogStore());
      expect(result.current.maxLogs).toBe(500);
    });
  });

  describe("addLog", () => {
    it("should add a tool log", () => {
      const { result } = renderHook(() => useLogStore());
      const toolLog = {
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "success" as const,
        name: "TestTool",
        params: { param1: "value1" },
        result: { success: true },
      };

      act(() => {
        result.current.addLog(toolLog);
      });

      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0]).toMatchObject(toolLog);
      expect(result.current.logs[0].id).toBeDefined();
      expect(result.current.logs[0].timestamp).toBeDefined();
    });

    it("should add a prompt log", () => {
      const { result } = renderHook(() => useLogStore());
      const promptLog = {
        type: "prompt" as LogType,
        operation: "Execute Prompt",
        status: "success" as const,
        name: "TestPrompt",
        params: { input: "test input" },
        result: { output: "test output" },
      };

      act(() => {
        result.current.addLog(promptLog);
      });

      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0]).toMatchObject(promptLog);
    });

    it("should add a multimodal log", () => {
      const { result } = renderHook(() => useLogStore());
      const multimodalLog = {
        type: "multimodal" as LogType,
        operation: "Client Content",
        status: "info" as const,
        name: "Multimodal Client",
        message: "Connected to socket",
      };

      act(() => {
        result.current.addLog(multimodalLog);
      });

      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0]).toMatchObject(multimodalLog);
    });

    it("should handle error logs", () => {
      const { result } = renderHook(() => useLogStore());
      const errorLog = {
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "error" as const,
        name: "TestTool",
        error: "Something went wrong",
      };

      act(() => {
        result.current.addLog(errorLog);
      });

      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0]).toMatchObject(errorLog);
    });

    it("should increment count for duplicate logs", () => {
      const { result } = renderHook(() => useLogStore());
      const log = {
        type: "multimodal" as LogType,
        operation: "Audio",
        status: "info" as const,
        name: "Multimodal Client",
        message: "buffer (11250)",
      };

      act(() => {
        result.current.addLog(log);
        result.current.addLog(log);
        result.current.addLog(log);
      });

      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0].count).toBe(3);
    });

    it("should respect maxLogs limit", () => {
      const { result } = renderHook(() => useLogStore());
      act(() => {
        result.current.setMaxLogs(2);
      });

      const logs = [
        {
          type: "tool" as LogType,
          operation: "Execute Tool",
          status: "success" as const,
          name: "Tool1",
        },
        {
          type: "tool" as LogType,
          operation: "Execute Tool",
          status: "success" as const,
          name: "Tool2",
        },
        {
          type: "tool" as LogType,
          operation: "Execute Tool",
          status: "success" as const,
          name: "Tool3",
        },
      ];

      act(() => {
        logs.forEach((log) => result.current.addLog(log));
      });

      expect(result.current.logs).toHaveLength(2);
      expect(result.current.logs[0].name).toBe("Tool2");
      expect(result.current.logs[1].name).toBe("Tool3");
    });
  });

  describe("clearLogs", () => {
    it("should clear all logs", () => {
      const { result } = renderHook(() => useLogStore());
      const log = {
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "success" as const,
        name: "TestTool",
      };

      act(() => {
        result.current.addLog(log);
        result.current.clearLogs();
      });

      expect(result.current.logs).toHaveLength(0);
    });
  });

  describe("setMaxLogs", () => {
    it("should update maxLogs", () => {
      const { result } = renderHook(() => useLogStore());
      act(() => {
        result.current.setMaxLogs(100);
      });

      expect(result.current.maxLogs).toBe(100);
    });

    it("should trim existing logs when reducing maxLogs", () => {
      const { result } = renderHook(() => useLogStore());
      const logs = Array.from({ length: 5 }, (_, i) => ({
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "success" as const,
        name: `Tool${i + 1}`,
      }));

      act(() => {
        logs.forEach((log) => result.current.addLog(log));
        result.current.setMaxLogs(3);
      });

      expect(result.current.logs).toHaveLength(3);
      expect(result.current.logs[0].name).toBe("Tool3");
      expect(result.current.logs[2].name).toBe("Tool5");
    });
  });

  describe("log deduplication", () => {
    it("should not deduplicate logs with different parameters", () => {
      const { result } = renderHook(() => useLogStore());
      const baseLog = {
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "success" as const,
        name: "TestTool",
      };

      act(() => {
        result.current.addLog({ ...baseLog, params: { value: 1 } });
        result.current.addLog({ ...baseLog, params: { value: 2 } });
      });

      expect(result.current.logs).toHaveLength(2);
    });

    it("should not deduplicate logs with different messages", () => {
      const { result } = renderHook(() => useLogStore());
      const baseLog = {
        type: "multimodal" as LogType,
        operation: "Audio",
        status: "info" as const,
        name: "Multimodal Client",
      };

      act(() => {
        result.current.addLog({ ...baseLog, message: "buffer (11250)" });
        result.current.addLog({ ...baseLog, message: "buffer (22500)" });
      });

      expect(result.current.logs).toHaveLength(2);
    });

    it("should deduplicate identical logs and maintain order", () => {
      const { result } = renderHook(() => useLogStore());
      const log1 = {
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "success" as const,
        name: "Tool1",
      };
      const log2 = {
        type: "tool" as LogType,
        operation: "Execute Tool",
        status: "success" as const,
        name: "Tool2",
      };

      act(() => {
        result.current.addLog(log1);
        result.current.addLog(log2);
        result.current.addLog(log1); // Should increment count of first log
      });

      expect(result.current.logs).toHaveLength(2);
      expect(result.current.logs[0].name).toBe("Tool2");
      expect(result.current.logs[1].name).toBe("Tool1");
      expect(result.current.logs[1].count).toBe(2);
    });
  });
});
