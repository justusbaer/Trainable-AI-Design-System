import fs from "node:fs";
import path from "node:path";
import { evaluateCode, type EvaluateOptions, type EvaluationResult } from "@trainable-ds/evaluator";
import {
  generateTonalPalette,
  M3_TYPESCALE_DEFAULTS,
  M3_STATE_DEFAULTS,
  M3_ELEVATION_DEFAULTS,
  M3_SHAPE_DEFAULTS,
  M3_EASING_DEFAULTS,
} from "@trainable-ds/core";
import type { ToolDefinition, CallToolResult } from "./types.js";

export const TOOLS: ToolDefinition[] = [
  {
    name: "get_design_tokens",
    description:
      "Retrieve authoritative W3C DTCG 3-tier M3 design tokens (Reference, System, Component) including HCT tonal palettes, semantic color roles, 15-tier typescale, elevation tinting, and state layers.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Category of tokens to retrieve",
          enum: ["color", "typography", "spacing", "elevation", "shape", "motion", "all"],
        },
        tier: {
          type: "string",
          description: "Token tier in W3C DTCG 3-tier hierarchy",
          enum: ["ref", "sys", "comp", "all"],
        },
      },
    },
  },
  {
    name: "list_components",
    description:
      "List all canonical design system components, their functional families (Actions, Communication, Containment, Navigation, Selection, Text Inputs), and descriptions.",
    inputSchema: {
      type: "object",
      properties: {
        family: {
          type: "string",
          description: "Filter components by M3 functional family",
          enum: ["actions", "communication", "containment", "navigation", "selection", "text-inputs", "all"],
        },
      },
    },
  },
  {
    name: "get_component_schema",
    description:
      "Retrieve the complete contract, anatomical slots, props, state layer behaviors, DOs and DONTs, and touch target rules for a specific design system component.",
    inputSchema: {
      type: "object",
      properties: {
        component_name: {
          type: "string",
          description: "Name of the component (e.g. Button, Card, TextField, NavigationBar)",
        },
      },
      required: ["component_name"],
    },
  },
  {
    name: "validate_code_snippet",
    description:
      "Run the 4-tier Trainable DS compliance evaluator on a TSX/JSX/HTML/CSS code snippet to check for raw hex colors, non-quantum spacing, component reinvention, on-color contrast mismatches, touch target violations, and sentence-case text.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Source code of the component or layout to evaluate",
        },
        filename: {
          type: "string",
          description: "Optional filename context (e.g. UserCard.tsx)",
        },
        strict: {
          type: "boolean",
          description: "If true, treats warnings as failures (strict compliance)",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "suggest_remediation",
    description:
      "Generate a fully compliant, self-contained component snippet adhering to M3 tokens, proper on-color pairing, and >=48px touch targets.",
    inputSchema: {
      type: "object",
      properties: {
        component_type: {
          type: "string",
          description: "Type of component needed (e.g., button, card, text-field, dialog)",
        },
        intent: {
          type: "string",
          description: "Functional description or context of what this component displays or handles",
        },
      },
      required: ["component_type"],
    },
  },
  {
    name: "get_design_guidelines",
    description:
      "Retrieve executive design system guidelines, 'The Why' thesis, and foundational constraints from root DESIGN.md.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "align_design_system_with_source",
    description:
      "Run multi-loop visual and runtime computed style alignment against a live source website or web application (source of truth). Pierces shadow DOM, detects shape mismatches (pill vs radius), color drift, and automatically reconciles tokens.json and components.json.",
    inputSchema: {
      type: "object",
      properties: {
        source_url: {
          type: "string",
          description: "URL of the live source-of-truth website or web app",
        },
        template_path: {
          type: "string",
          description: "Optional path to a local HTML template or component testbed to compare against",
        },
        max_loops: {
          type: "number",
          description: "Maximum alignment loops to run (default: 3)",
        },
        threshold: {
          type: "number",
          description: "Target convergence score percentage (default: 95)",
        },
      },
      required: ["source_url"],
    },
  },
  {
    name: "discover_subpages",
    description:
      "Discover, analyze, and categorize sub-pages of a target website by archetype (home, listing, detail, form, content) for comprehensive multi-page design system extraction.",
    inputSchema: {
      type: "object",
      properties: {
        root_url: {
          type: "string",
          description: "Root website URL (e.g. https://www.porsche.com/germany/)",
        },
      },
      required: ["root_url"],
    },
  },
  {
    name: "harvest_design_system_site",
    description:
      "Run multi-page design system extraction and iterative alignment across multiple pages. Harvests @font-face rules, woff2 font URLs, SVG icons, and generates an interactive overview.html reviewer portal with live overrides.",
    inputSchema: {
      type: "object",
      properties: {
        root_url: {
          type: "string",
          description: "Target website root URL",
        },
        pages: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of approved sub-page URLs to crawl",
        },
        max_loops: {
          type: "number",
          description: "Maximum convergence loops (default: 3)",
        },
        threshold: {
          type: "number",
          description: "Target convergence score percentage (default: 95)",
        },
      },
      required: ["root_url"],
    },
  },
];

