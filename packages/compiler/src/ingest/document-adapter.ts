import { 
  IngestAdapter, 
  IngestResult, 
  TokenPatch, 
  ComponentPatch, 
  GuidelinePatch, 
  ProvenanceRecord 
} from "@trainable-ds/core";

export interface DocumentAdapterInput {
  content: string;
  documentTitle?: string;
  sourceUri?: string;
}

export class DocumentAdapter implements IngestAdapter<DocumentAdapterInput | string> {
  readonly name = "DocumentAdapter";
  readonly sourceType = "document" as const;

  async ingest(input: DocumentAdapterInput | string, options?: Record<string, unknown>): Promise<IngestResult> {
    const rawInput: DocumentAdapterInput = typeof input === "string" 
      ? { content: input, documentTitle: "brand-guidelines.md" } 
      : input;

    const title = rawInput.documentTitle || "Brand Guidelines";
    const timestamp = new Date().toISOString();
    const provenance: ProvenanceRecord = {
      source: rawInput.sourceUri || title,
      sourceType: "document",
      confidence: 0.85,
      timestamp,
      method: "nlp-guideline-extractor"
    };

    const tokens: TokenPatch[] = [];
    const components: ComponentPatch[] = [];
    const guidelines: GuidelinePatch[] = [];

    const lines = rawInput.content.split(/\r?\n/);

    // 1. Extract Colors
    this.extractColors(lines, tokens, provenance);

    // 2. Extract Typography & Fonts
    this.extractTypography(lines, tokens, provenance);

    // 3. Extract Spacing & Radius
    this.extractSpatialTokens(lines, tokens, provenance);

    // 4. Extract DOs, DONTs and Rules
    this.extractGuidelines(lines, guidelines, provenance);

    // 5. Extract Component Specifications
    this.extractComponentSpecs(rawInput.content, components, provenance);

    return {
      tokens,
      components,
      guidelines,
      provenance,
      summary: `Extracted ${tokens.length} tokens, ${components.length} component specs, and ${guidelines.length} guidelines from document (${title})`
    };
  }

  private extractColors(lines: string[], tokens: TokenPatch[], provenance: ProvenanceRecord): void {
    const hexPattern = /(?:(?:primary|secondary|tertiary|accent|background|surface|neutral|success|warning|error|danger|brand|text|muted)[\w\s.-]*?[:=]\s*|#)([0-9a-fA-F]{3,8})\b/i;
    const labelHexPattern = /([a-zA-Z0-9_\s.-]+?)[:=]\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\b/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match: RegExpExecArray | null;

      while ((match = labelHexPattern.exec(line)) !== null) {
        const rawLabel = match[1].replace(/^[-*#\s]+/, "").trim().toLowerCase();
        const colorVal = match[2].trim();

        if (this.isColorLabel(rawLabel)) {
          const path = `color.${rawLabel.replace(/[\s-]+/g, ".")}`;
          tokens.push({
            path,
            value: colorVal,
            type: "color",
            description: `Extracted from guideline text: "${line.trim()}"`,
            tier: path.includes("sys.") ? "sys" : "ref",
            confidence: provenance.confidence,
            provenance: {
              ...provenance,
              notes: `Line ${i + 1}`
            }
          });
        }
      }
    }
  }

  private isColorLabel(label: string): boolean {
    const keywords = [
      "primary", "secondary", "tertiary", "accent", "background", "surface", 
      "text", "neutral", "success", "error", "danger", "warning", "brand", 
      "border", "header", "dark", "light"
    ];
    return keywords.some(kw => label.includes(kw));
  }

  private extractTypography(lines: string[], tokens: TokenPatch[], provenance: ProvenanceRecord): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Font Family
      const fontMatch = line.match(/(?:font[-\s]?family|primary[-\s]?font|body[-\s]?font|heading[-\s]?font)[:=]\s*["']?([^"',;\n]+)["']?/i);
      if (fontMatch) {
        const fontName = fontMatch[1].trim();
        tokens.push({
          path: "typography.fontFamily.base",
          value: fontName,
          type: "fontFamily",
          description: `Primary font family from brand guidelines`,
          tier: "sys",
          confidence: provenance.confidence,
          provenance: { ...provenance, notes: `Line ${i + 1}` }
        });
      }

      // Font Sizes (e.g. h1: 32px, body: 16px)
      const sizeMatch = line.match(/\b(h[1-6]|headline|title|body|label|caption)\b[^:\n]*[:=]\s*(\d+(?:px|rem))\b/i);
      if (sizeMatch) {
        const level = sizeMatch[1].toLowerCase();
        const size = sizeMatch[2];
        tokens.push({
          path: `typography.fontSize.${level}`,
          value: size.endsWith("px") ? parseInt(size, 10) : size,
          type: "dimension",
          description: `Typography scale for ${level}`,
          tier: "sys",
          confidence: provenance.confidence,
          provenance: { ...provenance, notes: `Line ${i + 1}` }
        });
      }
    }
  }

