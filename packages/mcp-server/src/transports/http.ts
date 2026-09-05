import http from "node:http";
import crypto from "node:crypto";
import { McpServer } from "../server.js";

export interface HttpServerOptions {
  port?: number;
  host?: string;
}

export function startHttpServer(server: McpServer, options: HttpServerOptions = {}): http.Server {
  const port = options.port || 3000;
  const host = options.host || "0.0.0.0";

  const sseSessions = new Map<string, http.ServerResponse>();

  const httpServer = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", server: "trainable-ds-mcp", version: "1.7.0" }));
      return;
    }

    // SSE Connection Endpoint
    if (url.pathname === "/sse" && req.method === "GET") {
      const sessionId = crypto.randomUUID();
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });

      sseSessions.set(sessionId, res);

      // Send endpoint notification with sessionId
      res.write(`event: endpoint\ndata: /message?sessionId=${sessionId}\n\n`);

      req.on("close", () => {
        sseSessions.delete(sessionId);
      });
      return;
    }

    // Message POST Endpoint
    if (url.pathname === "/message" && req.method === "POST") {
      const sessionId = url.searchParams.get("sessionId");
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const response = await server.handleMessage(body);

          if (sessionId && sseSessions.has(sessionId)) {
            // Forward response over SSE
            const sseRes = sseSessions.get(sessionId)!;
            sseRes.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
            res.writeHead(202, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "queued" }));
          } else {
            // Direct HTTP POST response
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(response));
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: message }));
        }
      });
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  httpServer.listen(port, host, () => {
    console.error(`[Trainable DS MCP] HTTP/SSE Server listening on http://${host}:${port}`);
    console.error(`[Trainable DS MCP] SSE stream available at http://${host}:${port}/sse`);
  });

  return httpServer;
}
