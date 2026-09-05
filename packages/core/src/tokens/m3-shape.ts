import { z } from "zod";
import { DtcgTokenSchema } from "./dtcg.js";

/**
 * Material Design 3 Shape Scale & Geometry
 * 7-point scale plus asymmetric corner support
 */
export const M3ShapeScaleSchema = z.object({
  cornerNone: DtcgTokenSchema,        // 0px
  cornerExtraSmall: DtcgTokenSchema,  // 4px
  cornerSmall: DtcgTokenSchema,       // 8px
  cornerMedium: DtcgTokenSchema,      // 12px
  cornerLarge: DtcgTokenSchema,       // 16px
  cornerExtraLarge: DtcgTokenSchema,  // 28px
  cornerFull: DtcgTokenSchema,        // 9999px (Pill)
});

export type M3ShapeScale = z.infer<typeof M3ShapeScaleSchema>;

export const M3AsymmetricCornerSchema = z.object({
  topLeft: z.string(),
  topRight: z.string(),
  bottomLeft: z.string(),
  bottomRight: z.string(),
});

export type M3AsymmetricCorner = z.infer<typeof M3AsymmetricCornerSchema>;

export const M3_SHAPE_DEFAULTS = {
  cornerNone: "0px",
  cornerExtraSmall: "4px",
  cornerSmall: "8px",
  cornerMedium: "12px",
  cornerLarge: "16px",
  cornerExtraLarge: "28px",
  cornerFull: "9999px",
} as const;
