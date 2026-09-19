/**
 * Trainable DS — Compiler Rules Emitter
 * Generates IDE and AI agent rule files (.cursor/rules, CLAUDE.md, AGENTS.md, GEMINI.md)
 */

/**
 * Generates Cursor rules file (.cursor/rules/design-system.mdc)
 */
export function generateCursorRules(designSystemName: string): string {
  return `---
description: Design System Rules and Constraints for ${designSystemName}
globs: **/*.{tsx,jsx,vue,svelte,html,css}
alwaysApply: true
---

# ${designSystemName} Design System Rules

You MUST follow the project design system defined in \`DESIGN.md\`, \`.design-system/\`, and \`.agents/skills/tds-knowledge/SKILL.md\`:
1. **NO RAW HEX CODES:** Never write inline hex colors (\`#...\`) or raw RGB/HSL. Use semantic tokens (\`bg-brand-primary\`, \`text-on-primary\`).
2. **NO REINVENTED HTML PRIMITIVES:** Always check \`DESIGN.md\` Section 3 or query MCP for certified components (\`<Button>\`, \`<TextField>\`, \`<Card>\`, \`<NavTab>\`). Do not write raw \`<button>\` or \`<input>\`.
3. **SENTENCE CASE:** All button labels, chip texts, and headers MUST be sentence case (e.g. "Create invoice", not "Create Invoice").
4. **TOUCH TARGETS:** All interactive elements must maintain at least 48x48px touch targets.
5. **STRICT SPEC & SKETCH FIDELITY (ZERO FEATURE HALLUCINATION):** Strictly adhere to what the user explicitly requested or drew in a sketch, mockup, or wireframe. NEVER invent, assume, or inject unrequested features, action buttons, widgets, or toggles (e.g. heating, flash & horn, tire pressure) to fill space.
6. **INTENTIONAL WHITESPACE & PLACEHOLDER MANDATE:** If an area is marked as whitespace (e.g. "Whitespace (for now)") or left unoccupied in a sketch/prompt, DO NOT invent features to occupy that space. Either ask the user proactively if they wish to add features there, OR render an explicit styled placeholder container indicating the space is intentionally left empty.
7. **SURFACE CONTAINMENT OVER OUTLINES & SHADOWS:** Never add arbitrary \`1px\` borders, outlines, or drop-shadows to cards, panels, or content surfaces. Modern flat container architectures establish visual hierarchy strictly through tonal surface contrast (\`surface-container-lowest\` through \`surface-container-highest\`). Only elements with an explicit \`outlined\` or \`elevated\` variant contract may receive borders or shadows.
8. **SUBPIXEL TEXT RENDERING & FONT-SMOOTHING CONTRACT:** Do NOT blindly apply \`-webkit-font-smoothing: antialiased;\` across stylesheets or root elements. Disabling subpixel rendering strips 100–150 weight units from letterforms on macOS/WebKit and makes typography appear frail. Always default to \`-webkit-font-smoothing: auto;\` unless explicitly mandated by the design system.
9. **INTERACTIVE PSEUDO-STATE FIDELITY:** Never guess or hallucinate hover/active styles (e.g. turning text link-blue or adding random underlines). Adhere strictly to the state contracts in \`components.json\`: navigation tabs/links use subtle color/weight shifts without underlines; editorial headlines underline without changing font color; action buttons use state-layer opacity overlays.
10. **ASSET VECTOR SANCTITY:** Brand marks, company logos, and emblems must ALWAYS be rendered using authentic vector SVGs from \`icons.json\` or inline SVGs. NEVER simulate or approximate brand logos using styled HTML text spans or colored character glyphs.
11. **AGENT SKILLS & AUDIT:** Refer to \`.agents/skills/tds-knowledge/SKILL.md\` for ambient guidelines, or run \`/tds-audit\` (\`npx tds audit\`) to generate an audit report in \`.tds/audits/<runId>/\`.
12. **EVALUATE YOUR CODE:** Run \`npx tds evaluate <file>\` to verify compliance before finalizing work.
`;
}

/**
 * Generates CLAUDE.md block for Claude Code
 */
