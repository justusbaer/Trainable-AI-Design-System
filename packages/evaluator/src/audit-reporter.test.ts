import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  auditDirectory,
  discoverAuditFiles,
  checkDeprecations,
} from "./audit-reporter.js";

describe("Audit Reporter Engine", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tds-audit-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("discovers target files and ignores excluded directories", () => {
    fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "node_modules", "pkg"), { recursive: true });

    fs.writeFileSync(path.join(tempDir, "src", "Button.tsx"), "export const B = () => <div />;");
    fs.writeFileSync(path.join(tempDir, "src", "style.css"), ".btn { color: red; }");
    fs.writeFileSync(path.join(tempDir, "src", "ignore.txt"), "hello");
    fs.writeFileSync(path.join(tempDir, "node_modules", "pkg", "Ignored.tsx"), "export const I = () => <div />;");

    const files = discoverAuditFiles(tempDir);
    expect(files.length).toBe(2);
    expect(files.some(f => f.endsWith("Button.tsx"))).toBe(true);
    expect(files.some(f => f.endsWith("style.css"))).toBe(true);
    expect(files.some(f => f.includes("node_modules"))).toBe(false);
  });

  it("identifies deprecated tokens from migrations", () => {
    const code = `const color = "sys.color.oldBrandPrimary";`;
    const migrations = { "sys.color.oldBrandPrimary": "sys.color.primary" };
    const issues = checkDeprecations(code, migrations);
    expect(issues.length).toBe(1);
    expect(issues[0].code).toBe("TDS-DEPRECATED-TOKEN");
    expect(issues[0].remediation).toContain("sys.color.primary");
  });

  it("performs directory audit and writes persistent reports to .tds/audits/<runId>/", async () => {
    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    // File 1: Compliant
    fs.writeFileSync(
      path.join(srcDir, "CompliantCard.tsx"),
      `export const CompliantCard = () => (
        <div className="bg-surface-container-low text-on-surface p-4 rounded-xl">
          <p>Card content</p>
        </div>
      );`
    );

    // File 2: Non-compliant (raw hex, arbitrary spacing)
    fs.writeFileSync(
      path.join(srcDir, "NonCompliantButton.tsx"),
      `export const NonCompliantButton = () => (
        <button className="bg-[#2563eb] text-[#ffffff] p-[13px] h-8">
          Submit Order Now
        </button>
      );`
    );

    const result = await auditDirectory(tempDir, {
      workspaceDir: tempDir,
      runId: "test-run-123",
      writeReport: true,
    });

    expect(result.summary.totalFilesScanned).toBe(2);
    expect(result.summary.compliantFilesCount).toBe(1);
    expect(result.summary.failedFilesCount).toBe(1);
    expect(result.summary.certified).toBe(false);
    expect(result.summary.totalViolations).toBeGreaterThan(0);

    // Verify report files written
    const runDir = path.join(tempDir, ".tds", "audits", "test-run-123");
    expect(fs.existsSync(path.join(runDir, "summary.json"))).toBe(true);
    expect(fs.existsSync(path.join(runDir, "report.md"))).toBe(true);

    const reportMd = fs.readFileSync(path.join(runDir, "report.md"), "utf-8");
    expect(reportMd).toContain("# Trainable DS Compliance Audit Report");
    expect(reportMd).toContain("test-run-123");
    expect(reportMd).toContain("TDS-RAW-COLOR");
    expect(reportMd).toContain("TDS-NON-QUANTUM-SPACING");
    expect(reportMd).toContain("Remediation Instructions for AI Agents");
  });
});
