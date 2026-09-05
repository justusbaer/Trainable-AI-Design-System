import { M3TonalTone, M3TonalPalette } from "../tokens/m3-colors.js";
import { createToken } from "../tokens/dtcg.js";

/**
 * Perceptual Color Math (OKLab / HCT approximation)
 * Generates accurate M3 0-100 tonal palettes from any seed hex color.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface OKLab {
  L: number;
  a: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace("#", "").trim();
  const fullHex = cleanHex.length === 3
    ? cleanHex.split("").map(c => c + c).join("")
    : cleanHex;

  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert sRGB to linear sRGB
function sRgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

// Convert linear sRGB to sRGB
function linearToSRgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(v * 255);
}

// Convert sRGB to OKLab
export function rgbToOklab(rgb: RGB): OKLab {
  const lr = sRgbToLinear(rgb.r);
  const lg = sRgbToLinear(rgb.g);
  const lb = sRgbToLinear(rgb.b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

// Convert OKLab to sRGB
export function oklabToRgb(lab: OKLab): RGB {
  const l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: linearToSRgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSRgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSRgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

/**
 * Generate a standard Material Design 3 (M3) 14-tone tonal palette
 * from an arbitrary seed color using perceptual lightness scaling.
 */
export function generateTonalPalette(seedHex: string, paletteName: string): M3TonalPalette {
  const baseRgb = hexToRgb(seedHex);
  const baseLab = rgbToOklab(baseRgb);

  // M3 Tones from 0 (black) to 100 (white)
  const tones: M3TonalTone[] = ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "95", "98", "99", "100"];
  const result = {} as M3TonalPalette;

  for (const toneStr of tones) {
    const tone = parseInt(toneStr, 10);
    let hex: string;

    if (tone === 0) {
      hex = "#000000";
    } else if (tone === 100) {
      hex = "#ffffff";
    } else {
      // Map tone (0-100) to OKLab perceptual lightness (0.0 to 1.0)
      // M3 tone 50 is approximately L = 0.53
      const targetL = tone / 100;
      // Chroma dampens as tone approaches extremes
      const chromaDampener = Math.sin((tone / 100) * Math.PI);
      const scaledA = baseLab.a * Math.min(1.0, chromaDampener * 1.2);
      const scaledB = baseLab.b * Math.min(1.0, chromaDampener * 1.2);

      const rgb = oklabToRgb({ L: targetL, a: scaledA, b: scaledB });
      hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    result[toneStr] = createToken(
      hex,
      "color",
      `${paletteName} tonal palette tone ${toneStr}`,
      false
    );
  }

  return result;
}
