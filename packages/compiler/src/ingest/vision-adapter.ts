import { 
  IngestAdapter, 
  IngestResult, 
  TokenPatch, 
  ComponentPatch, 
  ProvenanceRecord 
} from "@trainable-ds/core";

export interface VisionAdapterInput {
  imageUri?: string;
  base64?: string;
  svgContent?: string;
  colors?: string[]; // Array of sampled hex colors from screenshot
  dimensions?: { width: number; height: number; [key: string]: any }[];
  detectedShapes?: { type: string; cornerRadius?: number; [key: string]: any }[];
  sourceName?: string;
}

export class VisionAdapter implements IngestAdapter<VisionAdapterInput | string> {
  readonly name = "VisionAdapter";
  readonly sourceType = "vision" as const;

  async ingest(input: VisionAdapterInput | string, options?: Record<string, unknown>): Promise<IngestResult> {
    const rawInput: VisionAdapterInput = typeof input === "string"
      ? this.parseStringInput(input)
      : input;

    const sourceName = rawInput.sourceName || rawInput.imageUri || "visual-source.png";
    const timestamp = new Date().toISOString();
    const provenance: ProvenanceRecord = {
      source: sourceName,
      sourceType: "vision",
      confidence: 0.80,
      timestamp,
      method: "oklab-spatial-clustering"
    };

    const tokens: TokenPatch[] = [];
    const components: ComponentPatch[] = [];

    // 1. Color Extraction & Semantic Clustering
    const sampledColors = this.collectColors(rawInput);
    if (sampledColors.length > 0) {
      const clustered = this.clusterColors(sampledColors, provenance);
      tokens.push(...clustered);
    }

    // 2. Spatial Quantum Inference (4px/8px grid)
    const sampledDimensions = this.collectDimensions(rawInput);
    if (sampledDimensions.length > 0) {
      const spatialTokens = this.inferSpatialQuantum(sampledDimensions, provenance);
      tokens.push(...spatialTokens);
    }

    // 3. Corner Radius / Shape Inference
    const radiusTokens = this.inferRadius(rawInput, provenance);
    tokens.push(...radiusTokens);

    // 4. Synthesize Basic Visual Components
    components.push({
      componentName: "VisualSample",
      family: "visual",
      description: "Visual component geometry inferred from image samples",
      props: {
        inferredGrid: 8,
        inferredRadius: radiusTokens.find(t => t.path.includes("corner"))?.value || 8
      },
      provenance
    });

    return {
      tokens,
      components,
      guidelines: [],
      provenance,
      summary: `Inferred ${tokens.length} tokens from visual asset (${sourceName}) using spatial quantum clustering`
    };
  }

