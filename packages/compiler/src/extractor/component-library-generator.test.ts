import { describe, it, expect } from "vitest";
import { generatePrototypeComponentLibrary } from "./component-library-generator.js";

describe("component-library-generator", () => {
  it("synthesizes prototype component library matching extracted tokens", () => {
    const result = generatePrototypeComponentLibrary({
      brandName: "Enterprise Design System",
      tokens: {
        "sys.color.primary": { "$value": "#010205" },
        "sys.color.on-primary": { "$value": "#ffffff" },
        "comp.button.shape.corner": { "$value": "9999px" },
        "comp.button.spacing.padding": { "$value": "16px 28px" },
      },
      icons: [
        { id: "icon-arrow", name: "arrow-right", viewBox: "0 0 24 24", width: 24, height: 24, svg: "<svg></svg>", occurrences: 5 }
      ]
    });

    expect(result.files["Button.tsx"]).toBeDefined();
    expect(result.files["Button.tsx"]).toContain("minHeight: \"48px\"");
    expect(result.files["Button.tsx"]).toContain("borderRadius: \"9999px\"");
    expect(result.files["Button.tsx"]).toContain("var(--sys-color-primary)");
    expect(result.manifest["Button"].variants.primary.containerColor).toBe("#010205");

    expect(result.files["Card.tsx"]).toBeDefined();
    expect(result.files["Card.tsx"]).toContain('border: "none"');
    expect(result.files["NavTab.tsx"]).toBeDefined();
    expect(result.files["NavTab.tsx"]).toContain("tds-nav-tab");
    expect(result.files["TextField.tsx"]).toBeDefined();
    expect(result.files["Icon.tsx"]).toBeDefined();
    expect(result.files["Icon.tsx"]).toContain("\"arrow-right\"");
    expect(result.files["index.ts"]).toContain("export * from \"./Button.js\";");
    expect(result.files["index.ts"]).toContain("export * from \"./NavTab.js\";");

    expect(result.manifest["Button"]).toBeDefined();
    expect(result.manifest["NavTab"]).toBeDefined();
    expect(result.manifest["NavTab"].family).toBe("navigation");
    expect(result.manifest["Button"].code).toContain("Button: React.FC<ButtonProps>");
    expect(result.manifest["Button"].authoritativeSource.type).toBe("generated");
  });
});
