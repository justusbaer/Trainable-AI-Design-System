import { describe, it, expect } from "vitest";
import { getInPageHarvesterScript, normalizeHarvestedSnapshot } from "./deep-harvester.js";

describe("deep-harvester", () => {
  it("generates self-contained crawler script string", () => {
    const script = getInPageHarvesterScript();
    expect(script).toContain("function inspectElement");
    expect(script).toContain("shadowRoot");
    expect(script).toContain("parseBorderRadius");
    expect(script).toContain("isPill");
  });

  it("normalizes empty or null snapshot data gracefully", () => {
    const snapshot = normalizeHarvestedSnapshot(null);
    expect(snapshot.url).toBe("");
    expect(snapshot.elements).toEqual([]);
    expect(snapshot.detectedWebComponents).toEqual([]);
  });

  it("normalizes valid snapshot data", () => {
    const raw = {
      url: "https://example.com",
      title: "Test Page",
      elements: [
        {
          selector: "button.primary",
          tagName: "button",
          role: "button.primary",
          family: "actions",
          geometry: {
            padding: { top: 16, right: 24, bottom: 16, left: 24 },
            height: 56,
            borderRadius: 9999,
            isPill: true
          },
          material: {
            backgroundColor: { hex: "#010205", rgb: "rgb(1, 2, 5)", alpha: 1 },
            color: { hex: "#ffffff", rgb: "rgb(255, 255, 255)", alpha: 1 },
            opacity: 1
          }
        }
      ],
      detectedWebComponents: ["p-button"]
    };

    const snapshot = normalizeHarvestedSnapshot(raw);
    expect(snapshot.elements.length).toBe(1);
    expect(snapshot.elements[0].role).toBe("button.primary");
    expect(snapshot.elements[0].geometry.isPill).toBe(true);
    expect(snapshot.fontSmoothing).toBe("auto");
    expect(snapshot.detectedWebComponents).toContain("p-button");
  });
});
