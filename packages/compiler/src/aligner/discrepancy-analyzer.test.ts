import { describe, it, expect } from "vitest";
import { analyzeDrift, DiscrepancyItem } from "./discrepancy-analyzer.js";
import { HarvestedSystemSnapshot } from "./deep-harvester.js";

describe("discrepancy-analyzer", () => {
  const mockSourceSnapshot: HarvestedSystemSnapshot = {
    url: "https://example.com",
    timestamp: Date.now(),
    title: "Brand Official",
    elements: [
      {
        selector: "ds-button.primary",
        tagName: "ds-button",
        isShadowRoot: false,
        family: "actions",
        role: "button.primary",
        geometry: {
          padding: { top: 16, right: 16, bottom: 16, left: 16 },
          height: 56,
          minHeight: 56,
          borderRadius: 9999,
          isPill: true
        },
        typography: {
          fontFamily: "Brand Sans, sans-serif",
          primaryFont: "Brand Sans",
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 24,
          letterSpacing: 0
        },
        material: {
          backgroundColor: { hex: "#010205", rgb: "rgb(1, 2, 5)", alpha: 1 },
          color: { hex: "#ffffff", rgb: "rgb(255, 255, 255)", alpha: 1 },
          opacity: 1
        },
        rawComputed: {}
      }
    ],
    brandColors: {},
    detectedWebComponents: ["p-button"]
  };

  it("detects border radius pill shape mismatch", () => {
    const mockExtractedSnapshot: HarvestedSystemSnapshot = {
      url: "http://localhost:5000",
      timestamp: Date.now(),
      title: "Extracted System",
      elements: [
        {
          selector: "button.primary",
          tagName: "button",
          isShadowRoot: false,
          family: "actions",
          role: "button.primary",
          geometry: {
            padding: { top: 16, right: 36, bottom: 16, left: 36 },
            height: 56,
            minHeight: 56,
            borderRadius: 12, // Rectangular instead of pill!
            isPill: false
          },
          typography: {
            fontFamily: "Inter, sans-serif",
            primaryFont: "Inter",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 24,
            letterSpacing: 0
          },
          material: {
            backgroundColor: { hex: "#010205", rgb: "rgb(1, 2, 5)", alpha: 1 },
            color: { hex: "#ffffff", rgb: "rgb(255, 255, 255)", alpha: 1 },
            opacity: 1
          },
          rawComputed: {}
        }
      ],
      brandColors: {},
      detectedWebComponents: []
    };

    const report = analyzeDrift(mockSourceSnapshot, mockExtractedSnapshot, 95);
    expect(report.isConverged).toBe(false);
    expect(report.score).toBeLessThan(80);

    const radiusDisc = report.discrepancies.find((d: DiscrepancyItem) => d.property === "borderRadius");
    expect(radiusDisc).toBeDefined();
    expect(radiusDisc?.severity).toBe("high");
    expect(radiusDisc?.observedValue).toContain("pill");

    const fontDisc = report.discrepancies.find((d: DiscrepancyItem) => d.property === "fontFamily");
    expect(fontDisc).toBeDefined();
    expect(fontDisc?.observedValue).toBe("Brand Sans");
  });

  it("reports convergence when extracted system matches source", () => {
    const matchingExtracted: HarvestedSystemSnapshot = {
      ...mockSourceSnapshot,
      url: "http://localhost:5000",
      title: "Aligned System"
    };

    const report = analyzeDrift(mockSourceSnapshot, matchingExtracted, 95);
    expect(report.isConverged).toBe(true);
    expect(report.score).toBe(100);
    expect(report.discrepancies.length).toBe(0);
  });

  it("detects card border containment discrepancy (ghost outline on flat card)", () => {
    const srcCardSnapshot: HarvestedSystemSnapshot = {
      url: "https://example.com",
      timestamp: Date.now(),
      title: "Brand Official",
      elements: [
        {
          selector: ".card",
          tagName: "div",
          isShadowRoot: false,
          family: "containment",
          role: "card",
          geometry: { padding: { top: 16, right: 16, bottom: 16, left: 16 }, height: 200, minHeight: 0, borderRadius: 16, isPill: false },
          material: {
            backgroundColor: { hex: "#f0f4f9", rgb: "rgb(240, 244, 249)", alpha: 1 },
            color: { hex: "#1f1f1f", rgb: "rgb(31, 31, 31)", alpha: 1 },
            hasBorder: false,
            borderWidth: 0,
            opacity: 1
          },
          rawComputed: {}
        }
      ],
      fontSmoothing: "auto",
      brandColors: {},
      detectedWebComponents: []
    };

    const extCardWithBorder: HarvestedSystemSnapshot = {
      ...srcCardSnapshot,
      elements: [
        {
          ...srcCardSnapshot.elements[0],
          material: {
            ...srcCardSnapshot.elements[0].material,
            hasBorder: true,
            borderWidth: 1
          }
        }
      ],
      fontSmoothing: "antialiased"
    };

    const report = analyzeDrift(srcCardSnapshot, extCardWithBorder, 95);
    expect(report.isConverged).toBe(false);

    const borderDisc = report.discrepancies.find(d => d.property === "border");
    expect(borderDisc).toBeDefined();
    expect(borderDisc?.observedValue).toContain("none");

    const fontSmoothingDisc = report.discrepancies.find(d => d.property === "webkitFontSmoothing");
    expect(fontSmoothingDisc).toBeDefined();
  });
});
