import { ColorBlueprint } from "./types.js";

/**
 * Parsed light-dark CSS function: light-dark(lightVal, darkVal)
 */
export interface ParsedLightDark {
  light: string;
  dark: string;
}

/**
 * Parses a CSS light-dark() string into light and dark values.
 * Example: "light-dark(#fff, hsl(225 66.7% 1.2%))"
 */
export function parseLightDark(cssVal: string): ParsedLightDark | null {
  const match = cssVal.trim().match(/^light-dark\(\s*([^,]+)\s*,\s*(.+)\s*\)$/i);
  if (!match) return null;
  return {
    light: match[1].trim(),
    dark: match[2].trim()
  };
}

/**
 * Checks if a string is a light-dark() CSS function.
 */
export function isLightDarkFunction(val: string): boolean {
  return /^\s*light-dark\(/i.test(val.trim());
}

/**
 * Serializes a ColorBlueprint into DTCG-compliant JSON tokens.
 */
export function serializeColorToDTCG(blueprint: ColorBlueprint): Record<string, unknown> {
  const tokens: Record<string, unknown> = {};

  // Surfaces
  tokens["surface"] = {
    canvas: {
      $value: blueprint.surfaces.canvas,
      $type: "color",
      $description: "Base page canvas background"
    },
    default: {
      $value: blueprint.surfaces.surface,
      $type: "color",
      $description: "Standard card / component container surface"
    },
    frosted: {
      $value: blueprint.surfaces.frosted || "transparent",
      $type: "color",
      $description: "Translucent frosted glass background"
    },
    backdrop: {
      $value: blueprint.surfaces.backdrop,
      $type: "color",
      $description: "Modal / scrim backdrop"
    }
  };

  // Foregrounds / Contrast Ramp
  tokens["on-surface"] = {
    primary: {
      $value: blueprint.foregrounds.primary,
      $type: "color",
      $description: "Primary high-contrast text and icons"
    },
    high: {
      $value: blueprint.foregrounds.contrastHigh,
      $type: "color",
      $description: "Secondary high-contrast copy"
    },
    medium: {
      $value: blueprint.foregrounds.contrastMedium,
      $type: "color",
      $description: "Tertiary medium-contrast text / placeholders"
    },
    low: {
      $value: blueprint.foregrounds.contrastLow,
      $type: "color",
      $description: "Decorative low-contrast non-text elements"
    },
    lower: {
      $value: blueprint.foregrounds.contrastLower,
      $type: "color",
      $description: "Subtle dividers and borders"
    }
  };

  // Brand
  tokens["brand"] = {
    primary: {
      $value: blueprint.brand.primary,
      $type: "color",
      $description: "Brand interactive primary"
    },
    "on-primary": {
      $value: blueprint.brand.onPrimary,
      $type: "color",
      $description: "Text on brand primary"
    }
  };

  // Semantics
  for (const [intent, color] of Object.entries(blueprint.semantics)) {
    tokens[intent] = {
      base: { $value: color.base, $type: "color" },
      "on-base": { $value: color.onBase, $type: "color" }
    };
  }

  return tokens;
}
