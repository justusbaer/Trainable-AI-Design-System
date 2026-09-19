---
name: tds-knowledge
description: "Authoritative design system knowledge, tokens, components, and constraints for Trainable DS (v1.7.0). Enforces zero raw hex, 8dp spatial quantum, 48px touch targets, RTL logical properties, sentence case, and zero feature hallucination."
invocation: automatic
reads:
  - ".design-system/tokens.json"
  - ".design-system/components.json"
  - "DESIGN.md"
writes: none
executes: none
---

# Trainable DS Knowledge Skill (v1.7.0)

This skill provides version-exact guidance and strict invariants for the Trainable DS design system installed in this project.
Your AI coding tool automatically activates this skill whenever you generate, review, or modify frontend UI code.

---

## 1. Core Token Invariants (Zero Raw Values)
- **Zero Raw Colors:** Never write inline hex colors (`#...`), RGB, or HSL strings. Always use semantic design tokens:
  - Backgrounds: `bg-surface`, `bg-surface-container-low`, `bg-surface-container-high`, `bg-primary`, `bg-secondary-container`
  - Text & Icons: `text-on-surface`, `text-on-surface-variant`, `text-on-primary`, `text-primary`
  - Outlines: `border-outline`, `border-outline-variant`
- **Accessible On-Color Pairing:** Never place arbitrary text colors over colored backgrounds. Always pair tokens:
  - `bg-primary` ➔ `text-on-primary`
  - `bg-secondary-container` ➔ `text-on-secondary-container`
  - `bg-surface-container` ➔ `text-on-surface`

---

## 2. Spatial Grid & Geometry (8dp Quantum)
- **Quantum Spacing:** Spacing must strictly adhere to the 4px/8px grid scale.
  - Allowed: `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `gap-4`
  - Forbidden: Arbitrary Tailwind values like `p-[13px]`, `m-[7px]`, or arbitrary margins.
- **Touch Target Mandate:** Every interactive element (buttons, icon buttons, chips, form controls, tabs) MUST maintain a minimum bounding box of **48x48px** (`min-h-[48px] min-w-[48px]`) for WCAG 2.1 AA and M3 compliance.
- **Bi-Directional RTL Directionality:** Never use physical directional properties (`ml-`, `mr-`, `pl-`, `pr-`). Use logical CSS properties:
  - Margin: `ms-*` (start), `me-*` (end)
  - Padding: `ps-*` (start), `pe-*` (end)
- **Fluid Containment (No Fixed Viewport Breakage):** Never set hardcoded container widths (e.g. `w-[600px]`, `w-[1024px]`) that trigger mobile horizontal scrolling. Use fluid widths (`w-full max-w-*`) or responsive breakpoints (`md:w-[...]`).

---

## 3. Accessibility, Focus States & Typography
- **Accessible Name on Icon Controls:** Every icon-only button (`<IconButton>` or `<button><Icon /></button>`) MUST include an `aria-label="Action description"` or visually hidden label text (`<span className="sr-only">`).
- **Focus Rings & State Layers:** Interactive controls must NEVER strip focus outlines (`outline-none`) without providing a visible focus ring replacement: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- **Typescale Ladder:** Never invent arbitrary font sizes (e.g. `text-[17px]`, `font-[550]`, `leading-[23px]`). Strictly use defined typescale tokens (`text-title-medium`, `text-body-large`, `text-label-small`).

---

## 4. Component Reuse & JIT Retrieval
- **No Reinvented HTML Primitives:** Never write raw `<button>` or `<input>` elements with custom styling. Always import and use certified design system components from `components/ui/` (`<Button>`, `<TextField>`, `<Card>`, `<Chip>`, `<Dialog>`).
- **Just-In-Time Documentation:** If you need the exact props or code snippet for a component, run:
  ```bash
  npx tds doc <ComponentName>
  ```
  Or query the MCP server tool `get_component_code`.

---

## 5. Strict Command & Sketch Fidelity (Zero Feature Hallucination)
- **Strict Adherence:** When building UI from a user prompt, sketch, wireframe, or screenshot, strictly implement **ONLY** what the user requested or drew.
- **Zero Feature Invention:** NEVER invent, assume, or inject unrequested features, action tiles, toggles, or buttons (e.g. heating, horn, tire pressure, extra controls) to fill up empty space.
- **Intentional Whitespace & Placeholder Mandate:** If an area is marked as whitespace (e.g. "Whitespace (for now)") or left blank:
  1. Proactively ask the user if they wish to add features there, OR
  2. Render an explicit, styled placeholder container clearly indicating the space is intentionally preserved.

---

## 6. Explicit Scope Invariants & Boundaries (Negative Constraints)
To ensure safety and prevent regression drift, this skill enforces strict task boundaries:
- **DO NOT** alter business logic, state management, API routes, or data fetching queries.
- **DO NOT** perform general code refactoring or reformat unrelated source code.
- **ONLY** operate on UI markup, design tokens, component bindings, spacing, and accessibility attributes.

---

## 7. Verification
Before finalizing any UI code, verify compliance by running:
```bash
npx tds evaluate <filepath>
```
Ensure the compliance score reaches **100/100 (CERTIFIED COMPLIANT)**.
