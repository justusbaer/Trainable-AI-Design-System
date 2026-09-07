import { 
  DesignSystemSnapshot, 
  SemanticMergeResult, 
  TokenConflict, 
  ComponentConflict 
} from "@trainable-ds/core";

export interface MergeOptions {
  preferOurLocks?: boolean; // If our token is locked, automatically accept our value
  autoResolveNonConflictingProps?: boolean;
}

export class SemanticMerger {
  /**
   * Executes an AST-aware 3-way semantic merge on tokens and components.
   */
  merge(
    base: DesignSystemSnapshot,
    ours: DesignSystemSnapshot,
    theirs: DesignSystemSnapshot,
    options: MergeOptions = { preferOurLocks: true, autoResolveNonConflictingProps: true }
  ): SemanticMergeResult {
    const tokenConflicts: TokenConflict[] = [];
    const componentConflicts: ComponentConflict[] = [];

    // Clone snapshots
    const mergedTokens: Record<string, any> = JSON.parse(JSON.stringify(ours.tokens || {}));
    const mergedComponents: Record<string, any> = JSON.parse(JSON.stringify(ours.components || {}));

    const ourFlatTokens = this.flattenTokens(ours.tokens || {});
    const theirFlatTokens = this.flattenTokens(theirs.tokens || {});
    const baseFlatTokens = this.flattenTokens(base.tokens || {});

    const ourLocks = (ours.tokens?._meta?.locks || {}) as Record<string, boolean>;

    // 1. Token 3-way merge
    const allPaths = new Set([
      ...Object.keys(baseFlatTokens),
      ...Object.keys(ourFlatTokens),
      ...Object.keys(theirFlatTokens)
    ]);

    for (const path of allPaths) {
      if (path.startsWith("_meta")) continue;

      const baseVal = baseFlatTokens[path];
      const ourVal = ourFlatTokens[path];
      const theirVal = theirFlatTokens[path];

      const baseJson = JSON.stringify(baseVal);
      const ourJson = JSON.stringify(ourVal);
      const theirJson = JSON.stringify(theirVal);

      // Case A: Both sides have same value
      if (ourJson === theirJson) {
        // Nothing to do, our value is already set
        continue;
      }

      // Case B: Only 'theirs' made a change
      if (ourJson === baseJson && theirJson !== baseJson) {
        if (theirVal === undefined) {
          this.deleteNestedToken(mergedTokens, path);
        } else {
          this.setNestedToken(mergedTokens, path, theirVal);
        }
        continue;
      }

      // Case C: Only 'ours' made a change
      if (theirJson === baseJson && ourJson !== baseJson) {
        // Keep our value
        continue;
      }

      // Case D: Both sides changed to different values!
      // Check if our token is locked and lock preference is enabled
      if (options.preferOurLocks && ourLocks[path] === true) {
        // Keep our locked value, no conflict
        continue;
      }

      // True conflict
      tokenConflicts.push({
        path,
        baseValue: baseVal,
        ourValue: ourVal,
        theirValue: theirVal,
        status: "conflict"
      });
    }

    // 2. Component 3-way merge
    const allCompNames = new Set([
      ...Object.keys(base.components || {}),
      ...Object.keys(ours.components || {}),
      ...Object.keys(theirs.components || {})
    ]);

    for (const compName of allCompNames) {
      const baseComp = base.components?.[compName];
      const ourComp = ours.components?.[compName];
      const theirComp = theirs.components?.[compName];

      if (!ourComp && theirComp) {
        // Added in theirs
        mergedComponents[compName] = JSON.parse(JSON.stringify(theirComp));
        continue;
      }

      if (ourComp && !theirComp && !baseComp) {
        // Added in ours, keep it
        continue;
      }

      if (ourComp && !theirComp && baseComp) {
        // Deleted in theirs
        if (JSON.stringify(ourComp) === JSON.stringify(baseComp)) {
          delete mergedComponents[compName];
        } else {
          componentConflicts.push({
            componentName: compName,
            field: "lifecycle",
            baseValue: "present",
            ourValue: "modified",
            theirValue: "deleted",
            status: "conflict"
          });
        }
        continue;
      }

      if (ourComp && theirComp) {
        // Both exist, merge props and rules
        const mergedComp = JSON.parse(JSON.stringify(ourComp));

        // Merge props
        const ourProps = ourComp.props || {};
        const theirProps = theirComp.props || {};
        const baseProps = baseComp?.props || {};

        const allPropKeys = new Set([
          ...Object.keys(baseProps),
          ...Object.keys(ourProps),
          ...Object.keys(theirProps)
        ]);

        const resolvedProps: Record<string, any> = { ...ourProps };

        for (const prop of allPropKeys) {
          const bProp = JSON.stringify(baseProps[prop]);
          const oProp = JSON.stringify(ourProps[prop]);
          const tProp = JSON.stringify(theirProps[prop]);

          if (oProp === tProp) continue;

          if (oProp === bProp && tProp !== bProp) {
            // Theirs changed prop cleanly
            resolvedProps[prop] = theirProps[prop];
          } else if (tProp === bProp && oProp !== bProp) {
            // Ours changed prop cleanly
            resolvedProps[prop] = ourProps[prop];
          } else if (oProp !== tProp) {
            // Prop conflict!
            componentConflicts.push({
              componentName: compName,
              field: `props.${prop}`,
              baseValue: baseProps[prop],
              ourValue: ourProps[prop],
              theirValue: theirProps[prop],
              status: "conflict"
            });
          }
        }
        mergedComp.props = resolvedProps;

        // Union rules
        const rules = Array.from(new Set([...(ourComp.rules || []), ...(theirComp.rules || [])]));
        mergedComp.rules = rules;

        // Authoritative source
        if (!mergedComp.authoritativeSource && theirComp.authoritativeSource) {
          mergedComp.authoritativeSource = theirComp.authoritativeSource;
        }

        mergedComponents[compName] = mergedComp;
      }
    }

    // 3. Guidelines
    const ourGuidelines = ours.guidelines || "";
    const theirGuidelines = theirs.guidelines || "";
    let mergedGuidelines = ourGuidelines;
    if (theirGuidelines && theirGuidelines !== ourGuidelines && !ourGuidelines.includes(theirGuidelines)) {
      mergedGuidelines = `${ourGuidelines}\n\n${theirGuidelines}`.trim();
    }

    const mergedSnapshot: DesignSystemSnapshot = {
      tokens: mergedTokens,
      components: mergedComponents,
      guidelines: mergedGuidelines,
      fonts: { ...(theirs.fonts || {}), ...(ours.fonts || {}) },
      icons: Array.from(new Set([...(ours.icons || []), ...(theirs.icons || [])]))
    };

    const hasConflicts = tokenConflicts.length > 0 || componentConflicts.length > 0;
    const summary = hasConflicts
      ? `Semantic merge encountered ${tokenConflicts.length} token conflict(s) and ${componentConflicts.length} component conflict(s).`
      : `Semantic merge succeeded automatically: clean merge without conflicts.`;

    return {
      success: !hasConflicts,
      mergedSnapshot,
      tokenConflicts,
      componentConflicts,
      summary
    };
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

  private setNestedToken(target: Record<string, any>, path: string, value: unknown): void {
    const parts = path.split(".");
    let curr = target;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!curr[part] || typeof curr[part] !== "object") {
        curr[part] = {};
      }
      curr = curr[part];
    }

    const last = parts[parts.length - 1];
    if (curr[last] && typeof curr[last] === "object" && ("value" in curr[last] || "$value" in curr[last])) {
      if ("value" in curr[last]) curr[last].value = value;
      if ("$value" in curr[last]) curr[last].$value = value;
    } else {
      curr[last] = { value };
    }
  }

  private deleteNestedToken(target: Record<string, any>, path: string): void {
    const parts = path.split(".");
    let curr = target;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!curr[part]) return;
      curr = curr[part];
    }
    delete curr[parts[parts.length - 1]];
  }
}
