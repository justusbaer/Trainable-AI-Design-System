import { describe, it, expect } from "vitest";
import { EventEmitter } from "node:events";
import { handleApiRequest } from "./handler.js";
import type { IncomingMessage, ServerResponse } from "node:http";

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

function mockRequest(
  method: string,
  pathname: string,
  bodyData: unknown = null,
  headers: Record<string, string> = {}
): Promise<MockResponse> {
  return new Promise((resolve) => {
    const req = new EventEmitter() as unknown as IncomingMessage;
    req.method = method;
    req.url = pathname;
    req.headers = {
      host: "localhost",
      "content-type": "application/json",
      ...headers,
    };

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
      write(chunk: string) {
        resBody += chunk;
      },
      end(chunk?: string) {
        if (chunk) resBody += chunk;
        resolve({
          statusCode,
          headers: resHeaders,
          body: resBody,
        });
      },
    } as unknown as ServerResponse;

    handleApiRequest(req, res);

    if (bodyData !== null) {
      const serialized = typeof bodyData === "string" ? bodyData : JSON.stringify(bodyData);
      req.emit("data", Buffer.from(serialized));
    }
    req.emit("end");
  });
}

describe("Firebase Cloud Functions API (In-Memory / Sandbox-Safe)", () => {
  it("serves GET /api/v1/health", async () => {
    const res = await mockRequest("GET", "/api/v1/health");
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.status).toBe("ok");
    expect(data.service).toBe("trainable-ds-cloud");
  });

  it("serves GET /api/v1/context with compact prompt bundle", async () => {
    const res = await mockRequest("GET", "/api/v1/context");
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty("thesis");
    expect(data.rules.length).toBeGreaterThan(0);
    expect(data.primaryTokens).toHaveProperty("primary");
  });

  it("evaluates dirty code via POST /api/v1/evaluate", async () => {
    const dirtyCode = `<button style={{ background: '#ff0000' }} className="p-[15px]">Click Here</button>`;
    const res = await mockRequest("POST", "/api/v1/evaluate", { code: dirtyCode });

    expect(res.statusCode).toBe(200);
    const result = JSON.parse(res.body);
    expect(result.certified).toBe(false);
    expect(result.score).toBeLessThan(50);
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it("evaluates clean code via POST /api/v1/evaluate", async () => {
    const cleanCode = `<Button variant="filled" className="min-h-[48px] min-w-[48px] bg-primary text-on-primary p-4">Save changes</Button>`;
    const res = await mockRequest("POST", "/api/v1/evaluate", { code: cleanCode });

    expect(res.statusCode).toBe(200);
    const result = JSON.parse(res.body);
    expect(result.certified).toBe(true);
    expect(result.score).toBe(100);
  });

  it("handles remote MCP JSON-RPC call via POST /api/v1/mcp/message", async () => {
    const rpcReq = {
      jsonrpc: "2.0",
      id: 101,
      method: "tools/list",
      params: {},
    };

    const res = await mockRequest("POST", "/api/v1/mcp/message", rpcReq);

    expect(res.statusCode).toBe(200);
    const result = JSON.parse(res.body);
    expect(result.id).toBe(101);
    expect(result.result).toHaveProperty("tools");
  });
});
