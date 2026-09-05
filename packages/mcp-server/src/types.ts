export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcNotification {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface ToolInputProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: { type: string };
  default?: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, ToolInputProperty>;
    required?: string[];
  };
}

export interface ToolTextContent {
  type: "text";
  text: string;
}

export interface CallToolResult {
  content: ToolTextContent[];
  isError?: boolean;
}

export interface ResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptDefinition {
  name: string;
  description?: string;
  arguments?: PromptArgument[];
}

export interface PromptMessage {
  role: "user" | "assistant";
  content: {
    type: "text";
    text: string;
  };
}
