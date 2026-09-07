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

You MUST follow the project design system defined in \`DESIGN.md\` and \`.design-system/\`:
1. **NO RAW HEX CODES:** Never write inline hex colors (\`#...\`) or raw RGB/HSL. Use semantic tokens (\`bg-brand-primary\`, \`text-on-primary\`).
2. **NO REINVENTED HTML PRIMITIVES:** Always check \`DESIGN.md\` Section 3 or query MCP for certified components (\`<Button>\`, \`<TextField>\`, \`<Card>\`). Do not write raw \`<button>\` or \`<input>\`.
3. **SENTENCE CASE:** All button labels, chip texts, and headers MUST be sentence case (e.g. "Create invoice", not "Create Invoice").
4. **TOUCH TARGETS:** All interactive elements must maintain at least 48x48px touch targets.
5. **STRICT SPEC & SKETCH FIDELITY (ZERO FEATURE HALLUCINATION):** Strictly adhere to what the user explicitly requested or drew in a sketch, mockup, or wireframe. NEVER invent, assume, or inject unrequested features, action buttons, widgets, or toggles (e.g. heating, flash & horn, tire pressure) to fill space.
6. **INTENTIONAL WHITESPACE & PLACEHOLDER MANDATE:** If an area is marked as whitespace (e.g. "Whitespace (for now)") or left unoccupied in a sketch/prompt, DO NOT invent features to occupy that space. Either ask the user proactively if they wish to add features there, OR render an explicit styled placeholder container indicating the space is intentionally left empty.
7. **EVALUATE YOUR CODE:** Run \`npx tds evaluate <file>\` to verify compliance before finalizing work.
`;
}

/**
 * Generates CLAUDE.md block for Claude Code
 */
export function generateClaudeMdBlock(designSystemName: string): string {
  return `
<!-- TRAINABLE_DS_START -->
## Design System Guidelines (${designSystemName})
- The project design system is defined in \`DESIGN.md\` adhering to a 3-tier W3C DTCG token architecture.
- Always use semantic color tokens (\`primary\`, \`on-primary\`, \`surface-container\`) and certified components.
- Enforce sentence-case labels on buttons, tabs, and headers.
- **Strict Command & Sketch Fidelity (Zero Feature Hallucination):** Strictly adhere to the user's explicit instructions or sketches. NEVER invent or hallucinate unrequested features, widgets, or action tiles (e.g. horn, heating, tire pressure) to fill empty space.
- **Whitespace & Placeholder Rule:** If an area is marked as whitespace (e.g. "Whitespace (for now)") or left blank, either ask the user proactively before adding features or render an explicit placeholder container indicating the space is intentionally left empty.
- Verify generated screens by running: \`npx tds evaluate <filepath>\`
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
- Single Source of Truth: \`DESIGN.md\` and \`llms.txt\` (W3C DTCG 3-tier token architecture).
- Always use semantic color tokens (\`sys.color.primary\`, \`sys.color.on-primary\`, \`sys.color.surface-container\`) and certified components from \`components/ui/\`.
- Query components Just-in-Time: Run \`npx tds doc <ComponentName>\` to get props, variants, and copy-paste snippets without context bloat.
- Enforce sentence-case labels on buttons, tabs, and headers.
- **Strict Command & Sketch Fidelity (Zero Feature Hallucination):** Strictly adhere to the user's explicit instructions, hand-drawn sketches, or wireframes. NEVER hallucinate, assume, or inject unrequested features, action buttons, or widgets (e.g. flash & horn, walk, heating, tire pressure) to fill out a layout.
- **Intentional Whitespace & Placeholder Mandate:** When a region is marked as whitespace (e.g. "Whitespace (for now)") or left blank in a sketch, DO NOT unilaterally invent features to occupy it. You MUST either:
  1. Ask the user proactively if they want specific features added in that space, OR
  2. Render an explicit, styled placeholder container that makes it visually clear the space is intentionally preserved per the sketch.
- Verify UI compliance by running: \`npx tds evaluate <filepath>\`.
<!-- TRAINABLE_DS_END -->
`;
}
