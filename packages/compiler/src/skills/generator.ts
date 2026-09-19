import fs from "node:fs";
import path from "node:path";

export interface SkillGeneratorOptions {
  designSystemName?: string;
  version?: string;
  targetFramework?: "react" | "vue" | "svelte" | "vanilla" | "all";
}

export interface SkillEmitOptions extends SkillGeneratorOptions {
  alsoLinkClaude?: boolean;
}

export interface GeneratedSkill {
  skillMd: string;
  referenceFiles?: Record<string, string>;
}

/**
 * Generates the ambient tds-knowledge Agent Skill (SKILL.md).
 * Follows the open Agent Skills standard (YAML frontmatter + markdown).
 */
export function generateTdsKnowledgeSkill(options: SkillGeneratorOptions = {}): GeneratedSkill {
  const dsName = options.designSystemName || "Trainable DS";
  const version = options.version || "1.7.0";

  const skillMd = `---
name: tds-knowledge
description: "Authoritative design system knowledge, tokens, components, and constraints for ${dsName} (v${version}). Enforces zero raw hex, 8dp spatial quantum, 48px touch targets, RTL logical properties, sentence case, and zero feature hallucination."
invocation: automatic
reads:
  - ".design-system/tokens.json"
  - ".design-system/components.json"
  - "DESIGN.md"
writes: none
executes: none
---

# ${dsName} Knowledge Skill (v${version})

This skill provides version-exact guidance and strict invariants for the ${dsName} design system installed in this project.
Your AI coding tool automatically activates this skill whenever you generate, review, or modify frontend UI code.

---

## 1. Core Token Invariants (Zero Raw Values)
- **Zero Raw Colors:** Never write inline hex colors (\`#...\`), RGB, or HSL strings. Always use semantic design tokens:
  - Backgrounds: \`bg-surface\`, \`bg-surface-container-low\`, \`bg-surface-container-high\`, \`bg-primary\`, \`bg-secondary-container\`
  - Text & Icons: \`text-on-surface\`, \`text-on-surface-variant\`, \`text-on-primary\`, \`text-primary\`
  - Outlines: \`border-outline\`, \`border-outline-variant\`
- **Accessible On-Color Pairing:** Never place arbitrary text colors over colored backgrounds. Always pair tokens:
  - \`bg-primary\` ➔ \`text-on-primary\`
  - \`bg-secondary-container\` ➔ \`text-on-secondary-container\`
  - \`bg-surface-container\` ➔ \`text-on-surface\`

---

## 2. Spatial Grid & Geometry (8dp Quantum)
- **Quantum Spacing:** Spacing must strictly adhere to the 4px/8px grid scale.
  - Allowed: \`p-1\` (4px), \`p-2\` (8px), \`p-3\` (12px), \`p-4\` (16px), \`p-6\` (24px), \`p-8\` (32px), \`gap-4\`
  - Forbidden: Arbitrary Tailwind values like \`p-[13px]\`, \`m-[7px]\`, or arbitrary margins.
- **Touch Target Mandate:** Every interactive element (buttons, icon buttons, chips, form controls, tabs) MUST maintain a minimum bounding box of **48x48px** (\`min-h-[48px] min-w-[48px]\`) for WCAG 2.1 AA and M3 compliance.
- **Bi-Directional RTL Directionality:** Never use physical directional properties (\`ml-\`, \`mr-\`, \`pl-\`, \`pr-\`). Use logical CSS properties:
  - Margin: \`ms-*\` (start), \`me-*\` (end)
  - Padding: \`ps-*\` (start), \`pe-*\` (end)

---

## 3. Component Reuse & JIT Retrieval
- **No Reinvented HTML Primitives:** Never write raw \`<button>\` or \`<input>\` elements with custom styling. Always import and use certified design system components from \`components/ui/\` (\`<Button>\`, \`<TextField>\`, \`<Card>\`, \`<Chip>\`, \`<Dialog>\`).
- **Just-In-Time Documentation:** If you need the exact props or code snippet for a component, run:
  \`\`\`bash
  npx tds doc <ComponentName>
  \`\`\`
  Or query the MCP server tool \`get_component_code\`.

---

## 4. Strict Command & Sketch Fidelity (Zero Feature Hallucination)
- **Strict Adherence:** When building UI from a user prompt, sketch, wireframe, or screenshot, strictly implement **ONLY** what the user requested or drew.
- **Zero Feature Invention:** NEVER invent, assume, or inject unrequested features, action tiles, toggles, or buttons (e.g. heating, horn, tire pressure, extra controls) to fill up empty space.
- **Intentional Whitespace & Placeholder Mandate:** If an area is marked as whitespace (e.g. "Whitespace (for now)") or left blank:
  1. Proactively ask the user if they wish to add features there, OR
  2. Render an explicit, styled placeholder container clearly indicating the space is intentionally preserved.

---

## 5. Explicit Scope Invariants & Boundaries (Negative Constraints)
To ensure safety and prevent regression drift, this skill enforces strict task boundaries:
- **DO NOT** alter business logic, state management, API routes, or data fetching queries.
- **DO NOT** perform general code refactoring or reformat unrelated source code.
- **ONLY** operate on UI markup, design tokens, component bindings, spacing, and accessibility attributes.

---

## 6. Verification
Before finalizing any UI code, verify compliance by running:
\`\`\`bash
npx tds evaluate <filepath>
\`\`\`
Ensure the compliance score reaches **100/100 (CERTIFIED COMPLIANT)**.
`;

  return { skillMd };
}

