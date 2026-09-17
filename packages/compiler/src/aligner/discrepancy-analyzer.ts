import { HarvestedElement, HarvestedSystemSnapshot } from "./deep-harvester.js";

export interface DiscrepancyItem {
  id: string;
  category: "geometry" | "color" | "typography" | "material";
  componentRole: string;
  property: string;
  observedValue: string | number;
  currentValue: string | number;
  severity: "high" | "medium" | "low";
  remediation: string;
}

export interface DriftReport {
  score: number; // 0 - 100
  previousScore?: number;
  isConverged: boolean;
  threshold: number;
  discrepancies: DiscrepancyItem[];
  categoryScores: {
    geometry: number;
    color: number;
    typography: number;
    material: number;
  };
}

/**
 * Calculates Euclidean distance between two hex/RGB colors normalized to 0-100.
 */
function calculateColorDelta(hex1: string, hex2: string): number {
  if (!hex1 || !hex2) return 100;
  if (hex1.toLowerCase() === hex2.toLowerCase()) return 0;

  const parse = (h: string) => {
    const clean = h.replace('#', '');
    if (clean.length === 6) {
      return [
        parseInt(clean.slice(0, 2), 16),
        parseInt(clean.slice(2, 4), 16),
        parseInt(clean.slice(4, 6), 16)
      ];
    }
    return [0, 0, 0];
  };

  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);

  const dist = Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );

  // Max distance is sqrt(255^2 * 3) ~= 441.67
  return (dist / 441.67) * 100;
}

/**
 * Analyzes drift between observed source of truth and current extracted design system elements.
 */
