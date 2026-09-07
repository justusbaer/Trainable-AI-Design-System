import { DesignSystemSnapshot, MergeGateCheck } from "@trainable-ds/core";

export interface GatekeeperOptions {
  minContrastRatio?: number; // default 4.5
  minTouchTargetPx?: number; // default 48
  strictMode?: boolean;
}

export class MergeGatekeeper {
  /**
   * Evaluates design system snapshot against accessibility and quality gates.
   */
  check(snapshot: DesignSystemSnapshot, options: GatekeeperOptions = {}): MergeGateCheck {
    const minContrast = options.minContrastRatio || 4.5;
    const minTouch = options.minTouchTargetPx || 48;

    const violations: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    const flatTokens = this.flattenTokens(snapshot.tokens || {});

    // 1. Check Color Contrast Pairings
    const contrastPairs = [
      { bg: "sys.color.primary", fg: "sys.color.onPrimary", label: "Primary / OnPrimary" },
      { bg: "sys.color.background", fg: "sys.color.onBackground", label: "Background / OnBackground" },
      { bg: "sys.color.surface", fg: "sys.color.onSurface", label: "Surface / OnSurface" },
      { bg: "sys.color.secondary", fg: "sys.color.onSecondary", label: "Secondary / OnSecondary" }
    ];

    for (const pair of contrastPairs) {
      const bgVal = flatTokens[pair.bg];
      const fgVal = flatTokens[pair.fg];

      if (bgVal && fgVal && typeof bgVal === "string" && typeof fgVal === "string") {
        const ratio = this.calculateContrastRatio(bgVal, fgVal);
        if (ratio < minContrast) {
          violations.push(
            `Contrast failure on ${pair.label} (${bgVal} vs ${fgVal}): ratio is ${ratio.toFixed(2)}:1, below required minimum of ${minContrast}:1 (WCAG AA).`
          );
          score -= 25;
        }
      } else if (bgVal && !fgVal) {
        warnings.push(`Missing on-color token '${pair.fg}' for '${pair.bg}'.`);
        score -= 5;
      }
    }

    // 2. Check Touch Targets for Interactive Components
    const interactiveCompNames = ["Button", "IconButton", "Select", "Input", "Tab", "Checkbox"];
    const components = snapshot.components || {};

    for (const [name, comp] of Object.entries(components)) {
      const isInteractive = interactiveCompNames.some(i => name.toLowerCase().includes(i.toLowerCase()));
      if (isInteractive && comp && typeof comp === "object") {
        const props = (comp as any).props || {};
        const height = props.minHeight || props.height || props.touchTarget;

        if (typeof height === "number" && height < minTouch) {
          violations.push(
            `Touch target failure on '${name}': min-height is ${height}px, below the required ${minTouch}px standard.`
          );
          score -= 20;
        }
      }
    }

    // 3. Check Required System Tokens
    const requiredTokens = ["sys.color.primary", "sys.color.background"];
    for (const req of requiredTokens) {
      if (!flatTokens[req]) {
        warnings.push(`Recommended system token '${req}' is not defined.`);
        score -= 5;
      }
    }

    score = Math.max(0, Math.min(100, score));
    const passed = violations.length === 0;

    return {
      passed,
      score,
      violations,
      warnings
    };
  }

  /**
   * Calculates WCAG 2.1 relative luminance and contrast ratio.
   */
  calculateContrastRatio(color1: string, color2: string): number {
    const l1 = this.relativeLuminance(color1);
    const l2 = this.relativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private relativeLuminance(hex: string): number {
    let clean = hex.replace("#", "").trim();
    if (clean.length === 3) {
      clean = clean.split("").map(c => c + c).join("");
    }
    const r8 = parseInt(clean.slice(0, 2), 16) || 0;
    const g8 = parseInt(clean.slice(2, 4), 16) || 0;
    const b8 = parseInt(clean.slice(4, 6), 16) || 0;

    const [rs, gs, bs] = [r8, g8, b8].map(val => {
      const s = val / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private flattenTokens(obj: Record<string, any>, prefix: string = ""): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (val && typeof val === "object" && ("value" in val || "$value" in val)) {
        flat[fullPath] = val.value !== undefined ? val.value : val.$value;
      } else if (val && typeof val === "object" && !Array.isArray(val)) {
        Object.assign(flat, this.flattenTokens(val, fullPath));
      } else {
        flat[fullPath] = val;
      }
    }
    return flat;
  }
}
