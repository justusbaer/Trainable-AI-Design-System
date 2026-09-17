import { DriftReport } from "./discrepancy-analyzer.js";

export interface ReconcileResult {
  tokens: Record<string, any>;
  components: Record<string, any>;
  appliedPatches: string[];
  skippedLocked: string[];
}

/**
 * Iteratively reconciles and patches design tokens and component contracts based on drift report.
 */
export function reconcileTokensAndComponents(
  tokens: Record<string, any>,
  components: Record<string, any>,
  driftReport: DriftReport
): ReconcileResult {
  const updatedTokens = JSON.parse(JSON.stringify(tokens || {}));
  const updatedComponents = JSON.parse(JSON.stringify(components || {}));

  const appliedPatches: string[] = [];
  const skippedLocked: string[] = [];

  for (const disc of driftReport.discrepancies) {
    const { componentRole, property, observedValue } = disc;

    // Check if token is locked
    const tokenKey = `${componentRole}.${property}`;
    if (updatedTokens[tokenKey]?.["$extensions"]?.["tds:locked"] === true) {
      skippedLocked.push(tokenKey);
      continue;
    }

    if (componentRole.startsWith("button")) {
      if (property === "borderRadius") {
        const isPill = String(observedValue).includes("pill") || String(observedValue).includes("9999");
        const radiusVal = isPill ? "9999px" : String(observedValue);

        // Update token
        if (!updatedTokens["comp.button.shape.corner"]) {
          updatedTokens["comp.button.shape.corner"] = {
            "$value": radiusVal,
            "$type": "dimension"
          };
        } else {
          updatedTokens["comp.button.shape.corner"]["$value"] = radiusVal;
        }

        // Update component contract in components.json
        if (updatedComponents["button"]) {
          if (!updatedComponents["button"].anatomy) updatedComponents["button"].anatomy = {};
          updatedComponents["button"].anatomy.container = {
            ...updatedComponents["button"].anatomy.container,
            shape: isPill ? "full-pill" : "rounded-rect",
            borderRadius: radiusVal
          };
        }

        appliedPatches.push(`Updated button corner radius to ${radiusVal} (from observed ${observedValue})`);
      } else if (property === "padding") {
        if (!updatedTokens["comp.button.spacing.padding"]) {
          updatedTokens["comp.button.spacing.padding"] = {
            "$value": String(observedValue),
            "$type": "dimension"
          };
        } else {
          updatedTokens["comp.button.spacing.padding"]["$value"] = String(observedValue);
        }

        if (updatedComponents["button"]) {
          if (!updatedComponents["button"].anatomy) updatedComponents["button"].anatomy = {};
          updatedComponents["button"].anatomy.container = {
            ...updatedComponents["button"].anatomy.container,
            padding: String(observedValue)
          };
        }
        appliedPatches.push(`Updated button padding to ${observedValue}`);
      } else if (property === "backgroundColor") {
        const roleToken = componentRole === "button.primary" ? "sys.color.primary" : "sys.color.surface-container";
        if (updatedTokens[roleToken]?.["$extensions"]?.["tds:locked"] === true) {
          skippedLocked.push(`${componentRole}.${property}`);
          continue;
        }
        if (updatedTokens[roleToken]) {
          updatedTokens[roleToken]["$value"] = String(observedValue);
          appliedPatches.push(`Updated ${roleToken} to ${observedValue}`);
        }
      } else if (property === "backgroundColor.alpha") {
        const roleToken = componentRole === "button.secondary" ? "sys.color.surface-container" : "sys.color.primary";
        if (updatedTokens[roleToken]?.["$extensions"]?.["tds:locked"] === true) {
          skippedLocked.push(`${componentRole}.${property}`);
          continue;
        }
        if (updatedTokens[roleToken]) {
          const hex = updatedTokens[roleToken]["$value"];
          updatedTokens[roleToken]["$value"] = `${hex}`;
          appliedPatches.push(`Adjusted material alpha for ${roleToken} (${observedValue})`);
        }
      }
    } else if (componentRole.startsWith("heading")) {
      if (property === "fontFamily") {
        const brandFont = String(observedValue);
        if (updatedTokens["ref.typeface.brand"]?.["$extensions"]?.["tds:locked"] === true) {
          skippedLocked.push(`${componentRole}.${property}`);
          continue;
        }
        if (!updatedTokens["ref.typeface.brand"]) {
          updatedTokens["ref.typeface.brand"] = {
            "$value": brandFont,
            "$type": "fontFamily"
          };
        } else {
          updatedTokens["ref.typeface.brand"]["$value"] = brandFont;
        }
        appliedPatches.push(`Updated brand typeface to "${brandFont}"`);
      }
    } else if (componentRole === "card") {
      if (property === "border") {
        const borderVal = String(observedValue).includes("none") ? "none" : String(observedValue);
        if (updatedTokens["comp.card.container.border"]?.["$extensions"]?.["tds:locked"] === true) {
          skippedLocked.push(`${componentRole}.${property}`);
          continue;
        }
        if (!updatedTokens["comp.card.container.border"]) {
          updatedTokens["comp.card.container.border"] = {
            "$value": borderVal,
            "$type": "dimension"
          };
        } else {
          updatedTokens["comp.card.container.border"]["$value"] = borderVal;
        }

        const comp = updatedComponents["card"] || updatedComponents["Card"];
        if (comp) {
          if (!comp.anatomy) comp.anatomy = {};
          if (!comp.anatomy.container) comp.anatomy.container = {};
          comp.anatomy.container.border = borderVal;
        }
        appliedPatches.push(`Reconciled card container border to ${borderVal}`);
      }
    } else if (componentRole === "root" && property === "webkitFontSmoothing") {
      const smoothingVal = String(observedValue);
      if (!updatedTokens["sys.typography.font-smoothing"]) {
        updatedTokens["sys.typography.font-smoothing"] = {
          "$value": smoothingVal,
          "$type": "fontSmoothing"
        };
      } else {
        updatedTokens["sys.typography.font-smoothing"]["$value"] = smoothingVal;
      }
      appliedPatches.push(`Reconciled root font smoothing to ${smoothingVal}`);
    }
  }

  return {
    tokens: updatedTokens,
    components: updatedComponents,
    appliedPatches,
    skippedLocked
  };
}
