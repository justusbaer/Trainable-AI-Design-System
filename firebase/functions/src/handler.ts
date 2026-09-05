import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import { evaluateCode, type EvaluateOptions } from "@trainable-ds/evaluator";
import { McpServer } from "@trainable-ds/mcp-server";

const mcpServer = new McpServer();
const sseSessions = new Map<string, ServerResponse>();

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // 1. Health check
  if (pathname === "/api/v1/health" || pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "trainable-ds-cloud",
        version: "1.7.0",
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // 2. Headless Evaluation API: POST /api/v1/evaluate
  if (pathname === "/api/v1/evaluate" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const code = String(payload.code || "");
        const filename = payload.filename || "Snippet.tsx";
        const strict = Boolean(payload.strict);

        if (!code) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required 'code' field in request body" }));
          return;
        }

        const options: EvaluateOptions = {
          fileName: filename,
          strictHexDisallowed: true,
          requireSentenceCase: true,
          requireOnColorPairing: true,
        };

        const result = evaluateCode(code, options);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            filename,
            certified: result.certified,
            score: result.score,
            diagnostics: result.diagnostics,
            summary: result.summary,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Invalid JSON payload: ${message}` }));
      }
    });
    return;
  }

  // 3. Compact Context API: GET /api/v1/context
  if (pathname === "/api/v1/context" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          name: "Trainable DS Cloud System",
          version: "1.7.0",
          schema: "trainable-ds/v1.7",
          thesis: "Material Design 3 semantic token architecture with closed-loop verification",
          rules: [
            "TDS-RAW-COLOR: Never use raw hex codes. Use sys.color tokens.",
            "TDS-NON-QUANTUM-SPACING: 8dp spatial quantum grid only.",
            "TDS-TOUCH-TARGET-TOO-SMALL: Minimum 48x48px interactive target.",
            "TDS-REINVENTED-COMPONENT: Reuse certified components (<Button>, <Card>).",
            "TDS-RTL-NON-LOGICAL: Use ps-*/pe-* and ms-*/me-* logical spacing.",
            "TDS-CAPITALIZATION-NOT-SENTENCE-CASE: Use sentence case for UI labels.",
          ],
          primaryTokens: {
            primary: "sys.color.primary",
            onPrimary: "sys.color.on-primary",
            surface: "sys.color.surface",
            onSurface: "sys.color.on-surface",
            surfaceContainerLow: "sys.color.surface-container-low",
          },
        },
        null,
        2
      )
    );
    return;
  }

  // 4. Remote MCP SSE Endpoint: GET /api/v1/mcp/sse
  if (pathname === "/api/v1/mcp/sse" && req.method === "GET") {
    const sessionId = crypto.randomUUID();
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    sseSessions.set(sessionId, res);
    res.write(`event: endpoint\ndata: /api/v1/mcp/message?sessionId=${sessionId}\n\n`);

    req.on("close", () => {
      sseSessions.delete(sessionId);
    });
    return;
  }

  // 5. Remote MCP Message Endpoint: POST /api/v1/mcp/message
  if (pathname === "/api/v1/mcp/message" && req.method === "POST") {
    const sessionId = url.searchParams.get("sessionId");
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const response = await mcpServer.handleMessage(body);
        if (sessionId && sseSessions.has(sessionId)) {
          const sseRes = sseSessions.get(sessionId)!;
          sseRes.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
          res.writeHead(202, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "delivered_via_sse" }));
        } else {
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

  // Fallback 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found", pathname }));
}
