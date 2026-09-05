import { z } from "zod";
import { DtcgTokenSchema } from "./dtcg.js";

/**
 * Material Design 3 Elevation & Surface Tint System
 * Levels 0 to 5 combining shadows and primary color surface tint percentages
 */
export const M3ElevationLevelSchema = z.object({
  shadow: DtcgTokenSchema,
  surfaceTintPercentage: DtcgTokenSchema, // e.g. 0.05 for 5%
  elevationDp: DtcgTokenSchema,           // 0dp, 1dp, 3dp, 6dp, 8dp, 12dp
});

export type M3ElevationLevel = z.infer<typeof M3ElevationLevelSchema>;

export const M3ElevationSystemSchema = z.object({
  level0: M3ElevationLevelSchema,
  level1: M3ElevationLevelSchema,
  level2: M3ElevationLevelSchema,
  level3: M3ElevationLevelSchema,
  level4: M3ElevationLevelSchema,
  level5: M3ElevationLevelSchema,
});

export type M3ElevationSystem = z.infer<typeof M3ElevationSystemSchema>;

export const M3_ELEVATION_DEFAULTS = {
  level0: { dp: "0dp", tint: 0.00, shadow: "none" },
  level1: { dp: "1dp", tint: 0.05, shadow: "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)" },
  level2: { dp: "3dp", tint: 0.08, shadow: "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)" },
  level3: { dp: "6dp", tint: 0.11, shadow: "0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)" },
  level4: { dp: "8dp", tint: 0.12, shadow: "0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)" },
  level5: { dp: "12dp", tint: 0.14, shadow: "0px 4px 4px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)" },
} as const;
