import { describe, it, expect } from "vitest";
import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
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
    expect(res.body).toContain("Semantic Color Taxonomy");
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

  it("serves /overview.html", async () => {
    const res = await dispatchMockRequest(server, "GET", "/overview.html");
    expect([200, 404]).toContain(res.statusCode);
  });

  it("handles live token override via POST /api/v1/override", async () => {
    const os = await import("node:os");
    const fs = await import("node:fs");
    const path = await import("node:path");
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "serve-test-"));
    fs.writeFileSync(path.join(tempDir, "tokens.json"), JSON.stringify({}), "utf-8");
    fs.writeFileSync(path.join(tempDir, "components.json"), JSON.stringify({}), "utf-8");
    fs.writeFileSync(path.join(tempDir, "DESIGN.md"), "# Design System", "utf-8");

    const tempServer = createPortalServer({ dir: tempDir });
    const res = await dispatchMockRequest(tempServer, "POST", "/api/v1/override", {
      overrides: {
        "comp.button.shape.corner": { value: "9999px" }
      }
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.success).toBe(true);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("handles component code and authoritative binding override via POST /api/v1/override", async () => {
    const os = await import("node:os");
    const fs = await import("node:fs");
    const path = await import("node:path");
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "serve-comp-test-"));
    fs.writeFileSync(path.join(tempDir, "tokens.json"), JSON.stringify({}), "utf-8");
    fs.writeFileSync(path.join(tempDir, "components.json"), JSON.stringify({
      version: "1.7.0",
      components: {
        Button: {
          name: "Button",
          path: "components/ui/Button.tsx",
          family: "actions",
          description: "Button component",
          anatomy: {},
          variants: {},
          props: {},
          a11y: { minTouchTarget: "48x48px", requiredAria: [], focusIndicator: "3px" },
          rules: [],
          examples: []
        }
      }
    }), "utf-8");
    fs.writeFileSync(path.join(tempDir, "DESIGN.md"), "# Design System", "utf-8");

    const tempServer = createPortalServer({ dir: tempDir });
    const res = await dispatchMockRequest(tempServer, "POST", "/api/v1/override", {
      components: {
        Button: {
          code: "export const Button = () => <button>Custom Button</button>;",
          authoritativeSource: {
            type: "authoritative-library",
            packageName: "@mui/material",
            exportName: "Button"
          },
          humanNotes: "Use for high-conversion primary action buttons.",
          locked: true
        }
      }
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.success).toBe(true);
    expect(data.count).toBe(1);

    // Verify written TSX file on disk
    const writtenCode = fs.readFileSync(path.join(tempDir, "components/ui/Button.tsx"), "utf-8");
    expect(writtenCode).toBe("export const Button = () => <button>Custom Button</button>;");

    // Verify updated components.json
    const updatedManifest = JSON.parse(fs.readFileSync(path.join(tempDir, "components.json"), "utf-8"));
    expect(updatedManifest.components.Button.locked).toBe(true);
    expect(updatedManifest.components.Button.authoritativeSource.packageName).toBe("@mui/material");
    expect(updatedManifest.components.Button.humanNotes).toBe("Use for high-conversion primary action buttons.");

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("handles /api/v1/branches, /api/v1/branch/create, /api/v1/refine, and /api/v1/branch/merge endpoints", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tds-portal-vcs-"));
    fs.writeFileSync(
      path.join(tempDir, "tokens.json"),
      JSON.stringify({
        sys: {
          color: {
            primary: { value: "#0055ff" },
            onPrimary: { value: "#ffffff" },
            background: { value: "#ffffff" },
            onBackground: { value: "#000000" }
          }
        }
      }, null, 2),
      "utf-8"
    );

    const tempServer = createPortalServer({ dir: tempDir });

    // 1. GET /api/v1/branches
    const branchesRes = await dispatchMockRequest(tempServer, "GET", "/api/v1/branches");
    expect(branchesRes.statusCode).toBe(200);
    const branchesData = JSON.parse(branchesRes.body);
    expect(branchesData.currentBranch).toBe("main");
    expect(branchesData.branches.length).toBeGreaterThanOrEqual(1);

    // 2. POST /api/v1/branch/create
    const createRes = await dispatchMockRequest(tempServer, "POST", "/api/v1/branch/create", {
      name: "staging-theme"
    });
    expect(createRes.statusCode).toBe(200);
    const createData = JSON.parse(createRes.body);
    expect(createData.success).toBe(true);
    expect(createData.branch.name).toBe("staging-theme");

    // 3. POST /api/v1/refine on staging-theme
    const refineRes = await dispatchMockRequest(tempServer, "POST", "/api/v1/refine", {
      branch: "staging-theme",
      prompt: "Change primary color to #0033aa"
    });
    expect(refineRes.statusCode).toBe(200);
    const refineData = JSON.parse(refineRes.body);
    expect(refineData.success).toBe(true);
    expect(refineData.patches.tokens.some((t: any) => t.path === "sys.color.primary" && t.value === "#0033aa")).toBe(true);

    // 4. POST /api/v1/branch/merge
    const mergeRes = await dispatchMockRequest(tempServer, "POST", "/api/v1/branch/merge", {
      source: "staging-theme",
      target: "main"
    });
    expect(mergeRes.statusCode).toBe(200);
    const mergeData = JSON.parse(mergeRes.body);
    expect(mergeData.success).toBe(true);

    // 5. POST /api/v1/ingest
    const ingestRes = await dispatchMockRequest(tempServer, "POST", "/api/v1/ingest", {
      type: "table",
      content: "token,value\nsys.color.accent,#e11d48",
      fileName: "accent.csv"
    });
    expect(ingestRes.statusCode).toBe(200);
    const ingestData = JSON.parse(ingestRes.body);
    expect(ingestData.success).toBe(true);
    expect(ingestData.count.tokens).toBe(1);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
