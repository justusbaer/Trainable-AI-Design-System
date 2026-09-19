import { describe, it, expect } from "vitest";
import { evaluateBlueprintCompliance } from "./rules/blueprint-rules.js";
import { DesignSystemBlueprint } from "@trainable-ds/core";

describe("Dynamic Blueprint Compliance Evaluator", () => {
  const mockBlueprint: DesignSystemBlueprint = {
    metadata: {
      name: "Mock Enterprise DS",
      version: "1.0.0",
      description: "Test blueprint",
      standard: "Custom"
    },
    typography: {
      brandTypeface: {
        family: "TestSans",
        stack: "TestSans, sans-serif",
        weights: [400, 700]
      },
      rendering: {
        fontSmoothing: "auto"
      },
      typescale: {
        model: "modular-fixed",
        scale: {
          sm: { name: "sm", size: "1rem", pixelEquiv: 16, fluid: false }
        }
      },
      leading: {
        model: "unitless",
        normal: "1.5"
      },
      weights: { normal: 400, bold: 700 },
      semanticRoles: {}
    },
    color: {
      theming: { mode: "class-toggle", supportsLightDarkFunction: false, forcedColorsSupport: true },
      surfaces: { canvas: "#fff", surface: "#f5f5f5", backdrop: "rgba(0,0,0,0.5)" },
      foregrounds: { primary: "#111", contrastHigh: "#444", contrastMedium: "#777", contrastLow: "#ccc", contrastLower: "#eee" },
      brand: { primary: "#0066cc", onPrimary: "#fff" },
      semantics: {
        info: { base: "#0066cc", onBase: "#fff" },
        success: { base: "#00aa00", onBase: "#fff" },
        warning: { base: "#ffaa00", onBase: "#000" },
        error: { base: "#cc0000", onBase: "#fff" }
      },
      interactive: { focusRing: "#0066cc", focusOffset: "2px", hoverOverlay: "rgba(0,0,0,0.05)", pressedOverlay: "rgba(0,0,0,0.1)" }
    },
    spacing: {
      quantumBase: 4,
      staticRamp: { sm: { name: "sm", value: "8px", pixelEquiv: 8, fluid: false } },
      grid: { columns: 12, columnGap: "16px", containerQueries: true }
    },
    shape: {
      radiusHierarchy: {
        micro: { name: "micro", value: "4px", pixelEquiv: 4, semanticTarget: "menu" },
        medium: { name: "medium", value: "16px", pixelEquiv: 16, semanticTarget: "card" },
        large: { name: "large", value: "28px", pixelEquiv: 28, semanticTarget: "dialog" },
        pill: { name: "pill", value: "9999px", pixelEquiv: 9999, semanticTarget: "pill" }
      },
      elevation: {
        primaryStrategy: "flat-surface",
        shadows: {}
      }
    },
    components: {},
    invariants: []
  };

  it("should catch font smoothing violations when blueprint mandates auto", () => {
    const code = `
      <div class="antialiased text-primary">
        Hello World
      </div>
    `;
    const result = evaluateBlueprintCompliance(code, mockBlueprint);
    expect(result.certified).toBe(false);
    expect(result.diagnostics.some(d => d.code === "TDS-FONT-SMOOTHING-DEGRADATION")).toBe(true);
  });

  it("should catch ghost borders on flat surface containers", () => {
    const code = `
      <article class="card border border-gray-200">
        <h3>Story title</h3>
      </article>
    `;
    const result = evaluateBlueprintCompliance(code, mockBlueprint);
    expect(result.certified).toBe(false);
    expect(result.diagnostics.some(d => d.code === "TDS-GHOST-BORDER-HALLUCINATION")).toBe(true);
  });

  it("should catch dialogs with inadequate small corner radii", () => {
    const code = `
      <div role="dialog" class="dialog rounded-md bg-surface">
        <h2>Modal Title</h2>
      </div>
    `;
    const result = evaluateBlueprintCompliance(code, mockBlueprint);
    expect(result.certified).toBe(false);
    expect(result.diagnostics.some(d => d.code === "TDS-DIALOG-SURFACE-SPECS")).toBe(true);
  });

  it("should certify compliant code with score 100", () => {
    const code = `
      <article class="card border-none bg-surface p-4">
        <h3 class="text-primary font-bold">Story title</h3>
        <button class="min-w-[48px] min-h-[48px] rounded-full">Read more</button>
      </article>
    `;
    const result = evaluateBlueprintCompliance(code, mockBlueprint);
    expect(result.certified).toBe(true);
    expect(result.score).toBe(100);
    expect(result.diagnostics.length).toBe(0);
  });
});
