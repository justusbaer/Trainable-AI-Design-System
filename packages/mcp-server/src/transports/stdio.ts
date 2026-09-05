import readline from "node:readline";
import { McpServer } from "../server.js";

export function startStdioServer(server: McpServer): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", async (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      const response = await server.handleMessage(trimmed);
      if (response !== null) {
        process.stdout.write(JSON.stringify(response) + "\n");
      }
    } catch (err) {
      console.error("[Trainable DS MCP] Error handling stdio line:", err);
    }
  });

  process.on("SIGINT", () => {
    process.exit(0);
  });
}
