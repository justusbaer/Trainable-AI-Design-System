import { 
  DesignSystemSnapshot, 
  IngestResult, 
  TokenPatch, 
  ComponentPatch, 
  GuidelinePatch 
} from "@trainable-ds/core";

export interface FusionOptions {
  force?: boolean; // Overwrite locked items if true
  defaultConfidence?: number;
}

export interface FusionResult {
  snapshot: DesignSystemSnapshot;
  appliedTokensCount: number;
  skippedLockedTokensCount: number;
  appliedComponentsCount: number;
  skippedLockedComponentsCount: number;
  appliedGuidelinesCount: number;
  summary: string;
}

export class FusionEngine {
  private static readonly SOURCE_PRIORITIES: Record<string, number> = {
    conversation: 50,
    table: 40,
    web: 30,
    document: 20,
    vision: 10
  };

  /**
   * Reconciles multiple ingestion results into a DesignSystemSnapshot with precedence and lock protection.
   */
  fuse(
    existing: DesignSystemSnapshot,
    results: IngestResult[],
    options: FusionOptions = {}
  ): FusionResult {
    // Clone snapshot
    const snapshot: DesignSystemSnapshot = {
      tokens: JSON.parse(JSON.stringify(existing.tokens || {})),
      components: JSON.parse(JSON.stringify(existing.components || {})),
      guidelines: existing.guidelines || "",
      fonts: JSON.parse(JSON.stringify(existing.fonts || {})),
      icons: JSON.parse(JSON.stringify(existing.icons || []))
    };

    if (!snapshot.tokens._meta) {
      snapshot.tokens._meta = { locks: {}, provenance: {} };
    }
    const locks = snapshot.tokens._meta.locks as Record<string, boolean>;
    const tokenProvenance = snapshot.tokens._meta.provenance as Record<string, any>;

    let appliedTokens = 0;
    let skippedTokens = 0;
    let appliedComponents = 0;
    let skippedComponents = 0;
    let appliedGuidelines = 0;

    // Sort results by source priority
    const sortedResults = [...results].sort((a, b) => {
      const pA = FusionEngine.SOURCE_PRIORITIES[a.provenance.sourceType] || 0;
      const pB = FusionEngine.SOURCE_PRIORITIES[b.provenance.sourceType] || 0;
      return pA - pB; // lower first, so higher priority overwrites later
    });

    for (const result of sortedResults) {
      // 1. Process Tokens
      for (const patch of result.tokens) {
        const isLocked = locks[patch.path] === true;

        if (patch.locked !== undefined) {
          locks[patch.path] = patch.locked;
        }

        if (isLocked && !options.force && !patch.locked) {
          skippedTokens++;
          continue;
        }

        this.setNestedToken(snapshot.tokens, patch.path, patch.value, patch.type, patch.description);
        tokenProvenance[patch.path] = {
          source: result.provenance.source,
          sourceType: result.provenance.sourceType,
          confidence: patch.confidence ?? result.provenance.confidence,
          timestamp: result.provenance.timestamp
        };
        appliedTokens++;
      }

      // 2. Process Components
      for (const compPatch of result.components) {
        const existingComp = snapshot.components[compPatch.componentName];
        if (existingComp?.locked && !options.force && !compPatch.locked) {
          skippedComponents++;
          continue;
        }

        const mergedComp = {
          ...(existingComp || {}),
          name: compPatch.componentName,
          family: compPatch.family || existingComp?.family || "ui",
          description: compPatch.description || existingComp?.description,
          rules: Array.from(new Set([...(existingComp?.rules || []), ...(compPatch.rules || [])])),
          props: { ...(existingComp?.props || {}), ...(compPatch.props || {}) },
          code: compPatch.code || existingComp?.code,
          authoritativeSource: compPatch.authoritativeSource || existingComp?.authoritativeSource,
          locked: compPatch.locked !== undefined ? compPatch.locked : existingComp?.locked,
          provenance: compPatch.provenance || result.provenance
        };

        snapshot.components[compPatch.componentName] = mergedComp;
        appliedComponents++;
      }

      // 3. Process Guidelines
      if (result.guidelines && result.guidelines.length > 0) {
        const newGuidelinesText = result.guidelines
          .map(g => `- [${g.severity}] ${g.title}: ${g.rule}`)
          .join("\n");
        
        if (!snapshot.guidelines) {
          snapshot.guidelines = newGuidelinesText;
        } else {
          snapshot.guidelines += `\n\n### Added from ${result.provenance.source} (${result.provenance.sourceType})\n${newGuidelinesText}`;
        }
        appliedGuidelines += result.guidelines.length;
      }
    }

    return {
      snapshot,
      appliedTokensCount: appliedTokens,
      skippedLockedTokensCount: skippedTokens,
      appliedComponentsCount: appliedComponents,
      skippedLockedComponentsCount: skippedComponents,
      appliedGuidelinesCount: appliedGuidelines,
      summary: `Fused ${sortedResults.length} ingestion sources: applied ${appliedTokens} tokens (${skippedTokens} skipped locked), ${appliedComponents} components, ${appliedGuidelines} guidelines.`
    };
  }

  private setNestedToken(target: Record<string, any>, path: string, value: unknown, type?: string, description?: string): void {
    const parts = path.split(".");
    let curr = target;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!curr[part] || typeof curr[part] !== "object") {
        curr[part] = {};
      }
      curr = curr[part];
    }

    const lastKey = parts[parts.length - 1];
    
    // If target is already a DTCG node with value/$value, update its value
    if (curr[lastKey] && typeof curr[lastKey] === "object" && ("value" in curr[lastKey] || "$value" in curr[lastKey])) {
      if ("value" in curr[lastKey]) curr[lastKey].value = value;
      if ("$value" in curr[lastKey]) curr[lastKey].$value = value;
      if (type) curr[lastKey].type = type;
      if (description) curr[lastKey].description = description;
    } else {
      curr[lastKey] = {
        value,
        type: type || (typeof value === "number" ? "number" : "string"),
        description
      };
    }
  }
}
