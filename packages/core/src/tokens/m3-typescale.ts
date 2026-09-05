import { z } from "zod";
import { DtcgTokenSchema } from "./dtcg.js";

/**
 * Material Design 3 (M3) 15-Tier Typescale System
 * 5 Functional Categories: Display, Headline, Title, Body, Label
 * 3 Scales per Category: Large, Medium, Small
 */

export const M3TypeStyleSchema = z.object({
  fontFamily: DtcgTokenSchema,
  fontSize: DtcgTokenSchema,
  lineHeight: DtcgTokenSchema,
  fontWeight: DtcgTokenSchema,
  letterSpacing: DtcgTokenSchema, // tracking in px or em
});

export type M3TypeStyle = z.infer<typeof M3TypeStyleSchema>;

export const M3TypescaleSchema = z.object({
  // Display: prominent splash & marketing hero text
  displayLarge: M3TypeStyleSchema,
  displayMedium: M3TypeStyleSchema,
  displaySmall: M3TypeStyleSchema,

  // Headline: high-emphasis screen & section titles
  headlineLarge: M3TypeStyleSchema,
  headlineMedium: M3TypeStyleSchema,
  headlineSmall: M3TypeStyleSchema,

  // Title: medium-emphasis section headers, top app bars
  titleLarge: M3TypeStyleSchema,
  titleMedium: M3TypeStyleSchema,
  titleSmall: M3TypeStyleSchema,

  // Body: long-form text, descriptive body copy
  bodyLarge: M3TypeStyleSchema,
  bodyMedium: M3TypeStyleSchema,
  bodySmall: M3TypeStyleSchema,

  // Label: buttons, chips, tabs, form labels (sentence-case)
  labelLarge: M3TypeStyleSchema,
  labelMedium: M3TypeStyleSchema,
  labelSmall: M3TypeStyleSchema,
});

export type M3Typescale = z.infer<typeof M3TypescaleSchema>;

/**
 * Canonical M3 Typescale Defaults (Roboto / Inter baseline)
 */
export const M3_TYPESCALE_DEFAULTS = {
  displayLarge: { size: "57px", line: "64px", weight: 400, track: "-0.25px" },
  displayMedium: { size: "45px", line: "52px", weight: 400, track: "0px" },
  displaySmall: { size: "36px", line: "44px", weight: 400, track: "0px" },

  headlineLarge: { size: "32px", line: "40px", weight: 400, track: "0px" },
  headlineMedium: { size: "28px", line: "36px", weight: 400, track: "0px" },
  headlineSmall: { size: "24px", line: "32px", weight: 400, track: "0px" },

  titleLarge: { size: "22px", line: "28px", weight: 500, track: "0px" },
  titleMedium: { size: "16px", line: "24px", weight: 500, track: "0.15px" },
  titleSmall: { size: "14px", line: "20px", weight: 500, track: "0.10px" },

  bodyLarge: { size: "16px", line: "24px", weight: 400, track: "0.50px" },
  bodyMedium: { size: "14px", line: "20px", weight: 400, track: "0.25px" },
  bodySmall: { size: "12px", line: "16px", weight: 400, track: "0.40px" },

  labelLarge: { size: "14px", line: "20px", weight: 500, track: "0.10px" },
  labelMedium: { size: "12px", line: "16px", weight: 500, track: "0.50px" },
  labelSmall: { size: "11px", line: "16px", weight: 500, track: "0.50px" },
} as const;
