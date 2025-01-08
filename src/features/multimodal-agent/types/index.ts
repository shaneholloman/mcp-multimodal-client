import type {
  Content,
  FunctionCall,
  GenerationConfig,
  GenerativeContentBlob,
  Part,
  Tool,
} from "@google/generative-ai";

// Tool Types
export interface GoogleSearchTool {
  googleSearch: Record<string, never>;
}

export interface CodeExecutionTool {
  codeExecution: Record<string, never>;
}

export type ToolType = Tool | GoogleSearchTool | CodeExecutionTool;

export function isGoogleSearchTool(tool: ToolType): tool is GoogleSearchTool {
  return "googleSearch" in tool;
}

export function isCodeExecutionTool(tool: ToolType): tool is CodeExecutionTool {
  return "codeExecution" in tool;
}

// Configuration Types
export interface LiveConfig {
  model: string;
  systemInstruction?: { parts: Part[] };
  generationConfig?: Partial<LiveGenerationConfig>;
  tools?: Array<ToolType>;
}

export interface LiveGenerationConfig extends GenerationConfig {
  responseModalities: "text" | "audio" | "image";
  speechConfig?: {
    voiceConfig?: {
      prebuiltVoiceConfig?: {
        voiceName: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | string;
      };
    };
  };
}

// Message Types
export interface ClientContentMessage {
  clientContent: {
    turns: Content[];
    turnComplete: boolean;
  };
}

export interface RealtimeInputMessage {
  realtimeInput: {
    mediaChunks: GenerativeContentBlob[];
  };
}

export interface ToolResponseMessage {
  toolResponse: {
    functionResponses: LiveFunctionResponse[];
  };
}

export interface LiveFunctionResponse {
  response: object;
  id: string;
}

export interface SetupMessage {
  setup: LiveConfig;
}

// Server Response Types
export interface ServerContentMessage {
  serverContent: ServerContent;
}

export type ServerContent = ModelTurn | TurnComplete | Interrupted;

export interface ModelTurn {
  modelTurn: {
    parts: Part[];
  };
}

export interface TurnComplete {
  turnComplete: boolean;
}

export interface Interrupted {
  interrupted: true;
}

export interface ToolCallMessage {
  toolCall: ToolCall;
}

export interface ToolCallCancellationMessage {
  toolCallCancellation: {
    ids: string[];
  };
}

export type ToolCallCancellation =
  ToolCallCancellationMessage["toolCallCancellation"];

export interface LiveFunctionCall extends FunctionCall {
  id: string;
}

export interface ToolCall {
  functionCalls: LiveFunctionCall[];
}

// Logging Types
export interface StreamingLog {
  date: Date;
  type: string;
  count?: number;
  message: string | LiveOutgoingMessage | LiveIncomingMessage;
}

export type LiveOutgoingMessage =
  | SetupMessage
  | ClientContentMessage
  | RealtimeInputMessage
  | ToolResponseMessage;

export type LiveIncomingMessage =
  | ToolCallCancellationMessage
  | ToolCallMessage
  | ServerContentMessage
  | SetupCompleteMessage;

export interface SetupCompleteMessage {
  setupComplete: Record<string, never>;
}

// Type Guards
export const isSetupMessage = (a: unknown): a is SetupMessage =>
  typeof a === "object" && a !== null && "setup" in a;

export const isClientContentMessage = (a: unknown): a is ClientContentMessage =>
  typeof a === "object" && a !== null && "clientContent" in a;

export const isRealtimeInputMessage = (a: unknown): a is RealtimeInputMessage =>
  typeof a === "object" && a !== null && "realtimeInput" in a;

export const isToolResponseMessage = (a: unknown): a is ToolResponseMessage =>
  typeof a === "object" && a !== null && "toolResponse" in a;

export const isSetupCompleteMessage = (a: unknown): a is SetupCompleteMessage =>
  typeof a === "object" && a !== null && "setupComplete" in a;

export const isServerContentMessage = (a: unknown): a is ServerContentMessage =>
  typeof a === "object" && a !== null && "serverContent" in a;

export const isToolCallMessage = (a: unknown): a is ToolCallMessage =>
  typeof a === "object" && a !== null && "toolCall" in a;

export const isToolCallCancellationMessage = (
  a: unknown
): a is ToolCallCancellationMessage =>
  typeof a === "object" && a !== null && "toolCallCancellation" in a;

export const isModelTurn = (a: ServerContent): a is ModelTurn =>
  typeof a === "object" && a !== null && "modelTurn" in a;

export const isTurnComplete = (a: ServerContent): a is TurnComplete =>
  typeof a === "object" && a !== null && "turnComplete" in a;

export const isInterrupted = (a: ServerContent): a is Interrupted =>
  typeof a === "object" && a !== null && "interrupted" in a;
