import { ShapeBlueprint, CornerRadiusTier } from "./types.js";

/**
 * Standard corner radius hierarchy roles
 */
export const STANDARD_RADIUS_TIERS: Record<string, { minPx: number; maxPx: number; description: string }> = {
  micro: { minPx: 2, maxPx: 4, description: "Context menus, popovers, tooltips" },
  small: { minPx: 6, maxPx: 10, description: "Chips, selection controls, input fields, sub-cards" },
  medium: { minPx: 12, maxPx: 18, description: "Cards, continuous section containers, weather cards" },
  large: { minPx: 24, maxPx: 32, description: "Dialogs, modals, bottom sheets" },
  pill: { minPx: 999, maxPx: 99999, description: "Pills, search bars, action buttons" }
};

/**
 * Classifies a pixel radius into the standard radius hierarchy.
 */
export function classifyRadius(pxValue: number): string {
  if (pxValue >= 999) return "pill";
  if (pxValue >= 24) return "large";
  if (pxValue >= 12) return "medium";
  if (pxValue >= 6) return "small";
  if (pxValue >= 2) return "micro";
  return "none";
}

/**
 * Serializes a ShapeBlueprint into DTCG-compliant tokens.
 */
export function serializeShapeToDTCG(blueprint: ShapeBlueprint): Record<string, unknown> {
  const tokens: Record<string, unknown> = {};

  // Corner radii
  const radiusTokens: Record<string, unknown> = {};
  for (const [key, tier] of Object.entries(blueprint.radiusHierarchy)) {
    radiusTokens[key] = {
      $value: tier.value,
      $type: "dimension",
      $description: `Corner radius for ${tier.semanticTarget}`,
      "tds:pixelEquiv": tier.pixelEquiv
    };
  }
  tokens["corner-radius"] = radiusTokens;

  // Elevation / Shadows
  const shadowTokens: Record<string, unknown> = {};
  for (const [key, shadow] of Object.entries(blueprint.elevation.shadows)) {
    shadowTokens[key] = {
      $value: shadow.value,
      $type: "shadow",
      $description: `Elevation shadow ${key}`,
      "tds:elevationLevel": shadow.elevationLevel
    };
  }
  tokens["shadow"] = shadowTokens;

  return tokens;
}
