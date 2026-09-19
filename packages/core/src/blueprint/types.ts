/**
 * Universal Design System Blueprint Meta-Schema
 * 
 * Defines the complete taxonomy of invariants, structural relationships,
 * and component/token contracts required for a design system to be "complete"
 * and machine-encodable for AI coding agents.
 */

export interface DesignSystemMetadata {
  name: string;
  version: string;
  description: string;
  sourceUrl?: string;
  prefix?: string; // e.g. "--gn-", "--p-", "md.sys."
  standard: "DTCG" | "Material3" | "W3C" | "Custom";
  authoritativeLock?: boolean;
}

// ==========================================
// 1. TYPOGRAPHY SUBSYSTEM BLUEPRINT
// ==========================================

export type TypescaleModel = "modular-fixed" | "fluid-clamp" | "hybrid-clamp";
export type LeadingModel = "fixed" | "unitless" | "proportional-ex";

export interface TypefaceDefinition {
  family: string;
  stack: string;
  weights: number[]; // e.g. [400, 500, 600, 700]
  formats?: ("woff2" | "woff" | "ttf" | "variable")[];
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  isSystemFallback?: boolean;
}

export interface ScriptFallbackStrategy {
  script: "latin" | "cjk" | "arabic" | "cyrillic" | "greek" | "thai" | "hebrew" | "devanagari";
  strategy: "brand-webfont" | "system-os" | "unicode-range";
  selector?: string; // e.g. ":lang(zh-Hans), :lang(zh-Hant), :lang(ja)"
  stack: string;
  rationale?: string;
}

export interface TypescaleStep {
  name: string; // e.g. "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"
  size: string; // e.g. "1rem" or "clamp(1.13rem, 0.21vw + 1.08rem, 1.33rem)"
  pixelEquiv?: number; // Estimated base px at 1280px viewport
  fluid: boolean;
  clampMin?: string;
  clampPreferred?: string;
  clampMax?: string;
}

export interface LeadingDefinition {
  model: LeadingModel;
  normal: string; // e.g. "calc(6px + 2.125ex)" or "1.5" or "24px"
  tight?: string;
  loose?: string;
  formulaDescription?: string;
}

export interface SemanticTypeRole {
  scale: string; // Key into typescale steps, e.g. "md-lg" or "3xl"
  weight: number;
  tracking?: string; // letter-spacing, e.g. "-0.02em" or "1px"
  leading?: string;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
  targetElements?: string[]; // e.g. ["h1", "h2", ".title-large"]
}

export interface TypographyBlueprint {
  brandTypeface: TypefaceDefinition;
  fallbackTypefaces?: TypefaceDefinition[];
  scriptFallbacks?: Record<string, ScriptFallbackStrategy>;
  rendering: {
    fontSmoothing: "auto" | "antialiased" | "subpixel-antialiased";
    textRendering?: "optimizeLegibility" | "optimizeSpeed" | "geometricPrecision";
  };
  typescale: {
    model: TypescaleModel;
    ratio?: number; // e.g. 1.25 (Major Third), 1.333 (Perfect Fourth)
    scale: Record<string, TypescaleStep>;
  };
  leading: LeadingDefinition;
  weights: Record<string, number>; // e.g. { "normal": 400, "semibold": 600, "bold": 700 }
  semanticRoles: Record<string, SemanticTypeRole>; // display, headline, title, body, label, caption, code
}

// ==========================================
// 2. COLOR & THEMING SUBSYSTEM BLUEPRINT
// ==========================================

export type ThemingMode = "light-dark-css" | "class-toggle" | "media-query" | "attribute-selector";

export interface SurfaceHierarchy {
  canvas: string; // Base page canvas background
  surface: string; // Standard card container
  surfaceContainerLow?: string;
  surfaceContainer?: string;
  surfaceContainerHigh?: string;
  frosted?: string; // Translucent glass background
  frostedSoft?: string;
  frostedStrong?: string;
  backdrop: string; // Modal / scrim overlay
}

export interface ContrastRamp {
  primary: string; // 100% accessible text / key icons
  contrastHigher?: string; // 80% emphasis
  contrastHigh: string; // 70% emphasis (subtitles, secondary copy)
  contrastMedium: string; // 55-60% emphasis (tertiary text, placeholders)
  contrastLow: string; // 45-50% emphasis (decorative borders, non-text)
  contrastLower: string; // 30% emphasis (subtle 1px dividers)
}

export interface SemanticIntentColor {
  base: string;
  onBase: string;
  container?: string;
  onContainer?: string;
  frosted?: string;
  low?: string;
}

