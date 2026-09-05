import { z } from "zod";
import { DtcgTokenSchema } from "./dtcg.js";

/**
 * Material Design 3 Interaction State Layers
 * Overlay opacities and focus indicator specs
 */
export const M3StateLayersSchema = z.object({
  hover: DtcgTokenSchema,     // Default: 0.08 (8% overlay)
  focus: DtcgTokenSchema,     // Default: 0.10 (10% overlay)
  pressed: DtcgTokenSchema,   // Default: 0.10 (10% overlay + ripple)
  dragged: DtcgTokenSchema,   // Default: 0.16 (16% overlay)
  disabledContent: DtcgTokenSchema,   // Default: 0.38 (38% opacity for text & icons)
  disabledContainer: DtcgTokenSchema, // Default: 0.12 (12% opacity for background fill)
  focusRingWidth: DtcgTokenSchema,    // Default: 3px
  focusRingOffset: DtcgTokenSchema,   // Default: 2px
});

export type M3StateLayers = z.infer<typeof M3StateLayersSchema>;

export const M3_STATE_DEFAULTS = {
  hover: 0.08,
  focus: 0.10,
  pressed: 0.10,
  dragged: 0.16,
  disabledContent: 0.38,
  disabledContainer: 0.12,
  focusRingWidth: "3px",
  focusRingOffset: "2px",
} as const;
