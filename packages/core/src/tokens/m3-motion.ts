import { z } from "zod";
import { DtcgTokenSchema } from "./dtcg.js";

/**
 * Material Design 3 Motion & Choreography
 * 6 Easing Curves and 16 Duration Tokens
 */
export const M3EasingCurvesSchema = z.object({
  emphasized: DtcgTokenSchema,           // cubic-bezier(0.2, 0.0, 0.0, 1.0)
  emphasizedDecelerate: DtcgTokenSchema, // cubic-bezier(0.05, 0.7, 0.1, 1.0)
  emphasizedAccelerate: DtcgTokenSchema, // cubic-bezier(0.3, 0.0, 0.8, 0.15)
  standard: DtcgTokenSchema,             // cubic-bezier(0.2, 0.0, 0.0, 1.0)
  standardDecelerate: DtcgTokenSchema,   // cubic-bezier(0.0, 0.0, 0.0, 1.0)
  standardAccelerate: DtcgTokenSchema,   // cubic-bezier(0.3, 0.0, 1.0, 1.0)
});

export type M3EasingCurves = z.infer<typeof M3EasingCurvesSchema>;

export const M3DurationsSchema = z.object({
  short1: DtcgTokenSchema, // 50ms
  short2: DtcgTokenSchema, // 100ms
  short3: DtcgTokenSchema, // 150ms
  short4: DtcgTokenSchema, // 200ms
  medium1: DtcgTokenSchema, // 250ms
  medium2: DtcgTokenSchema, // 300ms
  medium3: DtcgTokenSchema, // 350ms
  medium4: DtcgTokenSchema, // 400ms
  long1: DtcgTokenSchema,   // 450ms
  long2: DtcgTokenSchema,   // 500ms
  long3: DtcgTokenSchema,   // 550ms
  long4: DtcgTokenSchema,   // 600ms
  extraLong1: DtcgTokenSchema, // 700ms
  extraLong2: DtcgTokenSchema, // 800ms
  extraLong3: DtcgTokenSchema, // 900ms
  extraLong4: DtcgTokenSchema, // 1000ms
});

export type M3Durations = z.infer<typeof M3DurationsSchema>;

export const M3_EASING_DEFAULTS = {
  emphasized: "cubic-bezier(0.2, 0.0, 0.0, 1.0)",
  emphasizedDecelerate: "cubic-bezier(0.05, 0.7, 0.1, 1.0)",
  emphasizedAccelerate: "cubic-bezier(0.3, 0.0, 0.8, 0.15)",
  standard: "cubic-bezier(0.2, 0.0, 0.0, 1.0)",
  standardDecelerate: "cubic-bezier(0.0, 0.0, 0.0, 1.0)",
  standardAccelerate: "cubic-bezier(0.3, 0.0, 1.0, 1.0)",
} as const;
