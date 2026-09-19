---
name: tds-audit
description: "Scans project code against Trainable DS (v1.7.0) compliance invariants, deprecated tokens, and accessibility standards without mutating code. Produces timestamped reports in .tds/audits/<runId>/."
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

# Trainable DS Audit Skill (v1.7.0)

The `tds-audit` skill scans a project or directory for design system compliance violations, deprecated tokens, and accessibility issues.
It is **read-only**: it produces structured, timestamped audit reports but never mutates your code.

---

## Invocation Syntax
Invoke this skill explicitly in your AI coding tool:
```
/tds-audit [path]
```
Example:
```
/tds-audit src/components
```

---

## What It Audits
1. **Raw Hex Colors (`TDS-RAW-COLOR`):** Hardcoded hex codes (`#2563eb`, `#ffffff`) instead of semantic tokens.
2. **Non-Quantum Spacing (`TDS-NON-QUANTUM-SPACING`):** Arbitrary pixel paddings or margins (e.g. `p-[13px]`).
3. **Reinvented Components (`TDS-REINVENTED-COMPONENT`):** Raw `<button>` or `<input>` instead of `<Button>` or `<TextField>`.
4. **On-Color Contrast Mismatches (`TDS-M3-ON-COLOR-MISMATCH`):** Unpaired text colors on colored backgrounds.
5. **Touch Target Deficits (`TDS-TOUCH-TARGET-TOO-SMALL`):** Interactive elements smaller than 48x48px.
6. **Missing Accessible Names (`TDS-MISSING-ACCESSIBLE-NAME`):** Icon buttons or icon-only actions lacking an `aria-label`.
7. **Stripped Focus Outlines (`TDS-FOCUS-OUTLINE-STRIPPED`):** `outline-none` without an accessible `focus-visible:ring-*` replacement.
8. **Arbitrary Typography (`TDS-ARBITRARY-TYPOGRAPHY`):** Arbitrary font sizes (`text-[17px]`), weights, or leading outside the typescale ladder.
9. **Fixed Viewport Breakage (`TDS-FIXED-VIEWPORT-BREAKAGE`):** Hardcoded wide container widths causing mobile overflow.
10. **Physical Directionality (`TDS-RTL-NON-LOGICAL`):** Physical `ml-`/`pr-` classes instead of RTL-safe `ms-`/`pe-`.
11. **Deprecated APIs & Tokens (`TDS-DEPRECATED-TOKEN`):** Tokens scheduled for removal according to `.design-system/migrations.json`.

---

## Output Artifacts
Every audit run creates a fresh, timestamped directory under `.tds/audits/<runId>/`:
- `summary.json`: Machine-readable run metadata, coverage, overall compliance score, and total violation counts.
- `report.md`: Executive markdown report with file-by-file violation tables, line numbers, and copy-paste remediation diffs.

---

## Acting on the Audit Report
After running an audit, review the findings in `.tds/audits/<runId>/report.md`.
To fix violations in a specific file, prompt your AI assistant using the ambient `tds-knowledge` skill:
```
Fix the design system violations in <filepath> according to .tds/audits/<runId>/report.md
```
