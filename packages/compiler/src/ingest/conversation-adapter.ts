import { 
  IngestAdapter, 
  IngestResult, 
  TokenPatch, 
  ComponentPatch, 
  GuidelinePatch, 
  ProvenanceRecord, 
  DesignSystemSnapshot 
} from "@trainable-ds/core";

export interface ConversationAdapterInput {
  prompt: string;
  context?: Partial<DesignSystemSnapshot>;
  author?: string;
}

export class ConversationAdapter implements IngestAdapter<ConversationAdapterInput | string> {
  readonly name = "ConversationAdapter";
  readonly sourceType = "conversation" as const;

  async ingest(input: ConversationAdapterInput | string, options?: Record<string, unknown>): Promise<IngestResult> {
    const rawInput: ConversationAdapterInput = typeof input === "string" 
      ? { prompt: input } 
      : input;

    const timestamp = new Date().toISOString();
    const provenance: ProvenanceRecord = {
      source: "conversation-refinement",
      sourceType: "conversation",
      confidence: 0.95,
      timestamp,
      method: "nl-instruction-compiler",
      notes: rawInput.prompt
    };

    const tokens: TokenPatch[] = [];
    const components: ComponentPatch[] = [];
    const guidelines: GuidelinePatch[] = [];

    const prompt = rawInput.prompt.trim();

    // 1. Parse Color Intent
    this.parseColorInstructions(prompt, tokens, provenance);

    // 2. Parse Font / Typography Intent
    this.parseTypographyInstructions(prompt, tokens, provenance);

    // 3. Parse Spatial & Radius Intent
    this.parseSpatialInstructions(prompt, tokens, provenance);

    // 4. Parse Component Intent
    this.parseComponentInstructions(prompt, components, tokens, provenance);

    // 5. Parse Lock Intent
    this.parseLockInstructions(prompt, tokens, components, provenance);

    // 6. Parse Guideline / Rule Intent
    this.parseGuidelineInstructions(prompt, guidelines, provenance);

    return {
      tokens,
      components,
      guidelines,
      provenance,
      summary: `Compiled ${tokens.length} token modifications and ${components.length} component refinements from conversation instruction: "${prompt}"`
    };
  }

