import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  generateTdsKnowledgeSkill,
  generateTdsAuditSkill,
  emitAgentSkills,
} from "./generator.js";

describe("Agent Skills Generator", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tds-skills-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("generates tds-knowledge SKILL.md with open standard frontmatter", () => {
    const skill = generateTdsKnowledgeSkill({ designSystemName: "My Brand", version: "2.0.0" });
    expect(skill.skillMd).toContain("name: tds-knowledge");
    expect(skill.skillMd).toContain("invocation: automatic");
    expect(skill.skillMd).toContain("# My Brand Knowledge Skill (v2.0.0)");
    expect(skill.skillMd).toContain("Zero Raw Colors");
    expect(skill.skillMd).toContain("48x48px");
    expect(skill.skillMd).toContain("Zero Feature Hallucination");
    expect(skill.skillMd).toContain("Explicit Scope Invariants & Boundaries");
  });

  it("generates tds-audit SKILL.md with explicit invocation frontmatter", () => {
    const skill = generateTdsAuditSkill({ designSystemName: "My Brand", version: "2.0.0" });
    expect(skill.skillMd).toContain("name: tds-audit");
    expect(skill.skillMd).toContain("invocation: explicit");
    expect(skill.skillMd).toContain("/tds-audit [path]");
    expect(skill.skillMd).toContain(".tds/audits/<runId>/");
    expect(skill.skillMd).toContain("summary.json");
    expect(skill.skillMd).toContain("report.md");
  });

  it("emits skills into .agents/skills/ directory cleanly", async () => {
    const res = await emitAgentSkills(tempDir, { designSystemName: "Test DS" });
    expect(fs.existsSync(res.knowledgePath)).toBe(true);
    expect(fs.existsSync(res.auditPath)).toBe(true);

    const knowledgeContent = fs.readFileSync(res.knowledgePath, "utf-8");
    expect(knowledgeContent).toContain("name: tds-knowledge");

    const auditContent = fs.readFileSync(res.auditPath, "utf-8");
    expect(auditContent).toContain("name: tds-audit");
  });
});