/**
 * Generates the explicit tds-audit Agent Skill (SKILL.md).
 * Used to audit applications for design system compliance and deprecations.
 */
export function generateTdsAuditSkill(options: SkillGeneratorOptions = {}): GeneratedSkill {
  const dsName = options.designSystemName || "Trainable DS";
  const version = options.version || "1.7.0";

  const skillMd = `---
name: tds-audit
description: "Scans project code against ${dsName} (v${version}) compliance invariants, deprecated tokens, and accessibility standards without mutating code. Produces timestamped reports in .tds/audits/<runId>/."
invocation: explicit
reads:
  - "Project source files (tsx, jsx, vue, svelte, html, css)"
  - ".design-system/tokens.json"
  - ".design-system/migrations.json"
writes:
  - ".tds/audits/<runId>/report.md"
  - ".tds/audits/<runId>/summary.json"
executes:
  - "npx tds audit"
---

# ${dsName} Audit Skill (v${version})

The \`tds-audit\` skill scans a project or directory for design system compliance violations, deprecated tokens, and accessibility issues.
It is **read-only**: it produces structured, timestamped audit reports but never mutates your code.

---

## Invocation Syntax
Invoke this skill explicitly in your AI coding tool:
\`\`\`
/tds-audit [path]
\`\`\`
Example:
\`\`\`
/tds-audit src/components
\`\`\`

---

## What It Audits
1. **Raw Hex Colors (\`TDS-RAW-COLOR\`):** Hardcoded hex codes (\`#2563eb\`, \`#ffffff\`) instead of semantic tokens.
2. **Non-Quantum Spacing (\`TDS-NON-QUANTUM-SPACING\`):** Arbitrary pixel paddings or margins (e.g. \`p-[13px]\`).
3. **Reinvented Components (\`TDS-REINVENTED-COMPONENT\`):** Raw \`<button>\` or \`<input>\` instead of \`<Button>\` or \`<TextField>\`.
4. **On-Color Contrast Mismatches (\`TDS-M3-ON-COLOR-MISMATCH\`):** Unpaired text colors on colored backgrounds.
5. **Touch Target Deficits (\`TDS-TOUCH-TARGET-TOO-SMALL\`):** Interactive elements smaller than 48x48px.
6. **Physical Directionality (\`TDS-RTL-NON-LOGICAL\`):** Physical \`ml-\`/\`pr-\` classes instead of RTL-safe \`ms-\`/\`pe-\`.
7. **Deprecated APIs & Tokens (\`TDS-DEPRECATED-TOKEN\`):** Tokens scheduled for removal according to \`.design-system/migrations.json\`.

---

## Output Artifacts
Every audit run creates a fresh, timestamped directory under \`.tds/audits/<runId>/\`:
- \`summary.json\`: Machine-readable run metadata, coverage, overall compliance score, and total violation counts.
- \`report.md\`: Executive markdown report with file-by-file violation tables, line numbers, and copy-paste remediation diffs.

---

## Acting on the Audit Report
After running an audit, review the findings in \`.tds/audits/<runId>/report.md\`.
To fix violations in a specific file, prompt your AI assistant using the ambient \`tds-knowledge\` skill:
\`\`\`
Fix the design system violations in <filepath> according to .tds/audits/<runId>/report.md
\`\`\`
`;

  return { skillMd };
}

/**
 * Emits .agents/skills/tds-knowledge and .agents/skills/tds-audit into workspace.
 */
export async function emitAgentSkills(
  workspaceDir: string = process.cwd(),
  options: SkillEmitOptions = {}
): Promise<{ knowledgePath: string; auditPath: string }> {
  const baseSkillsDir = path.join(workspaceDir, ".agents", "skills");
  const knowledgeDir = path.join(baseSkillsDir, "tds-knowledge");
  const auditDir = path.join(baseSkillsDir, "tds-audit");

  fs.mkdirSync(knowledgeDir, { recursive: true });
  fs.mkdirSync(auditDir, { recursive: true });

  const knowledgeSkill = generateTdsKnowledgeSkill(options);
  const auditSkill = generateTdsAuditSkill(options);

  const knowledgePath = path.join(knowledgeDir, "SKILL.md");
  const auditPath = path.join(auditDir, "SKILL.md");

  fs.writeFileSync(knowledgePath, knowledgeSkill.skillMd, "utf-8");
  fs.writeFileSync(auditPath, auditSkill.skillMd, "utf-8");

  // Optional: Also sync to .claude/skills/ if requested or if .claude exists
  const claudeDir = path.join(workspaceDir, ".claude", "skills");
  if (options.alsoLinkClaude || fs.existsSync(path.join(workspaceDir, ".claude"))) {
    fs.mkdirSync(path.join(claudeDir, "tds-knowledge"), { recursive: true });
    fs.mkdirSync(path.join(claudeDir, "tds-audit"), { recursive: true });
    fs.writeFileSync(path.join(claudeDir, "tds-knowledge", "SKILL.md"), knowledgeSkill.skillMd, "utf-8");
    fs.writeFileSync(path.join(claudeDir, "tds-audit", "SKILL.md"), auditSkill.skillMd, "utf-8");
  }

  return { knowledgePath, auditPath };
}
