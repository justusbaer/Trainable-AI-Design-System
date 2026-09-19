import { TypographyBlueprint, TypescaleStep, LeadingDefinition, ScriptFallbackStrategy } from "./types.js";

/**
 * Parsed CSS clamp expression: clamp(min, preferred, max)
 */
export interface ParsedClamp {
  min: string;
  preferred: string;
  max: string;
  minPx?: number;
  maxPx?: number;
  vwSlope?: number;
}

/**
 * Parses a CSS clamp() string into its constituent parts.
 * Example: "clamp(1.13rem, 0.21vw + 1.08rem, 1.33rem)"
 */
export function parseClamp(clampStr: string): ParsedClamp | null {
  const match = clampStr.trim().match(/^clamp\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i);
  if (!match) return null;

  const min = match[1].trim();
  const preferred = match[2].trim();
  const max = match[3].trim();

  // Extract vw slope if present
  const vwMatch = preferred.match(/([0-9.]+)\s*vw/i);
  const vwSlope = vwMatch ? parseFloat(vwMatch[1]) : undefined;

  return {
    min,
    preferred,
    max,
    vwSlope
  };
}

/**
 * Checks whether a given size string is a fluid clamp expression.
 */
export function isFluidClamp(sizeStr: string): boolean {
  return /^\s*clamp\(/i.test(sizeStr.trim());
}

/**
 * Known standard modular scale ratios
 */
export const MODULAR_SCALE_RATIOS: Record<string, number> = {
  "minor-second": 1.067,
  "major-second": 1.125,
  "minor-third": 1.200,
  "major-third": 1.250,
  "perfect-fourth": 1.333,
  "augmented-fourth": 1.414,
  "perfect-fifth": 1.500,
  "golden-ratio": 1.618
};

/**
 * Estimates the modular scale ratio from a sorted array of pixel font sizes.
 */
export function estimateModularRatio(pixelSizes: number[]): { ratio: number; closestName: string; confidence: number } | null {
  if (pixelSizes.length < 3) return null;

  const sorted = [...pixelSizes].sort((a, b) => a - b);
  const consecutiveRatios: number[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] > 0) {
      consecutiveRatios.push(sorted[i + 1] / sorted[i]);
    }
  }

  if (consecutiveRatios.length === 0) return null;

  const avgRatio = consecutiveRatios.reduce((acc, r) => acc + r, 0) / consecutiveRatios.length;

  let closestName = "custom";
  let minDiff = Infinity;

  for (const [name, ratio] of Object.entries(MODULAR_SCALE_RATIOS)) {
    const diff = Math.abs(avgRatio - ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closestName = name;
    }
  }

  const confidence = Math.max(0, 1 - minDiff * 3);

  return {
    ratio: Math.round(avgRatio * 1000) / 1000,
    closestName,
    confidence: Math.round(confidence * 100) / 100
  };
}

/**
 * Validates a script fallback strategy against performance best practices.
 * Invariant: CJK fonts should NEVER be bundled as webfonts if they exceed 5MB,
 * and should use system-os fallbacks with :lang() selectors.
 */
export function validateScriptFallback(strategy: ScriptFallbackStrategy): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (strategy.script === "cjk") {
    if (strategy.strategy === "brand-webfont") {
      warnings.push(
        "CRITICAL: CJK scripts bundled as webfonts typically add 15-30MB of payload, severely harming Core Web Vitals (LCP/FCP). Use 'system-os' strategy."
      );
    }
    if (!strategy.selector || !strategy.selector.includes(":lang")) {
      warnings.push(
        "HIGH: CJK fallback must specify a :lang() selector (e.g. :lang(zh-Hans), :lang(ja)) to enable automatic script swapping without DOM mutation."
      );
    }
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Generates DTCG-compliant token definitions from a TypographyBlueprint.
 */
export function serializeTypographyToDTCG(blueprint: TypographyBlueprint): Record<string, unknown> {
  const tokens: Record<string, unknown> = {};

  // Font family
  tokens["font-family"] = {
    brand: {
      $value: blueprint.brandTypeface.stack,
      $type: "fontFamily",
      $description: `Primary brand font: ${blueprint.brandTypeface.family}`
    }
  };

  // Typescale
  const typescaleTokens: Record<string, unknown> = {};
  for (const [key, step] of Object.entries(blueprint.typescale.scale)) {
    typescaleTokens[key] = {
      $value: step.size,
      $type: "dimension",
      $description: `${key} font size (${step.fluid ? "fluid clamp" : "static"})`,
      "tds:fluid": step.fluid,
      "tds:pixelEquiv": step.pixelEquiv
    };
  }
  tokens["font-size"] = typescaleTokens;

  // Leading
  tokens["line-height"] = {
    normal: {
      $value: blueprint.leading.normal,
      $type: "dimension",
      $description: `Base line-height (${blueprint.leading.model})`
    }
  };

  // Font weights
  const weightTokens: Record<string, unknown> = {};
  for (const [key, weight] of Object.entries(blueprint.weights)) {
    weightTokens[key] = {
      $value: weight,
      $type: "fontWeight",
      $description: `${key} font weight`
    };
  }
  tokens["font-weight"] = weightTokens;

  return tokens;
}
