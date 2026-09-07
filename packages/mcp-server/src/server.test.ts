import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { McpServer } from "./server.js";

describe("McpServer", () => {
  const server = new McpServer();

  it("handles initialize handshake correctly", async () => {
    const res = await server.handleMessage({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    });

    expect(res).toBeDefined();
    expect(res?.id).toBe(1);
    expect(res?.result).toHaveProperty("protocolVersion", "2024-11-05");
    expect(res?.result).toHaveProperty("serverInfo.name", "trainable-ds-mcp");
  });

  it("handles ping request", async () => {
    const res = await server.handleMessage({
      jsonrpc: "2.0",
      id: 2,
      method: "ping",
    });

    expect(res?.id).toBe(2);
    expect(res?.result).toEqual({});
  });

  it("lists all available tools", async () => {
    const res = await server.handleMessage({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/list",
    });

    expect(res?.result).toHaveProperty("tools");
    const tools = (res?.result as { tools: Array<{ name: string }> }).tools;
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain("get_design_tokens");
    expect(toolNames).toContain("list_components");
    expect(toolNames).toContain("get_component_schema");
    expect(toolNames).toContain("validate_code_snippet");
    expect(toolNames).toContain("suggest_remediation");
    expect(toolNames).toContain("get_design_guidelines");
    expect(toolNames).toContain("get_component_code");
  });

  it("executes get_design_tokens tool", async () => {
    const res = await server.handleMessage({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "get_design_tokens",
        arguments: { category: "color" },
      },
    });

    expect(res?.result).toHaveProperty("content");
    const content = (res?.result as { content: Array<{ text: string }> }).content;
    expect(content[0].text).toContain("primary");
  });

  it("executes get_component_code tool", async () => {
    const res = await server.handleMessage({
      jsonrpc: "2.0",
      id: 44,
      method: "tools/call",
      params: {
        name: "get_component_code",
        arguments: { component_name: "Button" },
      },
    });

    expect(res?.result).toHaveProperty("content");
    const content = (res?.result as { content: Array<{ text: string }> }).content;
    const comp = JSON.parse(content[0].text);
    expect(comp.name).toBe("Button");
    expect(comp.family).toBe("actions");
    expect(comp.code).toBeDefined();
    expect(comp.code).toContain("export const Button");
  });

  it("executes list_components tool", async () => {
    const res = await server.handleMessage({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "list_components",
        arguments: { family: "actions" },
      },
    });

    const content = (res?.result as { content: Array<{ text: string }> }).content;
    const components = JSON.parse(content[0].text);
    expect(components.length).toBeGreaterThan(0);
    expect(components.some((c: { name: string }) => c.name === "Button")).toBe(true);
  });

  it("executes validate_code_snippet tool on non-compliant code", async () => {
    const dirtyCode = `
      export const Card = () => (
        <div style={{ backgroundColor: "#1e293b" }} className="p-[13px] ml-4">
          <button style={{ color: "#2563eb" }} className="w-8 h-8">Click Me</button>
        </div>
      );
    `;

    const res = await server.handleMessage({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "validate_code_snippet",
        arguments: { code: dirtyCode, strict: true },
      },
    });

    const content = (res?.result as { content: Array<{ text: string }> }).content;
    const report = JSON.parse(content[0].text);

    expect(report.compliant).toBe(false);
    expect(report.score).toBeLessThan(50);
    expect(report.violations.length).toBeGreaterThan(0);
  });

  it("executes validate_code_snippet tool on compliant code", async () => {
    const cleanCode = `
      export const CleanCard = () => (
        <div className="bg-surface-container-low text-on-surface p-6 rounded-2xl ms-4">
          <Button variant="filled" className="min-h-[48px] min-w-[48px]">
            Save changes
          </Button>
        </div>
      );
    `;

    const res = await server.handleMessage({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "validate_code_snippet",
        arguments: { code: cleanCode },
      },
    });

    const content = (res?.result as { content: Array<{ text: string }> }).content;
    const report = JSON.parse(content[0].text);

    expect(report.compliant).toBe(true);
    expect(report.score).toBe(100);
    expect(report.violations.length).toBe(0);
  });

  it("reads resources and prompts", async () => {
    const resRes = await server.handleMessage({
      jsonrpc: "2.0",
      id: 8,
      method: "resources/list",
    });
    expect(resRes?.result).toHaveProperty("resources");

    const promptRes = await server.handleMessage({
      jsonrpc: "2.0",
      id: 9,
      method: "prompts/list",
    });
    expect(promptRes?.result).toHaveProperty("prompts");
  });

  it("handles ingest_design_source, refine_design_system, and manage_ds_branches tools", async () => {
    // 1. manage_ds_branches list
    const branchListRes = await server.handleMessage({
      jsonrpc: "2.0",
      id: 10,
      method: "tools/call",
      params: {
        name: "manage_ds_branches",
        arguments: { action: "list" },
      },
    });
    const listContent = (branchListRes?.result as { content: Array<{ text: string }> }).content;
    const branchInfo = JSON.parse(listContent[0].text);
    expect(branchInfo).toHaveProperty("currentBranch");

    // 2. ingest_design_source
    const ingestRes = await server.handleMessage({
      jsonrpc: "2.0",
      id: 11,
      method: "tools/call",
      params: {
        name: "ingest_design_source",
        arguments: {
          content: "token,value\nsys.color.accent,#e11d48",
          type: "table",
          file_name: "test-tokens.csv",
        },
      },
    });
    const ingestContent = (ingestRes?.result as { content: Array<{ text: string }> }).content;
    const ingestData = JSON.parse(ingestContent[0].text);
    expect(ingestData.success).toBe(true);
    expect(ingestData.appliedTokens).toBe(1);

    // 3. refine_design_system
    const refineRes = await server.handleMessage({
      jsonrpc: "2.0",
      id: 12,
      method: "tools/call",
      params: {
        name: "refine_design_system",
        arguments: {
          prompt: "Change primary color to #0044cc",
        },
      },
    });
    const refineContent = (refineRes?.result as { content: Array<{ text: string }> }).content;
    const refineData = JSON.parse(refineContent[0].text);
    expect(refineData.success).toBe(true);
    expect(refineData.patches.tokens.some((t: any) => t.path === "sys.color.primary" && t.value === "#0044cc")).toBe(true);

    try {
      fs.rmSync(path.join(process.cwd(), ".tds"), { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });
});
