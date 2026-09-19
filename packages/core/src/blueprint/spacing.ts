import { SpacingBlueprint, SpacingStep } from "./types.js";
import { isFluidClamp, parseClamp } from "./typography.js";

/**
 * Validates whether a pixel value conforms to the quantum base grid.
 */
export function validateQuantumSpacing(pxValue: number, quantumBase: number = 4): boolean {
  if (pxValue <= 0) return true;
  // 1px and 2px borders/dividers are permitted exceptions
  if (pxValue === 1 || pxValue === 2) return true;
  return pxValue % quantumBase === 0;
}

/**
 * Serializes a SpacingBlueprint into DTCG-compliant tokens.
 */
export function serializeSpacingToDTCG(blueprint: SpacingBlueprint): Record<string, unknown> {
  const tokens: Record<string, unknown> = {};

  const spacingTokens: Record<string, unknown> = {};
  for (const [key, step] of Object.entries(blueprint.staticRamp)) {
    spacingTokens[`static-${key}`] = {
      $value: step.value,
      $type: "dimension",
      $description: `Static spacing ${key}`,
      "tds:quantum": validateQuantumSpacing(step.pixelEquiv, blueprint.quantumBase)
    };
  }

  if (blueprint.fluidRamp) {
    for (const [key, step] of Object.entries(blueprint.fluidRamp)) {
      spacingTokens[`fluid-${key}`] = {
        $value: step.value,
        $type: "dimension",
        $description: `Fluid responsive spacing ${key}`,
        "tds:fluid": true
      };
    }
  }

  tokens["spacing"] = spacingTokens;
  return tokens;
}