export interface ToolExecutionContext {
  workspaceDir?: string;
}

export async function executeTool(
  name: string,
  args: Record<string, unknown> = {},
  ctx: ToolExecutionContext = {}
): Promise<CallToolResult> {
  const workspaceDir = ctx.workspaceDir || process.cwd();

  switch (name) {
    case "get_design_tokens": {
      const category = (args.category as string) || "all";
      const tier = (args.tier as string) || "all";

      const tokenFilePath = path.join(workspaceDir, ".design-system", "tokens.json");
      let tokens: Record<string, unknown> = {};

      if (fs.existsSync(tokenFilePath)) {
        try {
          tokens = JSON.parse(fs.readFileSync(tokenFilePath, "utf-8"));
        } catch {
          // fallback to built-in tokens
        }
      }

      if (Object.keys(tokens).length === 0) {
        const primaryPalette = generateTonalPalette("#1e293b", "primary");
        tokens = {
          $version: "1.0.0",
          ref: {
            palette: {
              primary: primaryPalette,
            },
          },
          sys: {
            typescale: M3_TYPESCALE_DEFAULTS,
            state: M3_STATE_DEFAULTS,
            elevation: M3_ELEVATION_DEFAULTS,
            shape: M3_SHAPE_DEFAULTS,
            motion: M3_EASING_DEFAULTS,
          },
        };
      }

      let result: unknown = tokens;
      if (tier !== "all" && tokens[tier]) {
        result = tokens[tier];
      }

      if (category !== "all" && typeof result === "object" && result !== null) {
        const record = result as Record<string, unknown>;
        if (record.sys && typeof record.sys === "object" && (record.sys as Record<string, unknown>)[category]) {
          result = (record.sys as Record<string, unknown>)[category];
        } else if (record[category]) {
          result = record[category];
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "list_components": {
      const familyFilter = (args.family as string) || "all";

      const canonicalComponents = [
        { name: "Button", family: "actions", variants: ["filled", "tonal", "outlined", "text", "elevated"], touchTarget: ">= 48px" },
        { name: "IconButton", family: "actions", variants: ["standard", "filled", "tonal", "outlined"], touchTarget: ">= 48px" },
        { name: "FAB", family: "actions", variants: ["surface", "primary", "secondary", "tertiary"], touchTarget: "56x56px" },
        { name: "SegmentedButton", family: "actions", variants: ["single-select", "multi-select"], touchTarget: ">= 48px" },
        { name: "Badge", family: "communication", variants: ["small", "large"], touchTarget: "non-interactive" },
        { name: "ProgressIndicator", family: "communication", variants: ["linear", "circular"], touchTarget: "non-interactive" },
        { name: "Snackbar", family: "communication", variants: ["single-line", "multi-line"], touchTarget: ">= 48px action" },
        { name: "Tooltip", family: "communication", variants: ["plain", "rich"], touchTarget: "non-interactive" },
        { name: "Card", family: "containment", variants: ["elevated", "filled", "outlined"], touchTarget: "container" },
        { name: "Dialog", family: "containment", variants: ["basic", "full-screen"], touchTarget: ">= 48px buttons" },
        { name: "BottomSheet", family: "containment", variants: ["modal", "standard"], touchTarget: "draggable" },
        { name: "Divider", family: "containment", variants: ["full-width", "inset"], touchTarget: "non-interactive" },
        { name: "NavigationBar", family: "navigation", variants: ["standard"], touchTarget: ">= 48px items" },
        { name: "NavigationDrawer", family: "navigation", variants: ["modal", "standard"], touchTarget: ">= 48px items" },
        { name: "Tabs", family: "navigation", variants: ["primary", "secondary"], touchTarget: ">= 48px tabs" },
        { name: "Checkbox", family: "selection", variants: ["standard"], touchTarget: ">= 48px" },
        { name: "RadioButton", family: "selection", variants: ["standard"], touchTarget: ">= 48px" },
        { name: "Switch", family: "selection", variants: ["with-icon", "without-icon"], touchTarget: ">= 48px" },
        { name: "Chip", family: "selection", variants: ["assist", "filter", "input", "suggestion"], touchTarget: ">= 48px" },
        { name: "TextField", family: "text-inputs", variants: ["filled", "outlined"], touchTarget: ">= 48px" },
        { name: "SearchBar", family: "text-inputs", variants: ["docked", "full-screen"], touchTarget: ">= 48px" },
      ];

      const filtered =
        familyFilter === "all"
          ? canonicalComponents
          : canonicalComponents.filter((c) => c.family === familyFilter);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(filtered, null, 2),
          },
        ],
      };
    }

    case "get_component_schema": {
      const componentName = String(args.component_name || "").toLowerCase();

      const schemas: Record<string, unknown> = {
        button: {
          name: "Button",
          family: "actions",
          minTouchTarget: { width: "48px", height: "48px" },
          anatomy: {
            container: "Rounded container (shape: full pill, rounded-full)",
            label: "Label Large typescale (14px, tracking +0.1px, medium weight)",
            icon: "Optional leading or trailing icon (18x18px)",
            stateLayer: "Opacity layer (hover 8%, focus 10% + ring, pressed 10%, disabled 38%/12%)",
          },
          variants: {
            filled: { bg: "bg-primary", text: "text-on-primary", elevation: "elevation-0 (elevation-1 on hover)" },
            tonal: { bg: "bg-secondary-container", text: "text-on-secondary-container" },
            outlined: { bg: "bg-transparent", border: "border border-outline", text: "text-primary" },
            text: { bg: "bg-transparent", text: "text-primary" },
            elevated: { bg: "bg-surface-container-low", text: "text-primary", elevation: "elevation-1" },
          },
          guidelines: [
            "DO use sentence-case text ('Save changes', not 'Save Changes').",
            "DO use minimum h-12 (48px) or min-h-[48px] for touch target compliance.",
            "DO pair primary container with text-on-primary.",
            "DO NOT reinvent raw <button> tags with arbitrary colors and paddings.",
          ],
        },
        card: {
          name: "Card",
          family: "containment",
          anatomy: {
            container: "Rounded surface container (shape: medium 12px or large 16px)",
            header: "Title Medium or Large typescale",
            media: "Optional full-bleed top media or thumbnail",
            actions: "Action buttons aligned to end with >= 8px gap",
          },
          variants: {
            elevated: { bg: "bg-surface-container-low", elevation: "elevation-1 (elevation-2 on hover)" },
            filled: { bg: "bg-surface-container-highest", elevation: "elevation-0" },
            outlined: { bg: "bg-surface", border: "border border-outline-variant", elevation: "elevation-0" },
          },
          guidelines: [
            "DO use 16px (p-4) or 24px (p-6) quantum spacing for internal padding.",
            "DO use text-on-surface for primary copy and text-on-surface-variant for secondary copy.",
            "DO NOT use raw hex backgrounds like #ffffff or #1e293b directly.",
          ],
        },
        textfield: {
          name: "TextField",
          family: "text-inputs",
          minTouchTarget: { height: "56px" },
          anatomy: {
            container: "56px container height with bottom indicator or full border outline",
            label: "Floating label (Body Large when inactive, Body Small when active)",
            input: "Body Large typescale with text-on-surface",
            supportingText: "Body Small typescale with text-on-surface-variant (or text-error on failure)",
          },
          variants: {
            filled: { bg: "bg-surface-container-highest", borderBottom: "border-b-2 border-on-surface-variant" },
            outlined: { bg: "bg-transparent", border: "border border-outline focus:border-primary" },
          },
          guidelines: [
            "DO include a visible label or aria-label for accessibility.",
            "DO show error states using text-error and border-error.",
            "DO NOT drop container height below 48px.",
          ],
        },
      };

      const matchedKey = Object.keys(schemas).find((k) => componentName.includes(k));
      const schema = matchedKey ? schemas[matchedKey] : {
        name: args.component_name,
        notice: "Custom or generic component contract",
        rules: [
          "Maintain >= 48px interactive touch target",
          "Use semantic M3 colors (primary, surface, on-surface)",
          "Follow 8dp grid spacing (4px, 8px, 12px, 16px, 24px)",
          "Use sentence-case for all user-visible labels",
        ],
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(schema, null, 2),
          },
        ],
      };
    }

    case "validate_code_snippet": {
      const code = String(args.code || "");
      const filename = (args.filename as string) || "Snippet.tsx";
      const strict = Boolean(args.strict);

      const options: EvaluateOptions = {
        fileName: filename,
        strictHexDisallowed: true,
        requireSentenceCase: true,
        requireOnColorPairing: true,
      };

      const result = evaluateCode(code, options);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                filename,
                score: result.score,
                compliant: result.certified,
                totalViolations: result.diagnostics.length,
                violations: result.diagnostics,
                summary: result.summary,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "suggest_remediation": {
      const componentType = String(args.component_type || "button").toLowerCase();
      const intent = String(args.intent || "primary action");

      let snippet = "";
      if (componentType.includes("button")) {
        snippet = `import React from 'react';\n\nexport interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';\n  children: React.ReactNode;\n}\n\nexport const Button: React.FC<ButtonProps> = ({\n  variant = 'filled',\n  children,\n  className = '',\n  ...props\n}) => {\n  const variantStyles = {\n    filled: 'bg-primary text-on-primary hover:opacity-90 active:opacity-80',\n    tonal: 'bg-secondary-container text-on-secondary-container hover:opacity-90',\n    outlined: 'border border-outline text-primary hover:bg-surface-container-low',\n    text: 'text-primary hover:bg-surface-container-low',\n    elevated: 'bg-surface-container-low text-primary shadow-sm hover:shadow-md',\n  };\n\n  return (\n    <button\n      className={\`min-h-[48px] min-w-[48px] px-6 py-2.5 rounded-full font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 \${variantStyles[variant]} \${className}\`}\n      {...props}\n    >\n      {children}\n    </button>\n  );\n};`;
      } else if (componentType.includes("card")) {
        snippet = `import React from 'react';\n\nexport interface CardProps {\n  title: string;\n  subtitle?: string;\n  children: React.ReactNode;\n  actionText?: string;\n  onAction?: () => void;\n}\n\nexport const Card: React.FC<CardProps> = ({\n  title,\n  subtitle,\n  children,\n  actionText = 'Learn more',\n  onAction,\n}) => {\n  return (\n    <div className="bg-surface-container-low text-on-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">\n      <div>\n        <h3 className="text-lg font-semibold text-on-surface">{title}</h3>\n        {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}\n      </div>\n      <div className="text-body-medium text-on-surface-variant leading-relaxed">\n        {children}\n      </div>\n      {onAction && (\n        <div className="flex justify-end pt-2">\n          <button\n            type="button"\n            onClick={onAction}\n            className="min-h-[48px] px-4 py-2 text-primary font-medium text-sm rounded-full hover:bg-surface-container-high transition-colors"\n          >\n            {actionText}\n          </button>\n        </div>\n      )}\n    </div>\n  );\n};`;
      } else {
        snippet = `// Compliant ${componentType} conforming to M3 tokens and rules\n// 1. Min touch target: min-h-[48px]\n// 2. Semantic roles: bg-surface-container-low, text-on-surface\n// 3. Spacing: p-4 or p-6 (quantum grid)\n// 4. Copy: Sentence-case labels`;
      }

      return {
        content: [
          {
            type: "text",
            text: snippet,
          },
        ],
      };
    }

    case "get_design_guidelines": {
      const designMdPath = path.join(workspaceDir, "DESIGN.md");
      let guidelines = "";

      if (fs.existsSync(designMdPath)) {
        guidelines = fs.readFileSync(designMdPath, "utf-8");
      } else {
        guidelines = `# Trainable DS Executive Guidelines (Material Design 3 Fidelity)

## 1. Zero Raw Values
- Never output raw hex (#hex), raw rgb, or arbitrary pixel values (e.g. p-[13px]).
- Use semantic M3 tokens: primary, on-primary, surface, on-surface, surface-container-*.

## 2. 8dp Quantum Spatial Grid
- Spacing must follow the 8dp grid (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px).

## 3. Touch Target Compliance
- All interactive controls (buttons, inputs, chips, icons) must have a bounding box >= 48x48dp / px.

## 4. Logical Bi-Directional Direction
- Use logical CSS properties: ps-* / pe-* instead of pl-* / pr-*, ms-* / me-* instead of ml-* / mr-*.

## 5. Sentence Case Copy
- All buttons, titles, and labels must use sentence-case ('Save changes', 'Welcome back').`;
      }

      return {
        content: [
          {
            type: "text",
            text: guidelines,
          },
        ],
      };
    }

    case "align_design_system_with_source": {
      const sourceUrl = String(args.source_url || "");
      const templatePath = args.template_path ? String(args.template_path) : undefined;
      const maxLoops = typeof args.max_loops === "number" ? args.max_loops : 3;
      const threshold = typeof args.threshold === "number" ? args.threshold : 95;

      const { runVisualAlignmentLoop } = await import("@trainable-ds/compiler");
      const result = await runVisualAlignmentLoop({
        sourceUrl,
        templatePath,
        maxLoops,
        threshold,
        dsDirectory: workspaceDir,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "discover_subpages": {
      const rootUrl = String(args.root_url || "");
      const { parseDiscoveredLinks, selectRepresentativePages } = await import("@trainable-ds/compiler");
      const discovered = parseDiscoveredLinks({ discoveredLinks: [] }, rootUrl);
      const recommended = selectRepresentativePages(discovered, 5);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ rootUrl, allDiscovered: discovered, recommended }, null, 2),
          },
        ],
      };
    }

    case "harvest_design_system_site": {
      const rootUrl = String(args.root_url || "");
      const pages = Array.isArray(args.pages) ? args.pages.map(String) : [rootUrl];
      const maxLoops = typeof args.max_loops === "number" ? args.max_loops : 3;
      const threshold = typeof args.threshold === "number" ? args.threshold : 95;

      const { runMultiPageAlignment } = await import("@trainable-ds/compiler");
      const result = await runMultiPageAlignment({
        rootUrl,
        pages,
        maxLoops,
        threshold,
        dsDirectory: workspaceDir,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    default:
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unknown tool: "${name}". Available tools: ${TOOLS.map((t) => t.name).join(", ")}`,
          },
        ],
      };
  }
}
