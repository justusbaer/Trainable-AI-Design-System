import { hexToRgb } from "@trainable-ds/core";

export interface FigmaRgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVariablePayload {
  variableCollections: Array<{
    action: "CREATE" | "UPDATE";
    id: string;
    name: string;
    initialModeId?: string;
  }>;
  variableModes: Array<{
    action: "CREATE" | "UPDATE";
    id: string;
    name: string;
    variableCollectionId: string;
  }>;
  variables: Array<{
    action: "CREATE" | "UPDATE";
    id: string;
    name: string;
    variableCollectionId: string;
    resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
    description?: string;
  }>;
  variableModeValues: Array<{
    variableId: string;
    modeId: string;
    value: FigmaRgba | number | string | boolean;
  }>;
}

export function hexToFigmaRgb(hex: string): FigmaRgba {
  const { r, g, b } = hexToRgb(hex);
  return {
    r: Number((r / 255).toFixed(3)),
    g: Number((g / 255).toFixed(3)),
    b: Number((b / 255).toFixed(3)),
    a: 1.0,
  };
}

export function formatDtcgForFigma(tokens: Record<string, unknown>): FigmaVariablePayload {
  const payload: FigmaVariablePayload = {
    variableCollections: [
      { action: "CREATE", id: "coll_sys", name: "System", initialModeId: "mode_light" },
    ],
    variableModes: [
      { action: "CREATE", id: "mode_dark", name: "Dark", variableCollectionId: "coll_sys" },
    ],
    variables: [],
    variableModeValues: [],
  };

  const sys = (tokens.sys as Record<string, unknown>) || {};
  const color = (sys.color as Record<string, unknown>) || {};

  const lightColors = (color.light as Record<string, { $value: string; $description?: string }>) || {};
  const darkColors = (color.dark as Record<string, { $value: string }>) || {};

  for (const [role, tokenDef] of Object.entries(lightColors)) {
    if (!tokenDef || !tokenDef.$value) continue;

    const varId = `var_${role}`;
    payload.variables.push({
      action: "CREATE",
      id: varId,
      name: `color/${role}`,
      variableCollectionId: "coll_sys",
      resolvedType: "COLOR",
      description: tokenDef.$description || `M3 semantic role: ${role}`,
    });

    // Light mode value
    payload.variableModeValues.push({
      variableId: varId,
      modeId: "mode_light",
      value: hexToFigmaRgb(tokenDef.$value),
    });

    // Dark mode value (if available)
    if (darkColors[role] && darkColors[role].$value) {
      payload.variableModeValues.push({
        variableId: varId,
        modeId: "mode_dark",
        value: hexToFigmaRgb(darkColors[role].$value),
      });
    }
  }

  return payload;
}
