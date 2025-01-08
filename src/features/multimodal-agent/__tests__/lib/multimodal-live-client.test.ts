import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MultimodalLiveClient } from "../../lib/multimodal-live-client";
import { LiveConfig } from "../../multimodal-live-types";
import type { GenerativeContentBlob, TextPart } from "@google/generative-ai";
import { useLogStore } from "@/stores/log-store";

// Mock the log store
vi.mock("@/stores/log-store", () => ({
  useLogStore: {
    getState: vi.fn(() => ({
      addLog: vi.fn(),
      clearLogs: vi.fn(),
    })),
  },
}));

class MockWebSocket implements WebSocket {
  CONNECTING = WebSocket.CONNECTING;
  OPEN = WebSocket.OPEN;
  CLOSING = WebSocket.CLOSING;
  CLOSED = WebSocket.CLOSED;

  url: string;
  binaryType: BinaryType = "blob";
  bufferedAmount = 0;
  extensions = "";
  protocol = "";
  readyState = WebSocket.CONNECTING;

  onopen: ((this: WebSocket, ev: Event) => void) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => void) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => void) | null = null;
  onerror: ((this: WebSocket, ev: Event) => void) | null = null;

  send = vi.fn();
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
  }

  addEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => void
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    switch (type) {
      case "open":
        this.onopen = listener as (this: WebSocket, ev: Event) => void;
        break;
      case "message":
        this.onmessage = listener as (
          this: WebSocket,
          ev: MessageEvent
        ) => void;
        break;
      case "close":
        this.onclose = listener as (this: WebSocket, ev: CloseEvent) => void;
        break;
      case "error":
        this.onerror = listener as (this: WebSocket, ev: Event) => void;
        break;
    }
  }

  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

describe("MultimodalLiveClient", () => {
  let client: MultimodalLiveClient;
  let mockWebSocket: MockWebSocket;
  let mockConfig: LiveConfig;
  let addLogSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocket = new MockWebSocket("ws://test");
    (global.WebSocket as unknown) = vi.fn(() => mockWebSocket);

    mockConfig = {
      model: "test-model",
      generationConfig: {
        responseModalities: "text",
      },
    };

    addLogSpy = vi.fn();
    vi.mocked(useLogStore.getState).mockReturnValue({
      maxLogs: 500,
      logs: [],
      addLog: addLogSpy,
      clearLogs: vi.fn(),
      setMaxLogs: vi.fn(),
    });

    client = new MultimodalLiveClient({ url: "ws://test" });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("sends setup message on connect", async () => {
    const connectPromise = client.connect(mockConfig);
    mockWebSocket.onopen?.(new Event("open"));
    await connectPromise;

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ setup: mockConfig })
    );
  });

  it("emits log events", async () => {
    const connectPromise = client.connect(mockConfig);
    mockWebSocket.onopen?.(new Event("open"));
    await connectPromise;

    expect(addLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "multimodal",
        operation: "Connection Open",
        status: "success",
        name: "Multimodal Client",
        message: expect.stringContaining("connected to socket"),
      })
    );
  });

  it("handles disconnection", async () => {
    const closeSpy = vi.fn();
    client.on("close", closeSpy);

    const connectPromise = client.connect(mockConfig);
    mockWebSocket.onopen?.(new Event("open"));
    await connectPromise;

    mockWebSocket.onclose?.(new CloseEvent("close"));
    expect(closeSpy).toHaveBeenCalled();
  });

  it("sends client content", async () => {
    const connectPromise = client.connect(mockConfig);
    mockWebSocket.onopen?.(new Event("open"));
    await connectPromise;

    const textPart: TextPart = { text: "test content" };
    client.send([textPart]);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      expect.stringContaining('"clientContent"')
    );
  });

  it("sends realtime input", async () => {
    const connectPromise = client.connect(mockConfig);
    mockWebSocket.onopen?.(new Event("open"));
    await connectPromise;

    const chunks: GenerativeContentBlob[] = [
      {
        data: "test-data",
        mimeType: "audio/wav",
      },
    ];

    client.sendRealtimeInput(chunks);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      expect.stringContaining('"realtimeInput"')
    );
  });

  it("sends tool response", async () => {
    const connectPromise = client.connect(mockConfig);
    mockWebSocket.onopen?.(new Event("open"));
    await connectPromise;

    const response = {
      functionResponses: [
        {
          response: { result: "success" },
          id: "test-id",
        },
      ],
    };

    client.sendToolResponse(response);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      expect.stringContaining('"toolResponse"')
    );
  });
});