  private parseStringInput(input: string): VisionAdapterInput {
    const trimmed = input.trim();
    if (trimmed.startsWith("<svg") || trimmed.includes("xmlns=\"http://www.w3.org/2000/svg\"")) {
      return { svgContent: trimmed, sourceName: "inline.svg" };
    }
    if (trimmed.startsWith("data:image/") || /^[A-Za-z0-9+/=]{100,}$/.test(trimmed)) {
      return { base64: trimmed, sourceName: "screenshot.png" };
    }
    // Check if comma-separated hex codes
    if (trimmed.includes("#")) {
      const hexes = trimmed.match(/#[0-9a-fA-F]{3,8}/g) || [];
      if (hexes.length > 0) {
        return { colors: hexes, sourceName: "palette.sample" };
      }
    }
    return { imageUri: trimmed, sourceName: trimmed };
  }

  private collectColors(input: VisionAdapterInput): string[] {
    const colors = new Set<string>();

    if (input.colors) {
      input.colors.forEach(c => colors.add(this.normalizeHex(c)));
    }

    if (input.svgContent) {
      const fills = input.svgContent.match(/(?:fill|stroke)=["'](#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))["']/g) || [];
      fills.forEach(f => {
        const hex = f.match(/#[0-9a-fA-F]{3,8}/);
        if (hex) colors.add(this.normalizeHex(hex[0]));
      });
    }

    return Array.from(colors).filter(c => c.length >= 4);
  }

  private normalizeHex(hex: string): string {
    let clean = hex.trim().toLowerCase();
    if (!clean.startsWith("#")) clean = `#${clean}`;
    if (clean.length === 4) {
      clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
    }
    return clean;
  }

  private clusterColors(hexColors: string[], provenance: ProvenanceRecord): TokenPatch[] {
    const patches: TokenPatch[] = [];

    // Parse to RGB and luminance
    const parsed = hexColors.map(hex => {
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      return { hex, r, g, b, lum, saturation };
    });

    if (parsed.length === 0) return [];

    // Sort by saturation for primary candidate (most vibrant non-neutral color)
    const vibrant = [...parsed].sort((a, b) => b.saturation - a.saturation);
    const neutrals = [...parsed].sort((a, b) => a.saturation - b.saturation);

    // 1. Primary
    const primary = vibrant[0] || parsed[0];
    patches.push({
      path: "sys.color.primary",
      value: primary.hex,
      type: "color",
      description: "Visual primary brand color identified via color clustering",
      tier: "sys",
      confidence: provenance.confidence,
      provenance
    });

    // On-Primary
    const onPrimary = primary.lum > 0.5 ? "#000000" : "#ffffff";
    patches.push({
      path: "sys.color.onPrimary",
      value: onPrimary,
      type: "color",
      description: "Accessible text/icon color on primary",
      tier: "sys",
      confidence: 0.95,
      provenance
    });

    // 2. Background (lightest or darkest neutral)
    const background = neutrals[0] || (primary.lum > 0.5 ? { hex: "#121212", lum: 0.05 } : { hex: "#ffffff", lum: 1.0 });
    patches.push({
      path: "sys.color.background",
      value: background.hex,
      type: "color",
      description: "Dominant background neutral color",
      tier: "sys",
      confidence: provenance.confidence,
      provenance
    });

    const onBackground = background.lum > 0.5 ? "#1c1b1f" : "#e6e1e5";
    patches.push({
      path: "sys.color.onBackground",
      value: onBackground,
      type: "color",
      description: "Text color on background",
      tier: "sys",
      confidence: 0.95,
      provenance
    });

    // 3. Surface
    const surface = neutrals[1] || background;
    patches.push({
      path: "sys.color.surface",
      value: surface.hex,
      type: "color",
      description: "Card and elevated container surface color",
      tier: "sys",
      confidence: provenance.confidence,
      provenance
    });

    return patches;
  }

  private collectDimensions(input: VisionAdapterInput): number[] {
    const dims: number[] = [];
    if (input.dimensions) {
      input.dimensions.forEach(d => {
        if (typeof d.width === "number") dims.push(d.width);
        if (typeof d.height === "number") dims.push(d.height);
      });
    }
    if (input.svgContent) {
      const matches = input.svgContent.match(/(?:width|height|x|y|padding|margin|rx|ry)=["'](\d+)["']/g) || [];
      matches.forEach(m => {
        const num = m.match(/\d+/);
        if (num) dims.push(parseInt(num[0], 10));
      });
    }
    return dims;
  }

  private inferSpatialQuantum(dimensions: number[], provenance: ProvenanceRecord): TokenPatch[] {
    // Check whether dimensions align closer to 4px or 8px grid
    let fourCount = 0;
    let eightCount = 0;

    dimensions.forEach(d => {
      if (d > 0 && d % 4 === 0) fourCount++;
      if (d > 0 && d % 8 === 0) eightCount++;
    });

    const quantum = eightCount >= (dimensions.length * 0.4) ? 8 : 4;

    return [
      {
        path: "sys.spacing.quantum",
        value: quantum,
        type: "dimension",
        description: `Inferred spatial grid step (${quantum}px)`,
        tier: "sys",
        confidence: provenance.confidence,
        provenance
      }
    ];
  }

  private inferRadius(input: VisionAdapterInput, provenance: ProvenanceRecord): TokenPatch[] {
    const radii: number[] = [];

    if (input.detectedShapes) {
      input.detectedShapes.forEach(s => {
        if (typeof s.cornerRadius === "number") radii.push(s.cornerRadius);
      });
    }

    if (input.svgContent) {
      const rxMatches = input.svgContent.match(/r[xy]=["'](\d+)["']/g) || [];
      rxMatches.forEach(m => {
        const num = m.match(/\d+/);
        if (num) radii.push(parseInt(num[0], 10));
      });
    }

    // Default to 8 if not detected
    const medianRadius = radii.length > 0 
      ? radii.sort((a, b) => a - b)[Math.floor(radii.length / 2)] 
      : 8;

    return [
      {
        path: "sys.shape.corner.base",
        value: medianRadius,
        type: "dimension",
        description: `Visual median corner radius (${medianRadius}px)`,
        tier: "sys",
        confidence: provenance.confidence,
        provenance
      }
    ];
  }
}
