"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MultimodalLiveAPIClientConnection } from "../lib/multimodal-live-client";
import MultimodalLiveClient from "../lib/multimodal-live-client";
import { ToolCall } from "../multimodal-live-types";
import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext } from "../lib/utils";
import VolMeterWorket from "../lib/worklets/vol-meter";
import { useAgentRegistry } from "@/features/agent-registry";

export type UseLiveAPIResults = {
  client: MultimodalLiveClient | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
  executeToolAction?: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<unknown>;
};

export function useLiveAPI({
  url,
  executeToolAction,
}: MultimodalLiveAPIClientConnection & {
  executeToolAction?: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<unknown>;
}): UseLiveAPIResults {
  const { config } = useAgentRegistry();
  const [connectionState, setConnectionState] = useState<{
    client: MultimodalLiveClient | null;
    connected: boolean;
    error: string | null;
  }>({
    client: null,
    connected: false,
    error: null,
  });

  const clientRef = useRef<MultimodalLiveClient | null>(null);
  const [volume, setVolume] = useState(0);

  const handleToolCall = useCallback(
    async (toolCall: ToolCall) => {
      const currentClient = clientRef.current;
      if (!currentClient) {
        console.error("Cannot execute tool call - no client");
        return;
      }

      try {
        const responses = await Promise.all(
          toolCall.functionCalls.map(async (fc) => {
            if (!executeToolAction) {
              throw new Error("Tool execution not available");
            }
            const result = await executeToolAction(
              fc.name,
              fc.args as Record<string, unknown>
            );
            return {
              response: { result: JSON.stringify(result) },
              id: fc.id,
            };
          })
        );

        await currentClient.sendToolResponse({
          functionResponses: responses,
        });
      } catch (error) {
        console.error("Tool execution failed:", error);
        await currentClient.sendToolResponse({
          functionResponses: toolCall.functionCalls.map((fc) => ({
            response: { error: "Tool execution failed" },
            id: fc.id,
          })),
        });
      }
    },
    [executeToolAction]
  );

  const setupClientListeners = useCallback(
    (client: MultimodalLiveClient) => {
      client
        .on("content", (message) => {
          console.log("Message from server:", message);
        })
        .on("close", (error) => {
          console.error("WebSocket error:", error);
          setConnectionState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : "Connection error",
          }));
        })
        .on("close", () => {
          console.log("WebSocket closed");
          setConnectionState({
            client: null,
            connected: false,
            error: null,
          });
        })
        .on("toolcall", handleToolCall)
        .on("setupcomplete", () => {
          console.log("Setup complete received from server");
        })
        .on("interrupted", () => {
          console.log("Server interrupted the connection");
        })
        .on("audio", (data) => {
          console.log("Received audio data from server", data.byteLength);
          if (audioStreamerRef.current) {
            audioStreamerRef.current.addPCM16(new Uint8Array(data));
          }
        });
    },
    [handleToolCall]
  );

  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const setConnectionStateAndRef = useCallback(
    (
      update: React.SetStateAction<{
        client: MultimodalLiveClient | null;
        connected: boolean;
        error: string | null;
      }>
    ) => {
      setConnectionState((prev) => {
        const newState = typeof update === "function" ? update(prev) : update;
        clientRef.current = newState.client;
        return newState;
      });
    },
    []
  );

  const disconnect = useCallback(async () => {
    const currentClient = clientRef.current;
    if (currentClient) {
      await currentClient.disconnect();
      setConnectionStateAndRef({
        client: null,
        connected: false,
        error: null,
      });
    }
  }, [setConnectionStateAndRef]);

  const connect = useCallback(async () => {
    if (!config) {
      setConnectionStateAndRef((prev) => ({
        ...prev,
        error: "Config has not been set",
      }));
      throw new Error("config has not been set");
    }

    try {
      await disconnect();

      // Resume audio context if it exists
      if (audioStreamerRef.current) {
        await audioStreamerRef.current.resume();
      }

      const newClient = new MultimodalLiveClient({ url });
      clientRef.current = newClient;

      // Set up listeners before connecting
      setupClientListeners(newClient);

      // Now connect
      await newClient.connect(config);

      setConnectionStateAndRef({
        client: newClient,
        connected: true,
        error: null,
      });
    } catch (error) {
      setConnectionStateAndRef({
        client: null,
        connected: false,
        error: error instanceof Error ? error.message : "Connection failed",
      });
      throw error;
    }
  }, [config, setupClientListeners, setConnectionStateAndRef]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const ctx = await audioContext();
        const streamer = new AudioStreamer(ctx);
        await streamer.addWorklet(
          "vol-meter",
          VolMeterWorket,
          (event: MessageEvent) => {
            if (event.data && typeof event.data.volume === "number") {
              setVolume(event.data.volume);
            }
          }
        );
        await streamer.resume();
        audioStreamerRef.current = streamer;
      } catch (error) {
        console.error("Failed to set up audio:", error);
      }
    };

    setupAudio();

    return () => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
        audioStreamerRef.current = null;
      }
    };
  }, []);

  return {
    ...connectionState,
    connect,
    disconnect,
    volume,
    executeToolAction,
  };
}
