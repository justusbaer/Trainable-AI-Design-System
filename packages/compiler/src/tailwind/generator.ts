import { M3DualColorScheme, M3ShapeScale } from "@trainable-ds/core";

/**
 * Generates a Tailwind CSS configuration object (`theme.extend`)
 * mapping M3 semantic tokens to Tailwind classes.
 */
export function generateTailwindTheme(colors: M3DualColorScheme, shapes?: M3ShapeScale) {
  return {
    colors: {
      brand: {
        primary: colors.light.primary.$value,
        "on-primary": colors.light.onPrimary.$value,
        "primary-container": colors.light.primaryContainer.$value,
        "on-primary-container": colors.light.onPrimaryContainer.$value,
      },
      surface: {
        DEFAULT: colors.light.surface.$value,
        "on-surface": colors.light.onSurface.$value,
        "variant": colors.light.surfaceVariant.$value,
        "container-lowest": colors.light.surfaceContainerLowest.$value,
        "container-low": colors.light.surfaceContainerLow.$value,
        "container": colors.light.surfaceContainer.$value,
        "container-high": colors.light.surfaceContainerHigh.$value,
        "container-highest": colors.light.surfaceContainerHighest.$value,
      },
      outline: {
        DEFAULT: colors.light.outline.$value,
        variant: colors.light.outlineVariant.$value,
      },
    },
    borderRadius: {
      "m3-none": "0px",
      "m3-xs": shapes?.cornerExtraSmall.$value || "4px",
      "m3-sm": shapes?.cornerSmall.$value || "8px",
      "m3-md": shapes?.cornerMedium.$value || "12px",
      "m3-lg": shapes?.cornerLarge.$value || "16px",
      "m3-xl": shapes?.cornerExtraLarge.$value || "28px",
      "m3-full": "9999px",
    },
  };
}
