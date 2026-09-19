import { DiagnosticIssue, EvaluationResult } from "../types.js";
import { DesignSystemBlueprint } from "@trainable-ds/core";

const TAILWIND_RADIUS_PX: Record<string, number> = {
  "rounded-none": 0,
  "rounded-sm": 2,
  "rounded": 4,
  "rounded-md": 6,
  "rounded-lg": 8,
  "rounded-xl": 12,
  "rounded-2xl": 16,
  "rounded-3xl": 24,
  "rounded-full": 9999
};

function parseRadiusFromClass(str: string): number | null {
  const explicitMatch = str.match(/\b(?:rounded-\[(\d+)px\]|border-radius:\s*(\d+)px)\b/);
  if (explicitMatch) {
    return parseInt(explicitMatch[1] || explicitMatch[2], 10);
  }
  const namedMatch = str.match(/\b(rounded-(?:none|sm|md|lg|xl|2xl|3xl|full)|rounded)\b/);
  if (namedMatch) {
    const key = namedMatch[1];
    return TAILWIND_RADIUS_PX[key] ?? null;
  }
  return null;
}

/**
 * Dynamically evaluates source code against a given DesignSystemBlueprint contract.
 */
export function evaluateBlueprintCompliance(
  code: string,
  blueprint: DesignSystemBlueprint
): EvaluationResult {
  const diagnostics: DiagnosticIssue[] = [];
  const lines = code.split(/\r?\n/);

  const radiusHierarchy = blueprint.shape.radiusHierarchy;
  const dialogTier = radiusHierarchy["dialog"] || radiusHierarchy["large"] || { value: "28px", pixelEquiv: 28 };
  const menuTier = radiusHierarchy["menu"] || radiusHierarchy["micro"] || { value: "4px", pixelEquiv: 4 };

  lines.forEach((lineText, lineIdx) => {
    const lineNum = lineIdx + 1;

    // 1. Font Smoothing Invariant
    if (blueprint.typography.rendering.fontSmoothing === "auto") {
      if (/(?:-webkit-font-smoothing:\s*antialiased|\bantialiased\b)/i.test(lineText)) {
        diagnostics.push({
          severity: "HIGH",
          code: "TDS-FONT-SMOOTHING-DEGRADATION",
          line: lineNum,
          message: `Blueprint '${blueprint.metadata.name}' mandates authentic subpixel rendering. Grayscale antialiasing strips stroke weight on macOS/WebKit.`,
          remediation: "Use '-webkit-font-smoothing: auto;' or remove .antialiased class."
        });
      }
    }

    // 2. Flat Surface Container Invariant (No ghost borders or shadows)
    if (blueprint.shape.elevation.primaryStrategy === "flat-surface") {
      if (
        /\b(?:card|story-card|surface-container)\b/i.test(lineText) &&
        !/\b(?:showcase|outlined|variant=["']outlined["'])\b/i.test(lineText) &&
        /\b(?:border(?:-\[[^\]]+\])?|border-outline)\b/.test(lineText) &&
        !/\bborder-(?:none|0|transparent)\b/.test(lineText)
      ) {
        diagnostics.push({
          severity: "CRITICAL",
          code: "TDS-GHOST-BORDER-HALLUCINATION",
          line: lineNum,
          message: `Flat surface container in '${blueprint.metadata.name}' must not have artificial borders.`,
          remediation: "Remove border or set 'border-none'. Contrast is established via tonal canvas/surface separation."
        });
      }
    }

    // 3. Dialog / Modal Corner Radius Invariant
    if (/\b(?:<Dialog\b|role=["']dialog["']|m3-dialog-card|class=["'][^"']*\bdialog\b)/i.test(lineText)) {
      const expectedPx = dialogTier.pixelEquiv;
      const foundPx = parseRadiusFromClass(lineText);
      if (foundPx !== null && foundPx < expectedPx - 4) {
        diagnostics.push({
          severity: "CRITICAL",
          code: "TDS-DIALOG-SURFACE-SPECS",
          line: lineNum,
          message: `Dialog container uses inadequate corner radius (${foundPx}px). Blueprint requires ${dialogTier.value} (${expectedPx}px).`,
          remediation: `Use 'rounded-[${expectedPx}px]' or 'var(--radius-${dialogTier.name})'.`
        });
      }
    }

    // 4. Floating Menu / Popover Corner Radius Invariant
    if (/\b(?:<Menu\b|role=["']menu["']|context-menu|popover)\b/i.test(lineText)) {
      const expectedPx = menuTier.pixelEquiv;
      const foundPx = parseRadiusFromClass(lineText);
      if (foundPx !== null && foundPx > expectedPx + 4) {
        diagnostics.push({
          severity: "HIGH",
          code: "TDS-FLOATING-MENU-SPECS",
          line: lineNum,
          message: `Floating menu or popover uses oversized corner radius (${foundPx}px). Blueprint requires ${menuTier.value} (${expectedPx}px).`,
          remediation: `Use 'rounded-[${expectedPx}px]' or 'var(--radius-${menuTier.name})'.`
        });
      }
    }

    // 5. Interactive Touch Target Invariant (>= 48x48px)
    if (/\b(?:<Button|<IconButton|role=["']button["'])\b/i.test(lineText)) {
      if (/\b(?:w-[4567]|h-[4567]|w-\[([123]\d)px\]|h-\[([123]\d)px\])\b/.test(lineText)) {
        diagnostics.push({
          severity: "HIGH",
          code: "TDS-TOUCH-TARGET-TOO-SMALL",
          line: lineNum,
          message: "Interactive control appears smaller than minimum 48x48px bounding box required for accessibility.",
          remediation: "Ensure interactive element provides min-h-[48px] min-w-[48px] or adequate click/touch padding."
        });
      }
    }
  });

  let score = 100;
  for (const diag of diagnostics) {
    if (diag.severity === "CRITICAL") score -= 25;
    else if (diag.severity === "HIGH") score -= 15;
    else if (diag.severity === "MEDIUM") score -= 8;
    else if (diag.severity === "LOW") score -= 3;
  }
  score = Math.max(0, score);

  return {
    certified: diagnostics.length === 0,
    score,
    summary: diagnostics.length === 0
      ? `Certified 100% compliant with '${blueprint.metadata.name}' blueprint.`
      : `${diagnostics.length} violation(s) found against '${blueprint.metadata.name}'. Score: ${score}/100.`,
    diagnostics
  };
}