export function analyzeDrift(
  sourceSnapshot: HarvestedSystemSnapshot,
  extractedSnapshot: HarvestedSystemSnapshot,
  threshold = 95,
  previousScore?: number
): DriftReport {
  const discrepancies: DiscrepancyItem[] = [];

  // Categorize elements by role
  const sourceByRole = new Map<string, HarvestedElement>();
  sourceSnapshot.elements.forEach((e: HarvestedElement) => {
    if (!sourceByRole.has(e.role)) sourceByRole.set(e.role, e);
  });

  const extractedByRole = new Map<string, HarvestedElement>();
  extractedSnapshot.elements.forEach((e: HarvestedElement) => {
    if (!extractedByRole.has(e.role)) extractedByRole.set(e.role, e);
  });

  let geomPenalties = 0;
  let colorPenalties = 0;
  let typoPenalties = 0;
  let matPenalties = 0;

  let totalComparisons = 0;

  // Key roles to compare
  const rolesToAudit = ["button.primary", "button.secondary", "card", "heading.h1", "text-field"];

  for (const role of rolesToAudit) {
    const src = sourceByRole.get(role);
    const ext = extractedByRole.get(role);
    if (!src || !ext) continue;

    totalComparisons++;

    // 1. Geometry: Border Radius (Pill vs Rectangle check)
    if (src.geometry.isPill !== ext.geometry.isPill) {
      geomPenalties += 35;
      discrepancies.push({
        id: `${role}-border-radius-shape`,
        category: "geometry",
        componentRole: role,
        property: "borderRadius",
        observedValue: src.geometry.isPill ? "pill (9999px)" : `${src.geometry.borderRadius}px`,
        currentValue: ext.geometry.isPill ? "pill (9999px)" : `${ext.geometry.borderRadius}px`,
        severity: "high",
        remediation: `Set ${role} corner radius to ${src.geometry.isPill ? "9999px (full pill)" : src.geometry.borderRadius + "px"}`
      });
    } else if (Math.abs(src.geometry.borderRadius - ext.geometry.borderRadius) > 4) {
      geomPenalties += 15;
      discrepancies.push({
        id: `${role}-border-radius-val`,
        category: "geometry",
        componentRole: role,
        property: "borderRadius",
        observedValue: `${src.geometry.borderRadius}px`,
        currentValue: `${ext.geometry.borderRadius}px`,
        severity: "medium",
        remediation: `Adjust ${role} corner radius to ${src.geometry.borderRadius}px`
      });
    }

    // Geometry: Padding
    const pTopDiff = Math.abs(src.geometry.padding.top - ext.geometry.padding.top);
    const pRightDiff = Math.abs(src.geometry.padding.right - ext.geometry.padding.right);
    if (pTopDiff > 6 || pRightDiff > 8) {
      geomPenalties += 20;
      discrepancies.push({
        id: `${role}-padding`,
        category: "geometry",
        componentRole: role,
        property: "padding",
        observedValue: `${src.geometry.padding.top}px ${src.geometry.padding.right}px`,
        currentValue: `${ext.geometry.padding.top}px ${ext.geometry.padding.right}px`,
        severity: "medium",
        remediation: `Align ${role} padding to ${src.geometry.padding.top}px vertical, ${src.geometry.padding.right}px horizontal`
      });
    }

    // 2. Color Drift
    const colorDist = calculateColorDelta(src.material.backgroundColor.hex, ext.material.backgroundColor.hex);
    if (colorDist > 15) {
      colorPenalties += 25;
      discrepancies.push({
        id: `${role}-bg-color`,
        category: "color",
        componentRole: role,
        property: "backgroundColor",
        observedValue: src.material.backgroundColor.hex,
        currentValue: ext.material.backgroundColor.hex,
        severity: colorDist > 40 ? "high" : "medium",
        remediation: `Align ${role} background color to ${src.material.backgroundColor.hex}`
      });
    }

    // 3. Material: Opacity & Glassmorphism
    const alphaDiff = Math.abs(src.material.backgroundColor.alpha - ext.material.backgroundColor.alpha);
    if (alphaDiff > 0.2) {
      matPenalties += 25;
      discrepancies.push({
        id: `${role}-bg-alpha`,
        category: "material",
        componentRole: role,
        property: "backgroundColor.alpha",
        observedValue: src.material.backgroundColor.alpha.toFixed(2),
        currentValue: ext.material.backgroundColor.alpha.toFixed(2),
        severity: "medium",
        remediation: `Set ${role} background opacity to ${src.material.backgroundColor.alpha}`
      });
    }

    // 4. Typography (if present)
    if (src.typography && ext.typography) {
      if (src.typography.primaryFont.toLowerCase() !== ext.typography.primaryFont.toLowerCase()) {
        typoPenalties += 25;
        discrepancies.push({
          id: `${role}-font-family`,
          category: "typography",
          componentRole: role,
          property: "fontFamily",
          observedValue: src.typography.primaryFont,
          currentValue: ext.typography.primaryFont,
          severity: "high",
          remediation: `Set primary font family to "${src.typography.primaryFont}"`
        });
      }

      if (Math.abs(src.typography.fontWeight - ext.typography.fontWeight) > 150) {
        typoPenalties += 15;
        discrepancies.push({
          id: `${role}-font-weight`,
          category: "typography",
          componentRole: role,
          property: "fontWeight",
          observedValue: src.typography.fontWeight,
          currentValue: ext.typography.fontWeight,
          severity: "medium",
          remediation: `Adjust ${role} font weight to ${src.typography.fontWeight}`
        });
      }
    }

    // 5. Material: Border Containment (Zero Ghost Outlines on Cards)
    if (role === "card") {
      const srcHasBorder = Boolean(src.material.hasBorder || (src.material.borderWidth && src.material.borderWidth > 0));
      const extHasBorder = Boolean(ext.material.hasBorder || (ext.material.borderWidth && ext.material.borderWidth > 0));
      if (srcHasBorder !== extHasBorder) {
        matPenalties += 30;
        discrepancies.push({
          id: `${role}-border-containment`,
          category: "material",
          componentRole: role,
          property: "border",
          observedValue: srcHasBorder ? `${src.material.borderWidth}px border` : "none (flat surface)",
          currentValue: extHasBorder ? `${ext.material.borderWidth || 1}px border` : "none (flat surface)",
          severity: "high",
          remediation: srcHasBorder
            ? `Add ${src.material.borderWidth || 1}px border to card container`
            : "Remove artificial border from card; modern cards establish depth through tonal surface contrast without outlines."
        });
      }
    }
  }

  // 6. Font Smoothing & Subpixel Rendering Audit
  if (sourceSnapshot.fontSmoothing && extractedSnapshot.fontSmoothing) {
    if (sourceSnapshot.fontSmoothing !== extractedSnapshot.fontSmoothing) {
      typoPenalties += 20;
      discrepancies.push({
        id: "typography-font-smoothing",
        category: "typography",
        componentRole: "root",
        property: "webkitFontSmoothing",
        observedValue: sourceSnapshot.fontSmoothing,
        currentValue: extractedSnapshot.fontSmoothing,
        severity: "medium",
        remediation: `Align root text rendering to -webkit-font-smoothing: ${sourceSnapshot.fontSmoothing} to preserve authentic stroke weights.`
      });
    }
  }

  // If no direct role matches were found, do a general brand check
  if (totalComparisons === 0) {
    if (sourceSnapshot.brandColors.canvas && extractedSnapshot.brandColors.canvas) {
      const dist = calculateColorDelta(
        sourceSnapshot.brandColors.canvas.hex,
        extractedSnapshot.brandColors.canvas.hex
      );
      if (dist > 10) colorPenalties += 30;
    }
  }

  const clamp = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

  const geometryScore = clamp(100 - geomPenalties);
  const colorScore = clamp(100 - colorPenalties);
  const typographyScore = clamp(100 - typoPenalties);
  const materialScore = clamp(100 - matPenalties);

  const compositeScore = clamp(
    geometryScore * 0.35 +
    colorScore * 0.30 +
    typographyScore * 0.20 +
    materialScore * 0.15
  );

  return {
    score: compositeScore,
    previousScore,
    isConverged: compositeScore >= threshold,
    threshold,
    discrepancies,
    categoryScores: {
      geometry: geometryScore,
      color: colorScore,
      typography: typographyScore,
      material: materialScore
    }
  };
}
