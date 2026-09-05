import type {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcNotification,
} from "./types.js";
import { TOOLS, executeTool, type ToolExecutionContext } from "./tools.js";
import { RESOURCES, readResource } from "./resources.js";
import { PROMPTS, getPromptMessages } from "./prompts.js";

export interface McpServerOptions {
  workspaceDir?: string;
  serverName?: string;
  version?: string;
}

export class McpServer {
  private workspaceDir: string;
  private serverName: string;
  private version: string;

  constructor(options: McpServerOptions = {}) {
    this.workspaceDir = options.workspaceDir || process.cwd();
    this.serverName = options.serverName || "trainable-ds-mcp";
    this.version = options.version || "1.7.0";
  }

  public async handleMessage(rawMessage: string | Record<string, unknown>): Promise<JsonRpcResponse | null> {
    let msg: Record<string, unknown>;
    if (typeof rawMessage === "string") {
      try {
        msg = JSON.parse(rawMessage);
      } catch (err) {
        return {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: "Parse error: invalid JSON",
          },
        };
      }
    } else {
      msg = rawMessage;
    }

    const id = (msg.id as string | number | null) ?? null;
    const method = String(msg.method || "");
    const params = (msg.params as Record<string, unknown>) || {};

    // Notification: methods without an id
    const isNotification = msg.id === undefined;

    try {
      switch (method) {
        case "initialize": {
          const result = {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
              prompts: { listChanged: false },
            },
            serverInfo: {
              name: this.serverName,
              version: this.version,
            },
            instructions:
              "Trainable DS MCP Server provides authoritative M3 design tokens, component manifests, and a 4-tier closed-loop compliance evaluator. Always validate generated UI code using validate_code_snippet.",
          };
          return { jsonrpc: "2.0", id, result };
        }

        case "notifications/initialized":
        case "initialized": {
          // Notification from client, no response required
          return null;
        }

        case "ping": {
          return { jsonrpc: "2.0", id, result: {} };
        }

        case "tools/list": {
          return {
            jsonrpc: "2.0",
            id,
            result: {
              tools: TOOLS,
            },
          };
        }

        case "tools/call": {
          const name = String(params.name || "");
          const args = (params.arguments as Record<string, unknown>) || {};
          const ctx: ToolExecutionContext = { workspaceDir: this.workspaceDir };
          const toolResult = await executeTool(name, args, ctx);
          return {
            jsonrpc: "2.0",
            id,
            result: toolResult,
          };
        }

        case "resources/list": {
          return {
            jsonrpc: "2.0",
            id,
            result: {
              resources: RESOURCES,
            },
          };
        }

        case "resources/read": {
          const uri = String(params.uri || "");
          const content = readResource(uri, this.workspaceDir);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              contents: [content],
            },
          };
        }

        case "prompts/list": {
          return {
            jsonrpc: "2.0",
            id,
            result: {
              prompts: PROMPTS,
            },
          };
        }

        case "prompts/get": {
          const name = String(params.name || "");
          const args = (params.arguments as Record<string, string>) || {};
          const messages = getPromptMessages(name, args);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              messages,
            },
          };
        }

        default: {
          if (isNotification) {
            return null;
          }
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          };
        }
      }
    } catch (err: unknown) {
      if (isNotification) {
        return null;
      }
      const message = err instanceof Error ? err.message : String(err);
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32603,
          message: `Internal error: ${message}`,
        },
      };
    }
  }
}
