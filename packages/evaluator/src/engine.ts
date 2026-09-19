import { DiagnosticIssue, EvaluationResult } from "./types.js";

export interface EvaluateOptions {
  fileName?: string;
  allowedTokens?: Set<string>;
  strictHexDisallowed?: boolean;
  minTouchTargetPx?: number;
  requireSentenceCase?: boolean;
  requireOnColorPairing?: boolean;
}

/**
 * Checks if a string is in sentence case
 * Allowed: "Save changes", "Submit order now", "Sign in"
 * Disallowed: "Save Changes", "SUBMIT ORDER", "Submit Your Order Now"
 */
export function isSentenceCase(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length <= 1) return true;

  const words = trimmed.split(/\s+/);
  if (words.length <= 1) return true;

  for (let i = 1; i < words.length; i++) {
    const word = words[i].replace(/[^a-zA-Z]/g, "");
    if (word.length > 1 && word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) {
      return false;
    }
  }

  return true;
}

/**
 * Executes a 4-tier design system compliance audit on code.
 */
export function evaluateCode(code: string, options: EvaluateOptions = {}): EvaluationResult {
  const {
    strictHexDisallowed = true,
    minTouchTargetPx = 48,
    requireSentenceCase = true,
    requireOnColorPairing = true,
  } = options;

  const diagnostics: DiagnosticIssue[] = [];
  const lines = code.split(/\r?\n/);

  lines.forEach((lineText, lineIdx) => {
    const lineNum = lineIdx + 1;

    // =========================================================================
    // Tier 1: Static Token Audit (Raw Hex Colors & Non-Quantum Spacing)
    // =========================================================================
    if (strictHexDisallowed) {
      // Find raw hex colors in layout styling (exempting SVG vector artwork, CSS custom property definitions, and var() fallbacks)
      const isVectorArtworkLine = /^\s*<(?:path|rect|circle|stop|polygon|line|ellipse|g)\b/.test(lineText) ||
                                  /\b(?:fill|stroke|stop-color)=["']#[0-9a-fA-F]{3,8}["']/.test(lineText);
      const isTokenDefinitionLine = /^\s*--[a-zA-Z0-9_-]+:\s*#[0-9a-fA-F]{3,8}\b/.test(lineText);

      if (!isVectorArtworkLine && !isTokenDefinitionLine) {
        // Strip var(--token, #hex) fallback values before checking
        const sanitizedLine = lineText.replace(/var\(--[a-zA-Z0-9_-]+,\s*#[0-9a-fA-F]{3,8}\)/g, '');
        const hexMatch = sanitizedLine.match(/#[0-9a-fA-F]{3,8}\b/g);
        if (hexMatch) {
          hexMatch.forEach(hex => {
            diagnostics.push({
              severity: "CRITICAL",
              code: "TDS-RAW-COLOR",
              line: lineNum,
              message: `Raw hex color '${hex}' detected.`,
              remediation: "Replace with semantic token (e.g. 'bg-brand-primary' or 'sys.color.primary').",
            });
          });
        }
      }

      // Find arbitrary spacing classes like p-[13px] or m-[7px]
      const arbitrarySpacing = lineText.match(/\b[pm][xytbl]?-\[(\d+)px\]/g);
      if (arbitrarySpacing) {
        arbitrarySpacing.forEach(cls => {
          diagnostics.push({
            severity: "HIGH",
            code: "TDS-NON-QUANTUM-SPACING",
            line: lineNum,
            message: `Arbitrary non-standard spacing class '${cls}' used.`,
            remediation: "Use standard 4px/8px spatial scale token (e.g. 'p-3' = 12px or 'p-4' = 16px).",
          });
        });
      }
    }

    // =========================================================================
    // Tier 2: Component Reuse & On-Color Pair Audit
    // Case-sensitive check: must distinguish lowercase <button> from uppercase <Button>
    // =========================================================================
    if (/<\s*button\b[^>]*className/.test(lineText)) {
      diagnostics.push({
        severity: "HIGH",
        code: "TDS-REINVENTED-COMPONENT",
        line: lineNum,
        message: "Raw '<button>' element used where design system component '<Button>' should be imported.",
        remediation: "Import { Button } from '@/components/ui/button' and use `<Button variant=\"...\">`.",
      });
    }

    if (/<\s*input\b[^>]*className/.test(lineText)) {
      diagnostics.push({
        severity: "HIGH",
        code: "TDS-REINVENTED-COMPONENT",
        line: lineNum,
        message: "Raw '<input>' element used where design system component '<TextField>' should be imported.",
        remediation: "Import { TextField } from '@/components/ui/text-field' and use `<TextField>`. ",
      });
    }

    // On-Color Pairing Audit: element has bg-primary or bg-brand-primary but text is not on-primary
    if (requireOnColorPairing) {
      if (/\bbg-(?:brand-)?primary\b/.test(lineText) && /\btext-(?:gray|slate|zinc|black)-\d+/.test(lineText)) {
        diagnostics.push({
          severity: "CRITICAL",
          code: "TDS-M3-ON-COLOR-MISMATCH",
          line: lineNum,
          message: "Element with 'bg-primary' background uses a non-paired text color.",
          remediation: "Use paired token 'text-on-primary' to ensure accessible contrast.",
        });
      }
    }

    // =========================================================================
    // Tier 3: Touch Targets & RTL Directionality
    // =========================================================================
    if (/\b(?:IconButton|button)\b/i.test(lineText) && /\b(?:w-[678]|h-[678]|w-\[3\dpx\]|h-\[3\dpx\])\b/.test(lineText)) {
      diagnostics.push({
        severity: "HIGH",
        code: "TDS-TOUCH-TARGET-TOO-SMALL",
        line: lineNum,
        message: `Interactive target appears smaller than minimum ${minTouchTargetPx}x${minTouchTargetPx}px required by M3 and WCAG AA.`,
        remediation: `Ensure button has padding or minimum dimensions meeting ${minTouchTargetPx}px (e.g. 'min-w-[48px] min-h-[48px]').`,
      });
    }

    if (/\b(?:ml-\d+|mr-\d+|pl-\d+|pr-\d+)\b/.test(lineText)) {
      diagnostics.push({
        severity: "LOW",
        code: "TDS-RTL-NON-LOGICAL",
        line: lineNum,
        message: "Physical directional classes detected (e.g. 'ml-', 'mr-').",
        remediation: "Use bidirectional logical properties ('ms-', 'me-', 'ps-', 'pe-') for internationalization.",
      });
    }

    // =========================================================================
    // Tier 4: Semantic Guidelines & Sentence-Case Check
    // =========================================================================
    if (requireSentenceCase) {
      const buttonContentMatch = lineText.match(/<\s*Button[^>]*>(.*?)<\s*\/\s*Button>/);
      if (buttonContentMatch) {
        const labelText = buttonContentMatch[1].replace(/<[^>]*>/g, "").trim();
        if (labelText && !isSentenceCase(labelText)) {
          diagnostics.push({
            severity: "MEDIUM",
            code: "TDS-CAPITALIZATION-NOT-SENTENCE-CASE",
            line: lineNum,
            message: `Button label '${labelText}' uses Title Case instead of M3 Sentence Case.`,
            remediation: `Change label text to sentence case: '${toSentenceCase(labelText)}'.`,
          });
        }
      }
    }

    // =========================================================================
    // Tier 5: Modern Visual Fidelity & Anti-Drift Guardrails (M3 + Astryx Unified)
    // =========================================================================
    // 1. Ghost Border Hallucination Check on Surface Containers
    // Exempt explicit outlined variants: ShowcaseCard, variant="outlined", showcase-card, or border-outline-showcase
    if (/\b(?:surface-container|tds-card--filled|<Card\b(?!.*variant=["']outlined["']))/.test(lineText) &&
        !/\b(?:showcase-card|ShowcaseCard|variant=["']outlined["']|outline-showcase)\b/.test(lineText) &&
        /\b(?:border(?:-\[[^\]]+\])?|border-outline(?:-variant)?)\b/.test(lineText) &&
        !/\bborder-(?:none|0|transparent)\b/.test(lineText)) {
      diagnostics.push({
        severity: "HIGH",
        code: "TDS-GHOST-BORDER-HALLUCINATION",
        line: lineNum,
        message: "Artificial border outline added to flat surface container or filled card.",
        remediation: "Modern surface containment establishes depth through tonal contrast without borders. Remove border or use 'border-none' (unless explicitly building an outlined ShowcaseCard).",
      });
    }

    // 2. Subpixel Font Smoothing Check
    if (/(?:-webkit-font-smoothing:\s*antialiased|\bantialiased\b)/i.test(lineText)) {
      diagnostics.push({
        severity: "MEDIUM",
        code: "TDS-FONT-SMOOTHING-DEGRADATION",
        line: lineNum,
        message: "Grayscale font smoothing ('antialiased') detected, which strips stroke weight on macOS/WebKit.",
        remediation: "Use '-webkit-font-smoothing: auto;' or 'subpixel-antialiased' to preserve authentic letterform thickness.",
      });
    }

    // 3. Typographic Logo Approximation Check
    if (/<span[^>]+style=[^>]+color:[^>]+>[A-Za-z0-9]<\/span>\s*<span[^>]+style=[^>]+color:[^>]+>[A-Za-z0-9]<\/span>/.test(lineText)) {
      diagnostics.push({
        severity: "HIGH",
        code: "TDS-TYPOGRAPHIC-LOGO-APPROXIMATION",
        line: lineNum,
        message: "Brand logo approximated using styled HTML text spans instead of vector SVG.",
        remediation: "Render brand logos using authentic vector SVGs from 'icons.json' or inline <svg>.",
      });
    }

    // 4. M3 Dialog Surface Specs (28px corner radius mandate)
    if (/\b(?:<Dialog\b|role=["']dialog["']|m3-dialog-card|class=["'][^"']*\bdialog\b)/i.test(lineText)) {
      if (/\b(?:rounded-(?:sm|md|lg|xl)\b|rounded-\[(?:[468]|1[024])px\]|border-radius:\s*(?:[468]|1[024])px)\b/.test(lineText)) {
        diagnostics.push({
          severity: "CRITICAL",
          code: "TDS-DIALOG-SURFACE-SPECS",
          line: lineNum,
          message: "Dialog or Modal container uses inadequate small corner radius.",
          remediation: "Material 3 Dialogs strictly require 28px corner radius ('rounded-[28px]' or 'var(--gn-radius-dialog)').",
        });
      }
    }

    // 5. M3 Floating Menu Specs (4px corner radius mandate)
    if (/\b(?:<Menu\b|role=["']menu["']|m3-context-menu)\b/i.test(lineText)) {
      if (/\b(?:rounded-(?:xl|2xl|3xl|full)\b|rounded-\[(?:1[68]|2[48])px\]|border-radius:\s*(?:1[68]|2[48])px)\b/.test(lineText)) {
        diagnostics.push({
          severity: "HIGH",
          code: "TDS-FLOATING-MENU-SPECS",
          line: lineNum,
          message: "Context menu or dropdown popover uses oversized corner radius.",
          remediation: "Context menus and popovers strictly require 4px corner radius ('rounded' or 'rounded-[4px]') with M3 elevation shadow.",
        });
      }
    }

    // 6. Follow / Save Action Pill Specs (36px height mandate)
    if (/\b(?:<FollowButton\b|btn-follow|aria-label=["'][^"']*(?:folgen|speichern)[^"']*["'])/i.test(lineText)) {
      if (/\b(?:h-12|h-14|h-\[4\dpx\]|min-h-\[48px\])\b/.test(lineText) && !/\b(?:h-9|h-\[36px\]|min-h-\[36px\])\b/.test(lineText)) {
        diagnostics.push({
          severity: "HIGH",
          code: "TDS-FOLLOW-BUTTON-SPECS",
          line: lineNum,
          message: "Follow/Save action pill appears oversized.",
          remediation: "Follow buttons in Google News use a dedicated 36px pill height ('h-9' or 'h-[36px]' with 'rounded-[36px]').",
        });
      }
    }
  });

  let score = 100;
  for (const diag of diagnostics) {
    if (diag.severity === "CRITICAL") score -= 25;
    else if (diag.severity === "HIGH") score -= 15;
    else if (diag.severity === "MEDIUM") score -= 8;
    else if (diag.severity === "LOW") score -= 3;
  }
  score = Math.max(0, score);

  const certified = diagnostics.length === 0;
  const summary = certified
    ? "Certified 100% compliant with Trainable DS & Material Design 3 rules."
    : `${diagnostics.length} violation(s) found. Score: ${score}/100.`;

  return {
    certified,
    score,
    summary,
    diagnostics,
  };
}

function toSentenceCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
