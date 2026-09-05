import { z } from "zod";
import { DtcgTokenSchema } from "./dtcg.js";

/**
 * Material Design 3 (M3) Complete Color System
 * Incorporates 36+ semantic roles, HCT Tonal Palettes (0–100),
 * Fixed Accent roles, and the 5-level Surface Container hierarchy.
 */

export const M3TonalToneEnum = z.enum([
  "0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "95", "98", "99", "100"
]);
export type M3TonalTone = z.infer<typeof M3TonalToneEnum>;

export const M3TonalPaletteSchema = z.record(M3TonalToneEnum, DtcgTokenSchema);
export type M3TonalPalette = z.infer<typeof M3TonalPaletteSchema>;

export const M3ReferencePalettesSchema = z.object({
  primary: M3TonalPaletteSchema,
  secondary: M3TonalPaletteSchema,
  tertiary: M3TonalPaletteSchema,
  neutral: M3TonalPaletteSchema,
  neutralVariant: M3TonalPaletteSchema,
  error: M3TonalPaletteSchema,
});
export type M3ReferencePalettes = z.infer<typeof M3ReferencePalettesSchema>;

/**
 * M3 Scheme Semantic Color Roles (Light or Dark)
 */
export const M3ColorSchemeRolesSchema = z.object({
  // Primary accent pair
  primary: DtcgTokenSchema,
  onPrimary: DtcgTokenSchema,
  primaryContainer: DtcgTokenSchema,
  onPrimaryContainer: DtcgTokenSchema,

  // Secondary accent pair
  secondary: DtcgTokenSchema,
  onSecondary: DtcgTokenSchema,
  secondaryContainer: DtcgTokenSchema,
  onSecondaryContainer: DtcgTokenSchema,

  // Tertiary accent pair
  tertiary: DtcgTokenSchema,
  onTertiary: DtcgTokenSchema,
  tertiaryContainer: DtcgTokenSchema,
  onTertiaryContainer: DtcgTokenSchema,

  // Error pair
  error: DtcgTokenSchema,
  onError: DtcgTokenSchema,
  errorContainer: DtcgTokenSchema,
  onErrorContainer: DtcgTokenSchema,

  // Base Surface hierarchy (M3 5-tier container system)
  surface: DtcgTokenSchema,
  onSurface: DtcgTokenSchema,
  surfaceVariant: DtcgTokenSchema,
  onSurfaceVariant: DtcgTokenSchema,
  surfaceDim: DtcgTokenSchema,
  surfaceBright: DtcgTokenSchema,
  surfaceContainerLowest: DtcgTokenSchema,
  surfaceContainerLow: DtcgTokenSchema,
  surfaceContainer: DtcgTokenSchema, // Default container
  surfaceContainerHigh: DtcgTokenSchema,
  surfaceContainerHighest: DtcgTokenSchema,

  // Fixed Accent Roles (Theme-Invariant: same tone in light and dark)
  primaryFixed: DtcgTokenSchema,
  primaryFixedDim: DtcgTokenSchema,
  onPrimaryFixed: DtcgTokenSchema,
  onPrimaryFixedVariant: DtcgTokenSchema,

  secondaryFixed: DtcgTokenSchema,
  secondaryFixedDim: DtcgTokenSchema,
  onSecondaryFixed: DtcgTokenSchema,
  onSecondaryFixedVariant: DtcgTokenSchema,

  tertiaryFixed: DtcgTokenSchema,
  tertiaryFixedDim: DtcgTokenSchema,
  onTertiaryFixed: DtcgTokenSchema,
  onTertiaryFixedVariant: DtcgTokenSchema,

  // Utilities & Inverses
  outline: DtcgTokenSchema,
  outlineVariant: DtcgTokenSchema,
  inverseSurface: DtcgTokenSchema,
  inverseOnSurface: DtcgTokenSchema,
  inversePrimary: DtcgTokenSchema,
  shadow: DtcgTokenSchema,
  scrim: DtcgTokenSchema,
  surfaceTint: DtcgTokenSchema,
});

export type M3ColorSchemeRoles = z.infer<typeof M3ColorSchemeRolesSchema>;

export const M3DualColorSchemeSchema = z.object({
  light: M3ColorSchemeRolesSchema,
  dark: M3ColorSchemeRolesSchema,
});

export type M3DualColorScheme = z.infer<typeof M3DualColorSchemeSchema>;