export interface ColorBlueprint {
  theming: {
    mode: ThemingMode;
    supportsLightDarkFunction: boolean;
    forcedColorsSupport: boolean;
  };
  surfaces: SurfaceHierarchy;
  foregrounds: ContrastRamp;
  brand: {
    primary: string;
    onPrimary: string;
    primaryContainer?: string;
    onPrimaryContainer?: string;
    secondary?: string;
    onSecondary?: string;
  };
  semantics: {
    info: SemanticIntentColor;
    success: SemanticIntentColor;
    warning: SemanticIntentColor;
    error: SemanticIntentColor;
  };
  interactive: {
    focusRing: string;
    focusOffset: string;
    hoverOverlay: string;
    pressedOverlay: string;
  };
}

// ==========================================
// 3. SPACING & LAYOUT SUBSYSTEM BLUEPRINT
// ==========================================

export interface SpacingStep {
  name: string;
  value: string; // e.g. "8px" or "clamp(8px, 0.5vw + 6px, 16px)"
  pixelEquiv: number;
  fluid: boolean;
}

export interface GridDefinition {
  columns: number; // e.g. 12
  columnGap: string; // e.g. "clamp(16px, 1.25vw + 12px, 24px)"
  maxWidth?: string;
  containerQueries: boolean;
}

export interface SpacingBlueprint {
  quantumBase: number; // e.g. 4 or 8
  staticRamp: Record<string, SpacingStep>;
  fluidRamp?: Record<string, SpacingStep>;
  grid: GridDefinition;
}

// ==========================================
// 4. SHAPE & ELEVATION SUBSYSTEM BLUEPRINT
// ==========================================

export type ElevationStrategy = "flat-surface" | "flat-outlined" | "shadow-matrix" | "frosted-glass" | "hybrid";

export interface CornerRadiusTier {
  name: string;
  value: string; // e.g. "4px", "18px", "28px", "9999px"
  pixelEquiv: number;
  semanticTarget: string; // e.g. "context-menus", "cards", "dialogs", "pills"
}

export interface ShadowStep {
  name: string;
  value: string; // e.g. "0px 3px 8px rgba(0,0,0,.16)"
  elevationLevel?: number;
}

export interface FrostedGlassStep {
  name: string;
  blur: string; // e.g. "blur(64px)"
  maskLinearGradient?: string;
  backgroundColor: string;
}

export interface ShapeBlueprint {
  radiusHierarchy: Record<string, CornerRadiusTier>;
  elevation: {
    primaryStrategy: ElevationStrategy;
    shadows: Record<string, ShadowStep>;
    frostedGlass?: Record<string, FrostedGlassStep>;
  };
}

// ==========================================
// 5. COMPONENT SLOTS & LIFECYCLE BLUEPRINT
// ==========================================

export type StandardSlotName = 
  | "header"
  | "eyebrow"
  | "media"
  | "title"
  | "content"
  | "footer"
  | "actions"
  | "secondary"
  | "emptyState"
  | "custom";

export interface ComponentSlotDefinition {
  name: string;
  role: StandardSlotName;
  description: string;
  required: boolean;
  acceptedComponents?: string[]; // e.g. ["Badge", "PublisherIcon", "Button"]
  defaultContent?: string;
}

export interface ComponentStateContract {
  state: "default" | "hover" | "active" | "focus-visible" | "disabled" | "loading" | "empty" | "error";
  visualChanges: {
    backgroundColor?: string;
    border?: string;
    boxShadow?: string;
    opacity?: number;
    outline?: string;
  };
}

export interface ComponentBlueprint {
  name: string;
  family: "Actions" | "Containment" | "Navigation" | "Communication" | "Selection" | "TextInputs";
  description: string;
  domElement: string; // e.g. "<article>", "<button>", "<p-canvas>"
  minBoundingBox: { width: number; height: number }; // Invariant: touch targets >= 48x48px
  slots: Record<string, ComponentSlotDefinition>;
  states: Record<string, ComponentStateContract>;
  variants: Record<string, Record<string, unknown>>;
  enforcedRules: string[];
}

// ==========================================
// 6. MACHINE INVARIANTS & EVALUATOR BLUEPRINT
// ==========================================

export interface InvariantRuleBlueprint {
  id: string; // e.g. "TDS-GHOST-BORDER-HALLUCINATION"
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  category: "Surface" | "Typography" | "Shape" | "Color" | "Spacing" | "A11y" | "Brand";
  description: string;
  pattern: {
    targetSelectors: string[];
    forbiddenStyles?: Record<string, string | RegExp>;
    requiredStyles?: Record<string, string | RegExp>;
    customValidator?: string; // name of evaluator validator function
  };
  fixRecommendation: string;
}

// ==========================================
// ROOT DESIGN SYSTEM BLUEPRINT
// ==========================================

export interface DesignSystemBlueprint {
  metadata: DesignSystemMetadata;
  typography: TypographyBlueprint;
  color: ColorBlueprint;
  spacing: SpacingBlueprint;
  shape: ShapeBlueprint;
  components: Record<string, ComponentBlueprint>;
  invariants: InvariantRuleBlueprint[];
}