  private extractSpatialTokens(lines: string[], tokens: TokenPatch[], provenance: ProvenanceRecord): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Base Grid / Spacing
      const gridMatch = line.match(/(?:grid|spacing|base unit|spatial quantum)[:=]\s*(\d+)px/i);
      if (gridMatch) {
        tokens.push({
          path: "spacing.grid.base",
          value: parseInt(gridMatch[1], 10),
          type: "dimension",
          description: "Base spacing grid increment",
          tier: "sys",
          confidence: provenance.confidence,
          provenance: { ...provenance, notes: `Line ${i + 1}` }
        });
      }

      // Border Radius
      const radiusMatch = line.match(/(?:border[-\s]?radius|corner[-\s]?radius|rounded)[:=]\s*(\d+)px/i);
      if (radiusMatch) {
        tokens.push({
          path: "shape.corner.base",
          value: parseInt(radiusMatch[1], 10),
          type: "dimension",
          description: "Base corner radius",
          tier: "sys",
          confidence: provenance.confidence,
          provenance: { ...provenance, notes: `Line ${i + 1}` }
        });
      }
    }
  }

  private extractGuidelines(lines: string[], guidelines: GuidelinePatch[], provenance: ProvenanceRecord): void {
    let idCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for DO / DONT or Rule lines
      const doMatch = line.match(/^(?:[-*]\s*)?(?:✅\s*|DO:\s*|Must:\s*)(.+)$/i);
      const dontMatch = line.match(/^(?:[-*]\s*)?(?:❌\s*|DON'?T:\s*|Never:\s*|Avoid:\s*)(.+)$/i);
      const ruleMatch = line.match(/^(?:[-*]\s*)?(?:Rule|Guideline|Standard):\s*(.+)$/i);

      if (doMatch) {
        guidelines.push({
          id: `guideline-do-${idCounter++}`,
          title: "Design Practice: Recommended",
          category: "recommendation",
          description: doMatch[1].trim(),
          rule: doMatch[1].trim(),
          severity: "MEDIUM",
          provenance: { ...provenance, notes: `Line ${i + 1}` }
        });
      } else if (dontMatch) {
        guidelines.push({
          id: `guideline-dont-${idCounter++}`,
          title: "Design Constraint: Prohibited",
          category: "constraint",
          description: dontMatch[1].trim(),
          rule: `Forbidden: ${dontMatch[1].trim()}`,
          severity: "HIGH",
          provenance: { ...provenance, notes: `Line ${i + 1}` }
        });
      } else if (ruleMatch) {
        const desc = ruleMatch[1].trim();
        const severity = desc.toLowerCase().includes("contrast") || desc.toLowerCase().includes("accessibility") || desc.toLowerCase().includes("a11y")
          ? "CRITICAL"
          : "HIGH";

        guidelines.push({
          id: `guideline-rule-${idCounter++}`,
          title: "Design Standard",
          category: "standard",
          description: desc,
          rule: desc,
          severity,
          provenance: { ...provenance, notes: `Line ${i + 1}` }
        });
      }
    }
  }

  private extractComponentSpecs(content: string, components: ComponentPatch[], provenance: ProvenanceRecord): void {
    // Look for sections describing components: ## Button, ## Card, ## Input, etc.
    const sectionRegex = /##\s*([A-Z][a-zA-Z0-9_-]+)\b([\s\S]*?)(?=(?:##\s*[A-Z]|$))/g;
    let match: RegExpExecArray | null;

    while ((match = sectionRegex.exec(content)) !== null) {
      const compName = match[1].trim();
      const compBody = match[2].trim();

      // Check if it looks like a UI component
      const isUIComponent = ["button", "card", "input", "badge", "modal", "dialog", "avatar", "table", "dropdown", "navbar", "toast", "tooltip"].some(c => compName.toLowerCase().includes(c));
      if (!isUIComponent) continue;

      const rules: string[] = [];
      const examples: string[] = [];

      compBody.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          rules.push(trimmed.replace(/^[-*]\s*/, ""));
        } else if (trimmed.startsWith("```")) {
          examples.push(trimmed);
        }
      });

      // Check for touch target or min height
      const heightMatch = compBody.match(/(?:height|touch target|min-height)[:=]\s*(\d+)px/i);
      const radiusMatch = compBody.match(/(?:radius|corner)[:=]\s*(\d+)px/i);

      components.push({
        componentName: compName,
        family: "ui",
        description: `Specification for ${compName} from design documentation`,
        rules,
        props: {
          minHeight: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
          borderRadius: radiusMatch ? parseInt(radiusMatch[1], 10) : undefined,
        },
        provenance: {
          ...provenance,
          notes: `Extracted from ## ${compName} section`
        }
      });
    }
  }
}
