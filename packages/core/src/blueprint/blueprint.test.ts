import { describe, it, expect } from "vitest";
import {
  parseClamp,
  isFluidClamp,
  estimateModularRatio,
  validateScriptFallback
} from "./typography.js";
import { parseLightDark, isLightDarkFunction } from "./color.js";
import { validateQuantumSpacing } from "./spacing.js";
import { classifyRadius } from "./shape.js";
import { validateTouchTarget } from "./slots.js";
import { HarvesterEngine, RawExtractedTokens } from "./harvester.js";

describe("Typography Blueprint Utilities", () => {
  it("should correctly parse fluid clamp expressions from PDS v4", () => {
    const clampStr = "clamp(1.13rem, 0.21vw + 1.08rem, 1.33rem)";
    expect(isFluidClamp(clampStr)).toBe(true);

    const parsed = parseClamp(clampStr);
    expect(parsed).not.toBeNull();
    expect(parsed?.min).toBe("1.13rem");
    expect(parsed?.preferred).toBe("0.21vw + 1.08rem");
    expect(parsed?.max).toBe("1.33rem");
    expect(parsed?.vwSlope).toBe(0.21);
  });

  it("should estimate modular ratio from standard type scales", () => {
    // Major Third scale (1.250): 16, 20, 25, 31.25, 39.06
    const sizes = [16, 20, 25, 31.25, 39.06];
    const result = estimateModularRatio(sizes);
    expect(result).not.toBeNull();
    expect(result?.closestName).toBe("major-third");
    expect(result?.ratio).toBeCloseTo(1.25, 2);
  });

  it("should validate script fallbacks and warn against CJK webfonts", () => {
    const invalidStrategy = {
      script: "cjk" as const,
      strategy: "brand-webfont" as const,
      stack: "CustomCJKFont, sans-serif"
    };
    const invalidCheck = validateScriptFallback(invalidStrategy);
    expect(invalidCheck.valid).toBe(false);
    expect(invalidCheck.warnings.length).toBeGreaterThan(0);

    const validStrategy = {
      script: "cjk" as const,
      strategy: "system-os" as const,
      selector: ":lang(zh-Hans), :lang(ja)",
      stack: "PingFang SC, 'Microsoft YaHei', sans-serif"
    };
    const validCheck = validateScriptFallback(validStrategy);
    expect(validCheck.valid).toBe(true);
    expect(validCheck.warnings.length).toBe(0);
  });
});

describe("Color & Theming Blueprint Utilities", () => {
  it("should correctly parse CSS light-dark() functions", () => {
    const cssVal = "light-dark(#fff, hsl(225 66.7% 1.2%))";
    expect(isLightDarkFunction(cssVal)).toBe(true);

    const parsed = parseLightDark(cssVal);
    expect(parsed).not.toBeNull();
    expect(parsed?.light).toBe("#fff");
    expect(parsed?.dark).toBe("hsl(225 66.7% 1.2%)");
  });
});

describe("Spacing & Shape Blueprint Utilities", () => {
  it("should validate quantum grid spacing", () => {
    expect(validateQuantumSpacing(8, 4)).toBe(true);
    expect(validateQuantumSpacing(16, 4)).toBe(true);
    expect(validateQuantumSpacing(24, 8)).toBe(true);
    // 1px and 2px borders are exempt
    expect(validateQuantumSpacing(1, 4)).toBe(true);
    // Arbitrary non-quantum
    expect(validateQuantumSpacing(13, 4)).toBe(false);
    expect(validateQuantumSpacing(7, 8)).toBe(false);
  });

  it("should classify corner radii into functional tiers", () => {
    expect(classifyRadius(4)).toBe("micro");
    expect(classifyRadius(8)).toBe("small");
    expect(classifyRadius(18)).toBe("medium");
    expect(classifyRadius(28)).toBe("large");
    expect(classifyRadius(9999)).toBe("pill");
  });

  it("should validate touch target minimums (>= 48px)", () => {
    expect(validateTouchTarget(48, 48).valid).toBe(true);
    expect(validateTouchTarget(56, 48).valid).toBe(true);
    expect(validateTouchTarget(36, 36).valid).toBe(false);
  });
});

describe("Harvester Engine Synthesis", () => {
  it("should synthesize a high-resolution blueprint from PDS v4 tokens", () => {
    const rawPdsTokens: RawExtractedTokens = {
      customProperties: {
        "--p-font-porsche-next": "'Porsche Next','Arial Narrow',Arial,sans-serif",
        "--p-typescale-xs": ".875rem",
        "--p-typescale-sm": "1rem",
        "--p-typescale-md": "clamp(1.13rem, 0.21vw + 1.08rem, 1.33rem)",
        "--p-typescale-lg": "clamp(1.27rem, 0.51vw + 1.16rem, 1.78rem)",
        "--p-leading-normal": "calc(6px + 2.125ex)",
        "--p-font-weight-normal": "400",
        "--p-font-weight-semibold": "600",
        "--p-font-weight-bold": "700",
        "--p-color-canvas": "light-dark(#fff, hsl(225 66.7% 1.2%))",
        "--p-color-surface": "light-dark(hsl(240 10% 95%), hsl(240 2% 10%))",
        "--p-color-frosted": "light-dark(hsl(240 5% 70% / 0.148), hsl(240 2% 43% / 0.228))",
        "--p-color-primary": "light-dark(hsl(225 66.7% 1.2%), hsl(225 100% 99%))",
        "--p-spacing-static-sm": "8px",
        "--p-spacing-static-md": "16px",
        "--p-spacing-fluid-sm": "clamp(8px, 0.5vw + 6px, 16px)",
        "--p-radius-sm": "4px",
        "--p-radius-md": "8px",
        "--p-radius-lg": "16px",
        "--p-radius-full": "9999px",
        "--p-shadow-sm": "0px 3px 8px rgba(0,0,0,.16)"
      }
    };

    const blueprint = HarvesterEngine.synthesizeBlueprint(
      {
        name: "Porsche Design System",
        version: "4.7.0",
        description: "PDS v4 synthesized blueprint",
        standard: "W3C"
      },
      rawPdsTokens
    );

    // Verify Typography
    expect(blueprint.typography.brandTypeface.family).toBe("Porsche Next");
    expect(blueprint.typography.typescale.model).toBe("hybrid-clamp");
    expect(blueprint.typography.typescale.scale["md"].fluid).toBe(true);
    expect(blueprint.typography.leading.model).toBe("proportional-ex");
    expect(blueprint.typography.leading.normal).toBe("calc(6px + 2.125ex)");
    expect(blueprint.typography.weights["semibold"]).toBe(600);

    // Verify Color
    expect(blueprint.color.theming.mode).toBe("light-dark-css");
    expect(blueprint.color.surfaces.frosted).toBeDefined();

    // Verify Spacing
    expect(blueprint.spacing.staticRamp["sm"].pixelEquiv).toBe(8);
    expect(blueprint.spacing.fluidRamp?.["sm"].fluid).toBe(true);

    // Verify Shape
    expect(blueprint.shape.radiusHierarchy["full"].semanticTarget).toBe("pill");
  });
});
