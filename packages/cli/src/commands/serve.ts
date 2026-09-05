import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { evaluateCode, type EvaluateOptions } from "@trainable-ds/evaluator";
import { McpServer } from "@trainable-ds/mcp-server";

export interface ServeOptions {
  port?: string | number;
  dir?: string;
  silent?: boolean;
}

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function resolvePublicDir(startDir: string): string {
  let curr = startDir;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(curr, "firebase", "public");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return path.join(startDir, "firebase", "public");
}

function resolveWorkspaceRoot(startDir: string): string {
  let curr = startDir;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(curr, "DESIGN.md")) || fs.existsSync(path.join(curr, "firebase.json"))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return startDir;
}

export function createPortalServer(options: ServeOptions = {}): http.Server {
  const inputDir = options.dir ? path.resolve(options.dir) : process.cwd();
  const cwd = resolveWorkspaceRoot(inputDir);
  const publicDir = resolvePublicDir(inputDir);
  const mcpServer = new McpServer({ workspaceDir: cwd });

  return http.createServer(async (req, res) => {
    // Universal CORS headers for AI agents
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(url.pathname);

    // 1. API Endpoint: POST /api/v1/evaluate
    if (pathname === "/api/v1/evaluate" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const payload = JSON.parse(body || "{}");
          const code = String(payload.code || "");
          const filename = payload.filename || "Snippet.tsx";

          const evalOptions: EvaluateOptions = {
            fileName: filename,
            strictHexDisallowed: true,
            requireSentenceCase: true,
            requireOnColorPairing: true,
          };

          const result = evaluateCode(code, evalOptions);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              certified: result.certified,
              score: result.score,
              diagnostics: result.diagnostics,
              summary: result.summary,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: msg }));
        }
      });
      return;
    }

    // 2. API Endpoint: GET /api/v1/context
    if (pathname === "/api/v1/context" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            name: "Trainable DS Reference System",
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
            endpoints: {
              llms: "/llms.txt",
              llmsFull: "/llms-full.txt",
              designMd: "/DESIGN.md",
              tokens: "/tokens.json",
              components: "/components.json",
              evaluate: "/api/v1/evaluate",
            },
          },
          null,
          2
        )
      );
      return;
    }

    // 3. API Endpoint: POST /api/v1/mcp/message
    if (pathname === "/api/v1/mcp/message" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const response = await mcpServer.handleMessage(body);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: msg }));
        }
      });
      return;
    }

    // 4. Static Files Resolution
    if (pathname === "/") {
      pathname = "/index.html";
    }

    let filePath = path.join(publicDir, pathname);

    // Fallback: check workspace root for DESIGN.md
    if (!fs.existsSync(filePath) && pathname === "/DESIGN.md") {
      const rootDesignMd = path.join(cwd, "DESIGN.md");
      if (fs.existsSync(rootDesignMd)) {
        filePath = rootDesignMd;
      }
    }

    // Fallback: check .design-system for tokens.json and components.json
    if (!fs.existsSync(filePath) && (pathname === "/tokens.json" || pathname === "/components.json")) {
      const dsFile = path.join(cwd, ".design-system", path.basename(pathname));
      if (fs.existsSync(dsFile)) {
        filePath = dsFile;
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const fileData = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(fileData);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Not found: ${pathname}` }));
  });
}

export async function runServe(options: ServeOptions = {}): Promise<http.Server> {
  const port = options.port ? parseInt(String(options.port), 10) : 5000;
  const server = createPortalServer(options);

  return new Promise((resolve) => {
    server.listen(port, "0.0.0.0", () => {
      if (!options.silent) {
        console.log(pc.bold(pc.cyan("\n🌐 Trainable DS Source of Truth Portal Live!")));
        console.log(pc.green(`  👉 Human Web Portal: `) + pc.bold(`http://localhost:${port}/`));
        console.log(pc.blue(`  🤖 Agent llms.txt:   `) + `http://localhost:${port}/llms.txt`);
        console.log(pc.blue(`  📋 Full Agent Spec:  `) + `http://localhost:${port}/llms-full.txt`);
        console.log(pc.blue(`  🔗 Root DESIGN.md:   `) + `http://localhost:${port}/DESIGN.md`);
        console.log(pc.blue(`  ⚡ Evaluation API:   `) + `http://localhost:${port}/api/v1/evaluate`);
        console.log(pc.gray("\nPress Ctrl+C to stop.\n"));
      }
      resolve(server);
    });
  });
}
