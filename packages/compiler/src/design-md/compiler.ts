import YAML from "yaml";
import { 
  M3DualColorScheme, 
  M3Typescale, 
  M3StateLayers, 
  M3ElevationSystem, 
  ComponentManifest, 
  TrainableDsConfig 
} from "@trainable-ds/core";

export interface DesignMdCompileOptions {
  config: TrainableDsConfig;
  colors: M3DualColorScheme;
  typescale: M3Typescale;
  state: M3StateLayers;
  elevation: M3ElevationSystem;
  components?: ComponentManifest;
  designThesis?: string;
  rationaleNotes?: string[];
  executableRules?: string[];
}

/**
 * Compiles deep Trainable DS M3 tokens into a human-friendly,
 * agent-actionable Enhanced DESIGN.md file.
 */
export function compileDesignMd(options: DesignMdCompileOptions): string {
  const { 
    config, 
    colors, 
    typescale, 
    state, 
    elevation, 
    components, 
    designThesis = "Functional clarity, high information density, and brand consistency.",
    rationaleNotes = [
      "Surfaces use subtle tonal containers to organize data without visual fatigue.",
      "Primary action color is reserved strictly for interactive user focus.",
      "Strict 8px baseline grid to guarantee visual rhythm across views."
    ],
    executableRules = [
      "NO RAW HEX CODES: All colors must resolve to semantic tokens (e.g. sys.color.primary).",
      "NO REINVENTED PRIMITIVES: Always import certified components (<Button>, <TextField>) instead of raw HTML.",
      "SENTENCE CASE MANDATE: All button, navigation, and chip labels MUST be sentence case.",
      "ON-COLOR PAIRING: Backgrounds using sys.color.primary MUST use text colored with sys.color.on-primary.",
      "MINIMUM TOUCH TARGET: All clickable elements must maintain at least 48x48px touch targets.",
      "STRICT SPEC & SKETCH FIDELITY (ZERO FEATURE HALLUCINATION): Strictly adhere to user sketches, wireframes, and commands. Never invent unrequested features, buttons, or action tiles (e.g. flash & horn, heating, tire pressure) to fill empty space.",
      "INTENTIONAL WHITESPACE & PLACEHOLDER MANDATE: When an area is marked 'Whitespace (for now)' or left empty in a sketch, do not invent features. Either ask the user proactively first or render an explicit visual placeholder making it clear the space is intentionally left empty."
    ]
  } = options;

  // Build Frontmatter Object
  const frontmatter = {
    schema: "trainable-ds/v1.7",
    name: config.name,
    version: config.version,
    mode: config.mode,
    framework: config.framework,
    tokens: {
      system: {
        color: {
          light: {
            primary: colors?.light?.primary?.$value || "#6750a4",
            onPrimary: colors?.light?.onPrimary?.$value || "#ffffff",
            primaryContainer: colors?.light?.primaryContainer?.$value || "#eaddff",
            onPrimaryContainer: colors?.light?.onPrimaryContainer?.$value || "#21005d",
            surface: colors?.light?.surface?.$value || "#fef7ff",
            onSurface: colors?.light?.onSurface?.$value || "#1d1b20",
            surfaceContainer: colors?.light?.surfaceContainer?.$value || "#f3edf7",
            surfaceContainerHigh: colors?.light?.surfaceContainerHigh?.$value || "#ece6f0",
            outline: colors?.light?.outline?.$value || "#79747e",
          },
          dark: {
            primary: colors?.dark?.primary?.$value || "#d0bcff",
            onPrimary: colors?.dark?.onPrimary?.$value || "#381e72",
            primaryContainer: colors?.dark?.primaryContainer?.$value || "#4f378b",
            onPrimaryContainer: colors?.dark?.onPrimaryContainer?.$value || "#eaddff",
            surface: colors?.dark?.surface?.$value || "#141218",
            onSurface: colors?.dark?.onSurface?.$value || "#e6e1e5",
            surfaceContainer: colors?.dark?.surfaceContainer?.$value || "#211f26",
            surfaceContainerHigh: colors?.dark?.surfaceContainerHigh?.$value || "#2b2930",
            outline: colors?.dark?.outline?.$value || "#938f99",
          }
        },
        typescale: {
          headlineMedium: {
            font: typescale?.headlineMedium?.fontFamily?.$value || "Inter, sans-serif",
            size: typescale?.headlineMedium?.fontSize?.$value || "28px",
            line: typescale?.headlineMedium?.lineHeight?.$value || "36px",
            weight: typescale?.headlineMedium?.fontWeight?.$value || "400",
          },
          bodyLarge: {
            font: typescale?.bodyLarge?.fontFamily?.$value || "Inter, sans-serif",
            size: typescale?.bodyLarge?.fontSize?.$value || "16px",
            line: typescale?.bodyLarge?.lineHeight?.$value || "24px",
            weight: typescale?.bodyLarge?.fontWeight?.$value || "400",
          },
          labelLarge: {
            font: typescale?.labelLarge?.fontFamily?.$value || "Inter, sans-serif",
            size: typescale?.labelLarge?.fontSize?.$value || "14px",
            line: typescale?.labelLarge?.lineHeight?.$value || "20px",
            weight: typescale?.labelLarge?.fontWeight?.$value || "500",
          }
        },
        state: {
          hover: state?.hover?.$value || 0.08,
          focus: {
            opacity: state?.focus?.$value || 0.10,
            ringWidth: state?.focusRingWidth?.$value || "3px",
            ringOffset: state?.focusRingOffset?.$value || "2px",
          },
          pressed: state?.pressed?.$value || 0.10,
          disabled: {
            content: state?.disabledContent?.$value || 0.38,
            container: state?.disabledContainer?.$value || 0.12,
          }
        },
        elevation: {
          level0: { tint: elevation?.level0?.surfaceTintPercentage?.$value ?? 0 },
          level1: { tint: elevation?.level1?.surfaceTintPercentage?.$value ?? 0.05 },
          level2: { tint: elevation?.level2?.surfaceTintPercentage?.$value ?? 0.08 },
          level3: { tint: elevation?.level3?.surfaceTintPercentage?.$value ?? 0.11 },
        }
      }
    }
  };

  const yamlStr = YAML.stringify(frontmatter);

  // Build Component Snippets Section
  let componentSnippets = "";
  if (components && Object.keys(components.components).length > 0) {
    componentSnippets = Object.values(components.components).map(comp => {
      return `### ${comp.name} (\`${comp.path}\`)
- **Import:** \`import { ${comp.name} } from "${comp.path}";\`
- **Family:** ${comp.family}
- **Description:** ${comp.description}
- **Variants:** ${Object.keys(comp.variants).join(", ")}
${comp.examples.length > 0 ? `\`\`\`tsx\n${comp.examples[0]}\n\`\`\`` : ""}
`;
    }).join("\n");
  } else {
    componentSnippets = `*Run \`tds train\` to discover and catalog your codebase components.*`;
  }

  // Combine into full markdown
  return `---
${yamlStr.trim()}
---

# Design System: ${config.name}

## 1. Visual Philosophy & Semantic Intent ("The Why")
> **Design Thesis:** ${designThesis}
${rationaleNotes.map(n => `- ${n}`).join("\n")}

## 2. Foundations Quick-Reference
### Color Roles & Contrast Pairings
- **Primary Action:** \`sys.color.primary\` (${colors?.light?.primary?.$value || "#6750a4"}) paired with \`sys.color.on-primary\` (${colors?.light?.onPrimary?.$value || "#ffffff"}).
- **Surface Hierarchy:** Default card container is \`surface-container\` (${colors?.light?.surfaceContainer?.$value || "#f3edf7"}); elevated dialogs use \`surface-container-high\` (${colors?.light?.surfaceContainerHigh?.$value || "#ece6f0"}).
- **Border Outline:** 3:1 accessible boundaries use \`outline\` (${colors?.light?.outline?.$value || "#79747e"}).

### Typography Hierarchy (Sentence Case)
- **Headline Medium:** ${typescale?.headlineMedium?.fontSize?.$value || "28px"}/${typescale?.headlineMedium?.lineHeight?.$value || "36px"} (${typescale?.headlineMedium?.fontWeight?.$value || "400"} weight)
- **Body Large:** ${typescale?.bodyLarge?.fontSize?.$value || "16px"}/${typescale?.bodyLarge?.lineHeight?.$value || "24px"} (${typescale?.bodyLarge?.fontWeight?.$value || "400"} weight)
- **Label Large:** ${typescale?.labelLarge?.fontSize?.$value || "14px"}/${typescale?.labelLarge?.lineHeight?.$value || "20px"} (${typescale?.labelLarge?.fontWeight?.$value || "500"} weight) — Used on buttons, chips, tabs.

### Interaction State Layers
- **Hover:** ${Number(state?.hover?.$value || 0.08) * 100}% overlay of paired \`on-*\` token.
- **Focus:** ${Number(state?.focus?.$value || 0.10) * 100}% overlay + ${state?.focusRingWidth?.$value || "3px"} outline ring.
- **Disabled:** ${Number(state?.disabledContent?.$value || 0.38) * 100}% text opacity, ${Number(state?.disabledContainer?.$value || 0.12) * 100}% container fill opacity.

## 3. Core Component Library (Certified Contracts)
*Always import and compose certified primitives. Never construct ad-hoc HTML buttons or inputs.*

${componentSnippets}

## 4. Executable Constraints & Anti-Patterns (Evaluated by \`tds evaluate\`)
> [!CAUTION]
> The following rules are enforced by the automated compliance engine. Violations will fail certification:

${executableRules.map((rule, idx) => `${idx + 1}. **${rule.split(":")[0]}:** ${rule.split(":").slice(1).join(":") || rule}`).join("\n")}
`;
}

/**
 * Parses a DESIGN.md file into YAML frontmatter and markdown sections.
 */
export function parseDesignMd(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  try {
    const frontmatter = YAML.parse(match[1]) || {};
    return { frontmatter, body: match[2] };
  } catch {
    return { frontmatter: {}, body: content };
  }
}
