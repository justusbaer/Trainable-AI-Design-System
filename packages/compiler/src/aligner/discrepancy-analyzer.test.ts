import { describe, it, expect } from "vitest";
import { analyzeDrift, DiscrepancyItem } from "./discrepancy-analyzer.js";
import { HarvestedSystemSnapshot } from "./deep-harvester.js";

describe("discrepancy-analyzer", () => {
  const mockSourceSnapshot: HarvestedSystemSnapshot = {
    url: "https://porsche.com",
    timestamp: Date.now(),
    title: "Porsche Official",
    elements: [
      {
        selector: "p-button.primary",
        tagName: "p-button",
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
          fontFamily: "Porsche Next, sans-serif",
          primaryFont: "Porsche Next",
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
    expect(fontDisc?.observedValue).toBe("Porsche Next");
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
});