  private parseColorInstructions(prompt: string, tokens: TokenPatch[], provenance: ProvenanceRecord): void {
    const roles: { [key: string]: string } = {
      "primary": "sys.color.primary",
      "secondary": "sys.color.secondary",
      "tertiary": "sys.color.tertiary",
      "accent": "sys.color.accent",
      "background": "sys.color.background",
      "surface": "sys.color.surface",
      "neutral": "sys.color.neutral",
      "error": "sys.color.error",
      "danger": "sys.color.error",
      "success": "sys.color.success",
      "warning": "sys.color.warning"
    };

    // Strategy 1: Match role + hex pairs directly: e.g. "primary color to #008080", "secondary to #20b2aa"
    const pairRegex = /\b(primary|secondary|tertiary|accent|background|surface|neutral|error|danger|success|warning)[\w\s.-]*?(?:to|as|=|is)?\s*(#[0-9a-fA-F]{3,8})\b/gi;
    let match: RegExpExecArray | null;
    const handledRoles = new Set<string>();

    while ((match = pairRegex.exec(prompt)) !== null) {
      const role = match[1].toLowerCase();
      const hex = match[2];
      const tokenPath = roles[role];
      if (tokenPath) {
        handledRoles.add(role);
        tokens.push({
          path: tokenPath,
          value: hex,
          type: "color",
          description: `Refined via prompt: "${prompt}"`,
          tier: "sys",
          confidence: provenance.confidence,
          provenance
        });

        if (role === "primary") {
          const lum = this.calculateLuminance(hex);
          tokens.push({
            path: "sys.color.onPrimary",
            value: lum > 0.5 ? "#000000" : "#ffffff",
            type: "color",
            description: `Accessible onPrimary pairing for ${hex}`,
            tier: "sys",
            confidence: 0.95,
            provenance
          });
        }
      }
    }

    // Strategy 2: Fallback for single role + single hex when syntax is loose
    if (handledRoles.size === 0) {
      const hexMatch = prompt.match(/#(?:[0-9a-fA-F]{3,8})\b/);
      const hex = hexMatch ? hexMatch[0] : null;
      if (hex) {
        for (const [role, tokenPath] of Object.entries(roles)) {
          const roleRegex = new RegExp(`\\b${role}\\b`, "i");
          if (roleRegex.test(prompt)) {
            tokens.push({
              path: tokenPath,
              value: hex,
              type: "color",
              description: `Refined via prompt: "${prompt}"`,
              tier: "sys",
              confidence: provenance.confidence,
              provenance
            });

            if (role === "primary") {
              const lum = this.calculateLuminance(hex);
              tokens.push({
                path: "sys.color.onPrimary",
                value: lum > 0.5 ? "#000000" : "#ffffff",
                type: "color",
                description: `Accessible onPrimary pairing for ${hex}`,
                tier: "sys",
                confidence: 0.95,
                provenance
              });
            }
            break;
          }
        }
      }
    }
  }

  private calculateLuminance(hex: string): number {
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map(c => c + c).join("");
    }
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private parseTypographyInstructions(prompt: string, tokens: TokenPatch[], provenance: ProvenanceRecord): void {
    const fontMatch = prompt.match(/(?:font|typeface|family)\s*(?:to|as)?\s*["']?([A-Za-z\s]+?)(?:["']|\s*font|\s*for|\s*and|$)/i);
    if (fontMatch) {
      const candidate = fontMatch[1].trim();
      const recognized = ["inter", "roboto", "helvetica", "arial", "plus jakarta sans", "geist", "sf pro", "poppins", "montserrat", "system-ui"];
      if (recognized.some(f => candidate.toLowerCase().includes(f)) || candidate.length > 2) {
        tokens.push({
          path: "typography.fontFamily.base",
          value: candidate,
          type: "fontFamily",
          description: `Font family refined via conversation: ${candidate}`,
          tier: "sys",
          confidence: provenance.confidence,
          provenance
        });
      }
    }

    const sizeMatch = prompt.match(/(?:font\s*size|size\s*of\s*body|heading\s*size)[:\s]+(\d+)px/i);
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1], 10);
      const isHeading = /heading|headline|title/i.test(prompt);
      const path = isHeading ? "typography.fontSize.heading" : "typography.fontSize.body";
      tokens.push({
        path,
        value: size,
        type: "dimension",
        description: `Font size refined via conversation`,
        tier: "sys",
        confidence: provenance.confidence,
        provenance
      });
    }
  }

  private parseSpatialInstructions(prompt: string, tokens: TokenPatch[], provenance: ProvenanceRecord): void {
    // Corner radius
    const radiusMatch = prompt.match(/(?:corner\s*radius|border\s*radius|rounded\s*(?:corners)?)\s*(?:to|=)?\s*(\d+)px/i);
    if (radiusMatch) {
      const radius = parseInt(radiusMatch[1], 10);
      tokens.push({
        path: "shape.corner.base",
        value: radius,
        type: "dimension",
        description: `Corner radius adjusted to ${radius}px`,
        tier: "sys",
        confidence: provenance.confidence,
        provenance
      });
    }

    // Grid spacing
    const gridMatch = prompt.match(/(?:spacing|grid|padding)\s*(?:to|=)?\s*(\d+)px/i);
    if (gridMatch) {
      const grid = parseInt(gridMatch[1], 10);
      tokens.push({
        path: "spacing.grid.base",
        value: grid,
        type: "dimension",
        description: `Spacing grid set to ${grid}px`,
        tier: "sys",
        confidence: provenance.confidence,
        provenance
      });
    }
  }

  private parseComponentInstructions(prompt: string, components: ComponentPatch[], tokens: TokenPatch[], provenance: ProvenanceRecord): void {
    const knownComponents = ["Button", "Card", "Input", "Badge", "Modal", "Navbar", "Header", "Footer"];
    
    for (const comp of knownComponents) {
      const compRegex = new RegExp(`\\b${comp}s?\\b`, "i");
      if (compRegex.test(prompt)) {
        const props: Record<string, any> = {};

        // Touch target / min height
        const heightMatch = prompt.match(/(?:height|touch target|min-height)\s*(?:to|at least|=)?\s*(\d+)px/i);
        if (heightMatch) {
          props.minHeight = parseInt(heightMatch[1], 10);
        }

        // Component specific radius
        const compRadiusMatch = prompt.match(/(?:radius|corner)\s*(?:to|=)?\s*(\d+)px/i);
        if (compRadiusMatch) {
          props.borderRadius = parseInt(compRadiusMatch[1], 10);
          tokens.push({
            path: `comp.${comp.toLowerCase()}.corner.radius`,
            value: parseInt(compRadiusMatch[1], 10),
            type: "dimension",
            description: `${comp} specific corner radius`,
            tier: "comp",
            confidence: provenance.confidence,
            provenance
          });
        }

        // Authoritative library link
        const libMatch = prompt.match(/(?:use|bind|link)\s*(?:authoritative|package)?\s*["']?(@?[a-zA-Z0-9_\-\/]+)["']?\s*(?:library|component)/i);
        const authSource = libMatch ? {
          type: "authoritative-library" as const,
          package: libMatch[1],
          component: comp,
          exportName: comp
        } : undefined;

        components.push({
          componentName: comp,
          family: "ui",
          description: `User refinement for ${comp}: "${prompt}"`,
          props,
          rules: [`Adhere to refined specs from prompt: ${prompt}`],
          authoritativeSource: authSource,
          provenance
        });
      }
    }
  }

  private parseLockInstructions(prompt: string, tokens: TokenPatch[], components: ComponentPatch[], provenance: ProvenanceRecord): void {
    if (/lock\b/i.test(prompt)) {
      if (/token|color|primary/i.test(prompt)) {
        tokens.push({
          path: "sys.color.primary",
          value: true,
          type: "boolean",
          locked: true,
          description: "Locked by user conversation",
          confidence: 1.0,
          provenance
        });
      }
      if (/button|component/i.test(prompt)) {
        components.push({
          componentName: "Button",
          locked: true,
          description: "Component locked against automatic overwrites",
          provenance
        });
      }
    }
  }

  private parseGuidelineInstructions(prompt: string, guidelines: GuidelinePatch[], provenance: ProvenanceRecord): void {
    const ruleMatch = prompt.match(/(?:rule|do not|never|always|guideline):\s*(.+)/i);
    if (ruleMatch) {
      const ruleText = ruleMatch[1].trim();
      guidelines.push({
        id: `guideline-conv-${Date.now()}`,
        title: "Conversational Rule",
        category: "rule",
        description: ruleText,
        rule: ruleText,
        severity: /never|contrast|a11y|touch/i.test(ruleText) ? "CRITICAL" : "MEDIUM",
        provenance
      });
    }
  }
}
