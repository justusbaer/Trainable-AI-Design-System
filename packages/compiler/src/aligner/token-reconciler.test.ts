import { describe, it, expect } from "vitest";
import { reconcileTokensAndComponents } from "./token-reconciler.js";
import { DriftReport } from "./discrepancy-analyzer.js";

describe("token-reconciler", () => {
  it("patches drifted button shape to pill 9999px", () => {
    const mockTokens = {
      "comp.button.shape.corner": {
        "$value": "12px",
        "$type": "dimension"
      }
    };
    const mockComponents = {
      "button": {
        "name": "Button",
        "anatomy": {
          "container": { "borderRadius": "12px" }
        }
      }
    };

    const mockReport: DriftReport = {
      score: 65,
      isConverged: false,
      threshold: 95,
      discrepancies: [
        {
          id: "button.primary-border-radius-shape",
          category: "geometry",
          componentRole: "button.primary",
          property: "borderRadius",
          observedValue: "pill (9999px)",
          currentValue: "12px",
          severity: "high",
          remediation: "Set button.primary corner radius to 9999px"
        }
      ],
      categoryScores: {
        geometry: 65,
        color: 100,
        typography: 100,
        material: 100
      }
    };

    const result = reconcileTokensAndComponents(mockTokens, mockComponents, mockReport);
    expect(result.tokens["comp.button.shape.corner"]["$value"]).toBe("9999px");
    expect(result.components["button"].anatomy.container.shape).toBe("full-pill");
    expect(result.appliedPatches.length).toBe(1);
    expect(result.appliedPatches[0]).toContain("Updated button corner radius to 9999px");
  });

  it("respects tds:locked tokens and skips patching", () => {
    const mockTokens = {
      "sys.color.primary": {
        "$value": "#000000",
        "$type": "color",
        "$extensions": {
          "tds:locked": true
        }
      }
    };
    const mockComponents = {};

    const mockReport: DriftReport = {
      score: 75,
      isConverged: false,
      threshold: 95,
      discrepancies: [
        {
          id: "button.primary-bg-color",
          category: "color",
          componentRole: "button.primary",
          property: "backgroundColor",
          observedValue: "#1a44ea",
          currentValue: "#000000",
          severity: "high",
          remediation: "Align color"
        }
      ],
      categoryScores: {
        geometry: 100,
        color: 70,
        typography: 100,
        material: 100
      }
    };

    const result = reconcileTokensAndComponents(mockTokens, mockComponents, mockReport);
    expect(result.tokens["sys.color.primary"]["$value"]).toBe("#000000"); // Unchanged!
    expect(result.skippedLocked).toContain("button.primary.backgroundColor");
  });

  it("reconciles card border to none and root font smoothing to auto", () => {
    const mockTokens = {};
    const mockComponents = {
      "Card": {
        name: "Card",
        anatomy: { container: { border: "1px solid #ccc" } }
      }
    };

    const mockReport: DriftReport = {
      score: 70,
      isConverged: false,
      threshold: 95,
      discrepancies: [
        {
          id: "card-border-containment",
          category: "material",
          componentRole: "card",
          property: "border",
          observedValue: "none (flat surface)",
          currentValue: "1px border",
          severity: "high",
          remediation: "Remove border"
        },
        {
          id: "typography-font-smoothing",
          category: "typography",
          componentRole: "root",
          property: "webkitFontSmoothing",
          observedValue: "auto",
          currentValue: "antialiased",
          severity: "medium",
          remediation: "Align font smoothing"
        }
      ],
      categoryScores: {
        geometry: 100,
        color: 100,
        typography: 80,
        material: 70
      }
    };

    const result = reconcileTokensAndComponents(mockTokens, mockComponents, mockReport);
    expect(result.tokens["comp.card.container.border"]["$value"]).toBe("none");
    expect(result.tokens["sys.typography.font-smoothing"]["$value"]).toBe("auto");
    expect(result.components["Card"].anatomy.container.border).toBe("none");
    expect(result.appliedPatches.length).toBe(2);
  });
});
