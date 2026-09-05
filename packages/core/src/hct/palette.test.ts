import { describe, it, expect } from "vitest";
import { generateTonalPalette, hexToRgb, rgbToHex } from "./palette.js";
import { M3TonalTone } from "../tokens/m3-colors.js";

describe("HCT / OKLab Tonal Palette Generator", () => {
  it("converts hex to rgb and back correctly", () => {
    const hex = "#00639b";
    const rgb = hexToRgb(hex);
    expect(rgb).toEqual({ r: 0, g: 99, b: 155 });
    const roundtrip = rgbToHex(rgb.r, rgb.g, rgb.b);
    expect(roundtrip.toLowerCase()).toBe(hex.toLowerCase());
  });

  it("generates full 14-tone M3 palette with correct endpoints", () => {
    const palette = generateTonalPalette("#00639b", "Primary");
    
    // Check all tones exist
    const expectedTones: M3TonalTone[] = ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "95", "98", "99", "100"];
    for (const tone of expectedTones) {
      expect(palette[tone]).toBeDefined();
      expect(palette[tone]!.$type).toBe("color");
    }

    // Tone 0 must be pure black (#000000)
    expect(palette["0"]!.$value).toBe("#000000");

    // Tone 100 must be pure white (#ffffff)
    expect(palette["100"]!.$value).toBe("#ffffff");

    // Tone 90 should be a very light blue tint
    expect(typeof palette["90"]!.$value).toBe("string");
    expect((palette["90"]!.$value as string).startsWith("#")).toBe(true);
  });
});
