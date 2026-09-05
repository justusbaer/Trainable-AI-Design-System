#!/usr/bin/env node

import { McpServer } from "./server.js";
import { startStdioServer } from "./transports/stdio.js";
import { startHttpServer } from "./transports/http.js";

const args = process.argv.slice(2);

let mode: "stdio" | "http" = "stdio";
let port = 3000;
let workspaceDir = process.cwd();

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--http" || arg === "--sse") {
    mode = "http";
  } else if (arg === "--stdio") {
    mode = "stdio";
  } else if (arg === "--port" && args[i + 1]) {
    mode = "http";
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (arg === "--dir" && args[i + 1]) {
    workspaceDir = args[i + 1];
    i++;
  }
}

const server = new McpServer({ workspaceDir });

if (mode === "http") {
  startHttpServer(server, { port });
} else {
  startStdioServer(server);
}