export function generateClaudeMdBlock(designSystemName: string): string {
  return `
<!-- TRAINABLE_DS_START -->
## Design System Guidelines (${designSystemName})
- The project design system is defined in \`DESIGN.md\` and \`.agents/skills/tds-knowledge/SKILL.md\` adhering to a 3-tier W3C DTCG token architecture.
- Always use semantic color tokens (\`primary\`, \`on-primary\`, \`surface-container\`) and certified components.
- Enforce sentence-case labels on buttons, tabs, and headers.
- **Strict Command & Sketch Fidelity (Zero Feature Hallucination):** Strictly adhere to the user's explicit instructions or sketches. NEVER invent or hallucinate unrequested features, widgets, or action tiles (e.g. horn, heating, tire pressure) to fill empty space.
- **Whitespace & Placeholder Rule:** If an area is marked as whitespace (e.g. "Whitespace (for now)") or left blank, either ask the user proactively before adding features or render an explicit placeholder container indicating the space is intentionally left empty.
- **Surface Containment Over Outlines & Shadows:** Never apply arbitrary borders or shadows to cards/surfaces. Depth is established through the 5-tier Surface Container hierarchy.
- **Subpixel Text Rendering Contract:** Do NOT use \`-webkit-font-smoothing: antialiased;\`. Default to \`-webkit-font-smoothing: auto;\` to preserve subpixel antialiasing and authentic stroke weights.
- **Interactive Pseudo-State Fidelity:** Do not invent hover colors or underlines. Follow \`components.json\` state contracts (navigation tabs use color/weight shift without underline; editorial headlines use underline without color change).
- **Asset Vector Sanctity:** Brand logos and wordmarks must always use authentic vector SVGs from \`icons.json\`. Never simulate logos with styled HTML text spans.
- **Audit & Verification:** Run \`npx tds audit <path>\` to generate persistent reports in \`.tds/audits/\`, or verify single files via \`npx tds evaluate <filepath>\`.
<!-- TRAINABLE_DS_END -->
`;
}

/**
 * Generates AGENTS.md / GEMINI.md block for Google Antigravity
 */
export function generateAntigravityRulesBlock(designSystemName: string): string {
  return `
<!-- TRAINABLE_DS_START -->
## Design System Guidelines (${designSystemName})
- Single Source of Truth: \`DESIGN.md\`, \`llms.txt\`, and \`.agents/skills/tds-knowledge/SKILL.md\` (W3C DTCG 3-tier token architecture).
- Always use semantic color tokens (\`sys.color.primary\`, \`sys.color.on-primary\`, \`sys.color.surface-container\`) and certified components from \`components/ui/\`.
- Query components Just-in-Time: Run \`npx tds doc <ComponentName>\` to get props, variants, and copy-paste snippets without context bloat.
- Enforce sentence-case labels on buttons, tabs, and headers.
- **Strict Command & Sketch Fidelity (Zero Feature Hallucination):** Strictly adhere to the user's explicit instructions, hand-drawn sketches, or wireframes. NEVER hallucinate, assume, or inject unrequested features, action buttons, or widgets (e.g. flash & horn, walk, heating, tire pressure) to fill out a layout.
- **Intentional Whitespace & Placeholder Mandate:** When a region is marked as whitespace (e.g. "Whitespace (for now)") or left blank in a sketch, DO NOT unilaterally invent features to occupy it. You MUST either:
  1. Ask the user proactively if they want specific features added in that space, OR
  2. Render an explicit, styled placeholder container that makes it visually clear the space is intentionally preserved per the sketch.
- **Surface Containment Over Outlines & Shadows:** Cards and panels must NOT receive arbitrary \`1px\` borders or drop shadows. Containment is established via tonal surface contrast (\`surface-container-lowest\` through \`surface-container-highest\`).
- **Subpixel Text Rendering Contract:** Never add \`-webkit-font-smoothing: antialiased;\`. Preserve native subpixel antialiasing with \`-webkit-font-smoothing: auto;\` so font weights match the original design.
- **Interactive Pseudo-State Fidelity:** Never invent hover styles. Obey \`components.json\` state contracts (navigation tabs shift color/weight with no underline; headlines underline with persistent text color).
- **Asset Vector Sanctity:** Brand logos and wordmarks must be rendered with SVG vectors from \`icons.json\`. Do not convert vector marks into HTML text spans.
- **Audit & Verification:** Run \`npx tds audit <path>\` to generate persistent reports in \`.tds/audits/\`, or verify single files via \`npx tds evaluate <filepath>\`.
<!-- TRAINABLE_DS_END -->
`;
}
