import { describe, it, expect } from "vitest";
import { hexToFigmaRgb, formatDtcgForFigma } from "./variables-adapter.js";

describe("Figma Variables Adapter", () => {
  it("converts hex to normalized Figma RGB values (0.0 to 1.0)", () => {
    const figmaRgb = hexToFigmaRgb("#ffffff");
    expect(figmaRgb.r).toBe(1);
    expect(figmaRgb.g).toBe(1);
    expect(figmaRgb.b).toBe(1);
    expect(figmaRgb.a).toBe(1);

    const black = hexToFigmaRgb("#000000");
    expect(black.r).toBe(0);
    expect(black.g).toBe(0);
    expect(black.b).toBe(0);
  });

  it("converts W3C DTCG tokens to Figma Variables payload", () => {
    const mockTokens = {
      sys: {
        color: {
          light: {
            primary: { $value: "#00639b", $type: "color", $description: "Primary action" },
            surface: { $value: "#fdfcff", $type: "color" },
          },
          dark: {
            primary: { $value: "#92ccff", $type: "color" },
            surface: { $value: "#1a1c1e", $type: "color" },
          },
        },
      },
    };

    const payload = formatDtcgForFigma(mockTokens);
    expect(payload.variables.length).toBe(2);
    expect(payload.variableModes.length).toBe(1); // Dark mode
    expect(payload.variableModeValues.length).toBe(4); // 2 vars x 2 modes

    const primaryVar = payload.variables.find((v) => v.name === "color/primary");
    expect(primaryVar).toBeDefined();
    expect(primaryVar?.resolvedType).toBe("COLOR");
  });
});
