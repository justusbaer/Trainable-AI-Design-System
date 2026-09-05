import { McpServer, startStdioServer, startHttpServer } from "@trainable-ds/mcp-server";

export interface McpOptions {
  port?: string;
  sse?: boolean;
  dir?: string;
}

export async function runMcp(options: McpOptions = {}): Promise<void> {
  const workspaceDir = options.dir || process.cwd();
  const server = new McpServer({ workspaceDir });

  if (options.port || options.sse) {
    const port = options.port ? parseInt(options.port, 10) : 3000;
    startHttpServer(server, { port });
  } else {
    // Default to stdio transport for local agent pairs (Cursor, Claude, Antigravity)
    startStdioServer(server);
  }
}
