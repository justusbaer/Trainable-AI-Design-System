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
      "MINIMUM TOUCH TARGET: All clickable elements must maintain at least 48x48px touch targets."
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
            primary: colors.light.primary.$value,
            onPrimary: colors.light.onPrimary.$value,
            primaryContainer: colors.light.primaryContainer.$value,
            onPrimaryContainer: colors.light.onPrimaryContainer.$value,
            surface: colors.light.surface.$value,
            onSurface: colors.light.onSurface.$value,
            surfaceContainer: colors.light.surfaceContainer.$value,
            surfaceContainerHigh: colors.light.surfaceContainerHigh.$value,
            outline: colors.light.outline.$value,
          },
          dark: {
            primary: colors.dark.primary.$value,
            onPrimary: colors.dark.onPrimary.$value,
            primaryContainer: colors.dark.primaryContainer.$value,
            onPrimaryContainer: colors.dark.onPrimaryContainer.$value,
            surface: colors.dark.surface.$value,
            onSurface: colors.dark.onSurface.$value,
            surfaceContainer: colors.dark.surfaceContainer.$value,
            surfaceContainerHigh: colors.dark.surfaceContainerHigh.$value,
            outline: colors.dark.outline.$value,
          }
        },
        typescale: {
          headlineMedium: {
            font: typescale.headlineMedium.fontFamily.$value,
            size: typescale.headlineMedium.fontSize.$value,
            line: typescale.headlineMedium.lineHeight.$value,
            weight: typescale.headlineMedium.fontWeight.$value,
          },
          bodyLarge: {
            font: typescale.bodyLarge.fontFamily.$value,
            size: typescale.bodyLarge.fontSize.$value,
            line: typescale.bodyLarge.lineHeight.$value,
            weight: typescale.bodyLarge.fontWeight.$value,
          },
          labelLarge: {
            font: typescale.labelLarge.fontFamily.$value,
            size: typescale.labelLarge.fontSize.$value,
            line: typescale.labelLarge.lineHeight.$value,
            weight: typescale.labelLarge.fontWeight.$value,
          }
        },
        state: {
          hover: state.hover.$value,
          focus: {
            opacity: state.focus.$value,
            ringWidth: state.focusRingWidth.$value,
            ringOffset: state.focusRingOffset.$value,
          },
          pressed: state.pressed.$value,
          disabled: {
            content: state.disabledContent.$value,
            container: state.disabledContainer.$value,
          }
        },
        elevation: {
          level0: { tint: elevation.level0.surfaceTintPercentage.$value },
          level1: { tint: elevation.level1.surfaceTintPercentage.$value },
          level2: { tint: elevation.level2.surfaceTintPercentage.$value },
          level3: { tint: elevation.level3.surfaceTintPercentage.$value },
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
- **Primary Action:** \`sys.color.primary\` (${colors.light.primary.$value}) paired with \`sys.color.on-primary\` (${colors.light.onPrimary.$value}).
- **Surface Hierarchy:** Default card container is \`surface-container\` (${colors.light.surfaceContainer.$value}); elevated dialogs use \`surface-container-high\` (${colors.light.surfaceContainerHigh.$value}).
- **Border Outline:** 3:1 accessible boundaries use \`outline\` (${colors.light.outline.$value}).

### Typography Hierarchy (Sentence Case)
- **Headline Medium:** ${typescale.headlineMedium.fontSize.$value}/${typescale.headlineMedium.lineHeight.$value} (${typescale.headlineMedium.fontWeight.$value} weight)
- **Body Large:** ${typescale.bodyLarge.fontSize.$value}/${typescale.bodyLarge.lineHeight.$value} (${typescale.bodyLarge.fontWeight.$value} weight)
- **Label Large:** ${typescale.labelLarge.fontSize.$value}/${typescale.labelLarge.lineHeight.$value} (${typescale.labelLarge.fontWeight.$value} weight) — Used on buttons, chips, tabs.

### Interaction State Layers
- **Hover:** ${Number(state.hover.$value) * 100}% overlay of paired \`on-*\` token.
- **Focus:** ${Number(state.focus.$value) * 100}% overlay + ${state.focusRingWidth.$value} outline ring.
- **Disabled:** ${Number(state.disabledContent.$value) * 100}% text opacity, ${Number(state.disabledContainer.$value) * 100}% container fill opacity.

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
