import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { runAudit } from "./audit.js";

describe("CLI runAudit", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tds-cli-audit-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("runs audit on directory and outputs report", async () => {
    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    fs.writeFileSync(
      path.join(srcDir, "Header.tsx"),
      `export const Header = () => <header className="bg-surface text-on-surface p-4"><h1>Title</h1></header>;`
    );

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runAudit("src", {
      dir: tempDir,
      report: true,
      runId: "cli-audit-run",
    });

    expect(logSpy).toHaveBeenCalled();
    const runDir = path.join(tempDir, ".tds", "audits", "cli-audit-run");
    expect(fs.existsSync(path.join(runDir, "report.md"))).toBe(true);
    expect(fs.existsSync(path.join(runDir, "summary.json"))).toBe(true);

    logSpy.mockRestore();
  });
});
