import { describe, it, expect } from "vitest";
import { generateOverviewHtml } from "./generator.js";

describe("overview generator", () => {
  it("generates standalone overview HTML with brand tokens and loaded fonts", () => {
    const html = generateOverviewHtml({
      brandName: "Enterprise Design System",
      version: "1.7.0",
      complianceScore: 99,
      crawledPages: ["https://brand.example.com/", "https://brand.example.com/products/"],
      fonts: {
        families: {
          "Brand Sans": {
            name: "Brand Sans",
            weights: ["400", "700"],
            styles: ["normal"],
            faces: [],
            cssBlock: "@font-face { font-family: 'Brand Sans'; src: url('https://cdn.brand.example.com/font.woff2'); }"
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

    expect(html).toContain("Enterprise Design System Overview");
    expect(html).toContain("v1.7.0");
    expect(html).toContain("99% Aligned");
    expect(html).toContain("@font-face { font-family: 'Brand Sans';");
    expect(html).toContain("arrow-right");
    expect(html).toContain("Save All Overrides to Disk");
    expect(html).toContain("/api/v1/override");
    expect(html).toContain("Component Review Studio & Prototype Library");
    expect(html).toContain("comp-locked-toggle");
    expect(html).toContain("Authoritative Source Binding");
    expect(html).toContain("comp-code-editor");
    expect(html).toContain("Save Component to Disk");
  });
});
