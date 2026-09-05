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
5. **EVALUATE YOUR CODE:** Run \`npx tds evaluate <file>\` to verify compliance before finalizing work.
`;
}

/**
 * Generates CLAUDE.md block for Claude Code
 */
export function generateClaudeMdBlock(designSystemName: string): string {
  return `
<!-- TRAINABLE_DS_START -->
## Design System Guidelines (${designSystemName})
- The project design system is defined in \`DESIGN.md\` adhering to Material Design 3 (M3).
- Always use semantic color tokens (\`primary\`, \`on-primary\`, \`surface-container\`) and certified components.
- Enforce sentence-case labels on buttons, tabs, and headers.
- Verify generated screens by running: \`npx tds evaluate <filepath>\`
<!-- TRAINABLE_DS_END -->
`;
}
