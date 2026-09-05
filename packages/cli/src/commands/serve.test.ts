import { describe, it, expect } from "vitest";
import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createPortalServer } from "./serve.js";

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

function dispatchMockRequest(
  server: any,
  method: string,
  pathname: string,
  bodyData: unknown = null
): Promise<MockResponse> {
  return new Promise((resolve) => {
    const req = new EventEmitter() as unknown as IncomingMessage;
    req.method = method;
    req.url = pathname;
    req.headers = { host: "localhost" };

    let statusCode = 200;
    const resHeaders: Record<string, string> = {};
    let resBody = "";

    const res = {
      setHeader(name: string, value: string) {
        resHeaders[name.toLowerCase()] = value;
      },
      writeHead(code: number, headersObj?: Record<string, string>) {
        statusCode = code;
        if (headersObj) {
          for (const [k, v] of Object.entries(headersObj)) {
            resHeaders[k.toLowerCase()] = v;
          }
        }
      },
      write(chunk: string | Buffer) {
        resBody += chunk.toString();
      },
      end(chunk?: string | Buffer) {
        if (chunk) resBody += chunk.toString();
        resolve({
          statusCode,
          headers: resHeaders,
          body: resBody,
        });
      },
    } as unknown as ServerResponse;

    // Trigger request listener
    server.emit("request", req, res);

    if (bodyData !== null) {
      const serialized = typeof bodyData === "string" ? bodyData : JSON.stringify(bodyData);
      req.emit("data", Buffer.from(serialized));
    }
    req.emit("end");
  });
}

describe("Trainable DS Portal Server (serve)", () => {
  const server = createPortalServer({ dir: process.cwd() });

  it("serves /llms.txt with text/plain content type and agent guide", async () => {
    const res = await dispatchMockRequest(server, "GET", "/llms.txt");
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.body).toContain("Trainable DS: Agent Developer Portal");
    expect(res.body).toContain("npx -y @trainable-ds/cli init --auto");
  });

  it("serves /llms-full.txt with comprehensive prompt bundle", async () => {
    const res = await dispatchMockRequest(server, "GET", "/llms-full.txt");
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.body).toContain("M3 Semantic Color Taxonomy");
    expect(res.body).toContain("15-Tier Typography Scale");
  });

  it("serves /.well-known/mcp.json with MCP server discovery info", async () => {
    const res = await dispatchMockRequest(server, "GET", "/.well-known/mcp.json");
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
    const data = JSON.parse(res.body);
    expect(data.name).toBe("trainable-ds");
    expect(data.capabilities.tools).toContain("validate_code_snippet");
  });

  it("serves /api/v1/context with compact prompt context", async () => {
    const res = await dispatchMockRequest(server, "GET", "/api/v1/context");
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
    const data = JSON.parse(res.body);
    expect(data.thesis).toContain("Material Design 3");
    expect(data.endpoints.llms).toBe("/llms.txt");
  });

  it("evaluates dirty code via POST /api/v1/evaluate", async () => {
    const dirty = `<button style={{ background: '#ff0000' }} className="p-[13px]">Click</button>`;
    const res = await dispatchMockRequest(server, "POST", "/api/v1/evaluate", { code: dirty });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.certified).toBe(false);
    expect(data.diagnostics.length).toBeGreaterThan(0);
  });

  it("evaluates clean code via POST /api/v1/evaluate", async () => {
    const clean = `<Button variant="filled" className="min-h-[48px] min-w-[48px] bg-primary text-on-primary p-4">Save changes</Button>`;
    const res = await dispatchMockRequest(server, "POST", "/api/v1/evaluate", { code: clean });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.certified).toBe(true);
    expect(data.score).toBe(100);
  });
});
