import { describe, it, expect } from "vitest";
import { generateOverviewHtml } from "./generator.js";

describe("overview generator", () => {
  it("generates standalone overview HTML with brand tokens and loaded fonts", () => {
    const html = generateOverviewHtml({
      brandName: "Porsche Design System",
      version: "4.5.0",
      complianceScore: 99,
      crawledPages: ["https://porsche.com/germany/", "https://porsche.com/germany/models/911/"],
      fonts: {
        families: {
          "Porsche Next": {
            name: "Porsche Next",
            weights: ["400", "700"],
            styles: ["normal"],
            faces: [],
            cssBlock: "@font-face { font-family: 'Porsche Next'; src: url('https://cdn.ui.porsche.com/font.woff2'); }"
          }
        }
      },
      icons: [
        {
          id: "icon-1",
          name: "arrow-right",
          viewBox: "0 0 24 24",
          width: 24,
          height: 24,
          svg: "<svg viewBox=\"0 0 24 24\"><path d=\"M5 12h14\"/></svg>",
          category: "navigation",
          occurrences: 5
        }
      ],
      tokens: {
        "comp.button.shape.corner": { "$value": "9999px" }
      },
      components: {
        "button": { "name": "Button" }
      }
    });

    expect(html).toContain("Porsche Design System Overview");
    expect(html).toContain("v4.5.0");
    expect(html).toContain("99% Aligned");
    expect(html).toContain("@font-face { font-family: 'Porsche Next';");
    expect(html).toContain("arrow-right");
    expect(html).toContain("Save All Overrides to Disk");
    expect(html).toContain("/api/v1/override");
  });
});
