import {
  DesignSystemBlueprint,
  DesignSystemMetadata,
  TypographyBlueprint,
  ColorBlueprint,
  SpacingBlueprint,
  ShapeBlueprint,
  TypescaleStep,
  SpacingStep,
  CornerRadiusTier,
  ShadowStep
} from "./types.js";
import { parseClamp, isFluidClamp, estimateModularRatio } from "./typography.js";
import { parseLightDark, isLightDarkFunction } from "./color.js";
import { validateQuantumSpacing } from "./spacing.js";
import { classifyRadius } from "./shape.js";

export interface RawExtractedTokens {
  customProperties?: Record<string, string>; // e.g. { "--p-typescale-sm": "1rem", ... }
  fontPreloads?: string[];
  computedFontSizes?: string[];
  computedColors?: string[];
  computedRadii?: string[];
  computedShadows?: string[];
}

/**
 * Harvester Engine: Synthesizes a structured DesignSystemBlueprint from raw CSS/DOM data.
 */
export class HarvesterEngine {
  /**
   * Harvests the Typography subsystem from raw CSS custom properties and styles.
   */
  public static harvestTypography(raw: RawExtractedTokens): TypographyBlueprint {
    const props = raw.customProperties || {};

    // 1. Detect Brand Typeface
    let brandFamily = "sans-serif";
    let brandStack = "sans-serif";
    for (const [k, v] of Object.entries(props)) {
      if (k.includes("font") && (k.includes("family") || k.includes("next") || k.includes("sans") || k.includes("brand"))) {
        brandStack = v;
        const first = v.split(",")[0].replace(/['"]/g, "").trim();
        brandFamily = first;
        break;
      }
    }

    // 2. Typescale Extraction
    const scale: Record<string, TypescaleStep> = {};
    const pixelSizes: number[] = [];

    for (const [k, v] of Object.entries(props)) {
      if (k.includes("typescale") || (k.includes("font-size") && !k.includes("icon"))) {
        const stepName = k.replace(/.*(?:typescale|font-size)-?/, "").toLowerCase() || "default";
        const fluid = isFluidClamp(v);
        let pixelEquiv: number | undefined;

        if (v.includes("rem")) {
          const remVal = parseFloat(v.match(/([0-9.]+)rem/)?.[1] || "1");
          pixelEquiv = Math.round(remVal * 16);
          pixelSizes.push(pixelEquiv);
        } else if (v.includes("px")) {
          pixelEquiv = parseFloat(v.match(/([0-9.]+)px/)?.[1] || "16");
          pixelSizes.push(pixelEquiv);
        }

        const parsedClamp = fluid ? parseClamp(v) : null;

        scale[stepName] = {
          name: stepName,
          size: v,
          pixelEquiv,
          fluid,
          clampMin: parsedClamp?.min,
          clampPreferred: parsedClamp?.preferred,
          clampMax: parsedClamp?.max
        };
      }
    }

    const hasFluid = Object.values(scale).some(s => s.fluid);
    const hasStatic = Object.values(scale).some(s => !s.fluid);
    const model = hasFluid && hasStatic ? "hybrid-clamp" : hasFluid ? "fluid-clamp" : "modular-fixed";

    const modularAnalysis = estimateModularRatio(pixelSizes);

    // 3. Leading Formula
    let leadingNormal = "1.5";
    let leadingModel: "fixed" | "unitless" | "proportional-ex" = "unitless";
    for (const [k, v] of Object.entries(props)) {
      if (k.includes("leading") && (k.includes("normal") || k.includes("default"))) {
        leadingNormal = v;
        if (v.includes("ex")) leadingModel = "proportional-ex";
        else if (v.includes("px") || v.includes("rem")) leadingModel = "fixed";
        break;
      }
    }

    // 4. Font Weights
    const weights: Record<string, number> = {};
    for (const [k, v] of Object.entries(props)) {
      if (k.includes("font-weight") || k.includes("weight")) {
        const weightName = k.replace(/.*(?:font-weight|weight)-?/, "").toLowerCase();
        const num = parseInt(v, 10);
        if (!isNaN(num)) {
          weights[weightName] = num;
        }
      }
    }
    if (Object.keys(weights).length === 0) {
      weights["normal"] = 400;
      weights["semibold"] = 600;
      weights["bold"] = 700;
    }

    return {
      brandTypeface: {
        family: brandFamily,
        stack: brandStack,
        weights: Object.values(weights)
      },
      scriptFallbacks: {
        cjk: {
          script: "cjk",
          strategy: "system-os",
          selector: ":lang(zh-Hans), :lang(zh-Hant), :lang(ja), :lang(ko)",
          stack: "PingFang SC, 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif",
          rationale: "Zero-download OS system fallback protects Core Web Vitals"
        }
      },
      rendering: {
        fontSmoothing: "auto"
      },
      typescale: {
        model,
        ratio: modularAnalysis?.ratio,
        scale
      },
      leading: {
        model: leadingModel,
        normal: leadingNormal
      },
      weights,
      semanticRoles: {
        headline: { scale: "2xl", weight: 600, leading: "tight" },
        title: { scale: "md", weight: 600, leading: "normal" },
        body: { scale: "sm", weight: 400, leading: "normal" },
        label: { scale: "xs", weight: 500, leading: "normal" }
      }
    };
  }

  /**
   * Harvests Color & Theming subsystem.
   */
  public static harvestColor(raw: RawExtractedTokens): ColorBlueprint {
    const props = raw.customProperties || {};

    let canvas = "#ffffff";
    let surface = "#f6f8fc";
    let frosted: string | undefined;
    let primaryText = "#1f1f1f";
    let contrastHigh = "#444746";
    let brandPrimary = "#0b57d0";
    let onPrimary = "#ffffff";

    let usesLightDarkFunction = false;

    for (const [k, v] of Object.entries(props)) {
      if (isLightDarkFunction(v)) usesLightDarkFunction = true;

      if (k.includes("canvas")) canvas = v;
      else if (k.includes("surface") && !k.includes("container") && !k.includes("on")) surface = v;
      else if (k.includes("frosted") && !k.includes("soft") && !k.includes("strong")) frosted = v;
      else if (k.includes("primary") && (k.includes("text") || k.includes("fg") || k.includes("on-surface"))) primaryText = v;
      else if (k.includes("contrast-high") || k.includes("on-surface-variant")) contrastHigh = v;
      else if (k.includes("primary") && !k.includes("text") && !k.includes("on") && !k.includes("container")) brandPrimary = v;
      else if (k.includes("on-primary")) onPrimary = v;
    }

    return {
      theming: {
        mode: usesLightDarkFunction ? "light-dark-css" : "class-toggle",
        supportsLightDarkFunction: usesLightDarkFunction,
        forcedColorsSupport: true
      },
      surfaces: {
        canvas,
        surface,
        frosted,
        backdrop: "rgba(0, 0, 0, 0.5)"
      },
      foregrounds: {
        primary: primaryText,
        contrastHigh,
        contrastMedium: "#747775",
        contrastLow: "#c7c7c7",
        contrastLower: "#e3e3e3"
      },
      brand: {
        primary: brandPrimary,
        onPrimary
      },
      semantics: {
        info: { base: "#1a73e8", onBase: "#ffffff" },
        success: { base: "#1e8e3e", onBase: "#ffffff" },
        warning: { base: "#f9ab00", onBase: "#202124" },
        error: { base: "#d93025", onBase: "#ffffff" }
      },
      interactive: {
        focusRing: "#1a73e8",
        focusOffset: "2px",
        hoverOverlay: "rgba(0, 0, 0, 0.04)",
        pressedOverlay: "rgba(0, 0, 0, 0.12)"
      }
    };
  }

  /**
   * Harvests Spacing & Layout subsystem.
   */
  public static harvestSpacing(raw: RawExtractedTokens): SpacingBlueprint {
    const props = raw.customProperties || {};
    const staticRamp: Record<string, SpacingStep> = {};
    const fluidRamp: Record<string, SpacingStep> = {};

    for (const [k, v] of Object.entries(props)) {
      if (k.includes("spacing")) {
        const isFluid = isFluidClamp(v) || k.includes("fluid");
        const name = k.replace(/.*(?:spacing-static-|spacing-fluid-|spacing-)/, "").toLowerCase();
        const px = parseFloat(v.match(/([0-9.]+)px/)?.[1] || "8");

        const step: SpacingStep = {
          name,
          value: v,
          pixelEquiv: px,
          fluid: isFluid
        };

        if (isFluid) fluidRamp[name] = step;
        else staticRamp[name] = step;
      }
    }

    return {
      quantumBase: 4,
      staticRamp,
      fluidRamp: Object.keys(fluidRamp).length > 0 ? fluidRamp : undefined,
      grid: {
        columns: 12,
        columnGap: "clamp(16px, 1.25vw + 12px, 24px)",
        containerQueries: true
      }
    };
  }

  /**
   * Harvests Shape & Elevation subsystem.
   */
  public static harvestShape(raw: RawExtractedTokens): ShapeBlueprint {
    const props = raw.customProperties || {};
    const radiusHierarchy: Record<string, CornerRadiusTier> = {};
    const shadows: Record<string, ShadowStep> = {};

    for (const [k, v] of Object.entries(props)) {
      if (k.includes("radius")) {
        const name = k.replace(/.*(?:radius-)/, "").toLowerCase();
        const px = parseFloat(v.match(/([0-9.]+)px/)?.[1] || (v.includes("9999") ? "9999" : "8"));
        const tierRole = classifyRadius(px);
        radiusHierarchy[name] = {
          name,
          value: v,
          pixelEquiv: px,
          semanticTarget: tierRole
        };
      } else if (k.includes("shadow")) {
        const name = k.replace(/.*(?:shadow-)/, "").toLowerCase();
        shadows[name] = {
          name,
          value: v
        };
      }
    }

    return {
      radiusHierarchy,
      elevation: {
        primaryStrategy: Object.keys(shadows).length > 0 ? "shadow-matrix" : "flat-surface",
        shadows
      }
    };
  }

  /**
   * Synthesizes the full DesignSystemBlueprint.
   */
  public static synthesizeBlueprint(
    metadata: DesignSystemMetadata,
    raw: RawExtractedTokens
  ): DesignSystemBlueprint {
    const typography = this.harvestTypography(raw);
    const color = this.harvestColor(raw);
    const spacing = this.harvestSpacing(raw);
    const shape = this.harvestShape(raw);

    return {
      metadata,
      typography,
      color,
      spacing,
      shape,
      components: {},
      invariants: [
        {
          id: "TDS-GHOST-BORDER-HALLUCINATION",
          severity: "CRITICAL",
          category: "Surface",
          description: "Flat surface containers must not receive borders or box-shadows",
          pattern: {
            targetSelectors: [".card", ".story-card", "article"],
            forbiddenStyles: { border: /none/i, "box-shadow": /none/i }
          },
          fixRecommendation: "Remove border and box-shadow from flat surface cards."
        },
        {
          id: "TDS-FONT-SMOOTHING-DEGRADATION",
          severity: "HIGH",
          category: "Typography",
          description: "Do not apply -webkit-font-smoothing: antialiased; use auto",
          pattern: {
            targetSelectors: ["body", "html", "*"],
            forbiddenStyles: { "-webkit-font-smoothing": /antialiased/i },
            requiredStyles: { "-webkit-font-smoothing": /auto/i }
          },
          fixRecommendation: "Enforce -webkit-font-smoothing: auto; to maintain authentic subpixel font weight on macOS."
        }
      ]
    };
  }
}
