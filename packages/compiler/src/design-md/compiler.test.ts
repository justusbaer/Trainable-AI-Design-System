import { describe, it, expect } from "vitest";
import { compileDesignMd, parseDesignMd } from "./compiler.js";
import { 
  generateTonalPalette, 
  createToken, 
  M3DualColorScheme, 
  M3Typescale, 
  M3StateLayers, 
  M3ElevationSystem,
  M3_TYPESCALE_DEFAULTS,
  M3_STATE_DEFAULTS,
  M3_ELEVATION_DEFAULTS,
  TrainableDsConfig
} from "@trainable-ds/core";

describe("Enhanced DESIGN.md Compiler", () => {
  it("compiles and parses DESIGN.md with frontmatter tokens and rationale", () => {
    const primary = generateTonalPalette("#00639b", "Primary");
    const neutral = generateTonalPalette("#5e5e62", "Neutral");

    const colors: M3DualColorScheme = {
      light: {
        primary: createToken(primary["40"]!.$value, "color"),
        onPrimary: createToken(primary["100"]!.$value, "color"),
        primaryContainer: createToken(primary["90"]!.$value, "color"),
        onPrimaryContainer: createToken(primary["10"]!.$value, "color"),
        secondary: createToken(primary["40"]!.$value, "color"),
        onSecondary: createToken(primary["100"]!.$value, "color"),
        secondaryContainer: createToken(primary["90"]!.$value, "color"),
        onSecondaryContainer: createToken(primary["10"]!.$value, "color"),
        tertiary: createToken(primary["40"]!.$value, "color"),
        onTertiary: createToken(primary["100"]!.$value, "color"),
        tertiaryContainer: createToken(primary["90"]!.$value, "color"),
        onTertiaryContainer: createToken(primary["10"]!.$value, "color"),
        error: createToken("#ba1a1a", "color"),
        onError: createToken("#ffffff", "color"),
        errorContainer: createToken("#ffdad6", "color"),
        onErrorContainer: createToken("#410002", "color"),
        surface: createToken(neutral["98"]!.$value, "color"),
        onSurface: createToken(neutral["10"]!.$value, "color"),
        surfaceVariant: createToken(neutral["90"]!.$value, "color"),
        onSurfaceVariant: createToken(neutral["30"]!.$value, "color"),
        surfaceDim: createToken(neutral["80"]!.$value, "color"),
        surfaceBright: createToken(neutral["99"]!.$value, "color"),
        surfaceContainerLowest: createToken(neutral["100"]!.$value, "color"),
        surfaceContainerLow: createToken(neutral["95"]!.$value, "color"),
        surfaceContainer: createToken(neutral["90"]!.$value, "color"),
        surfaceContainerHigh: createToken(neutral["80"]!.$value, "color"),
        surfaceContainerHighest: createToken(neutral["70"]!.$value, "color"),
        primaryFixed: createToken(primary["90"]!.$value, "color"),
        primaryFixedDim: createToken(primary["80"]!.$value, "color"),
        onPrimaryFixed: createToken(primary["10"]!.$value, "color"),
        onPrimaryFixedVariant: createToken(primary["30"]!.$value, "color"),
        secondaryFixed: createToken(primary["90"]!.$value, "color"),
        secondaryFixedDim: createToken(primary["80"]!.$value, "color"),
        onSecondaryFixed: createToken(primary["10"]!.$value, "color"),
        onSecondaryFixedVariant: createToken(primary["30"]!.$value, "color"),
        tertiaryFixed: createToken(primary["90"]!.$value, "color"),
        tertiaryFixedDim: createToken(primary["80"]!.$value, "color"),
        onTertiaryFixed: createToken(primary["10"]!.$value, "color"),
        onTertiaryFixedVariant: createToken(primary["30"]!.$value, "color"),
        outline: createToken("#72777f", "color"),
        outlineVariant: createToken("#c2c7cf", "color"),
        inverseSurface: createToken(neutral["20"]!.$value, "color"),
        inverseOnSurface: createToken(neutral["95"]!.$value, "color"),
        inversePrimary: createToken(primary["80"]!.$value, "color"),
        shadow: createToken("#000000", "color"),
        scrim: createToken("#000000", "color"),
        surfaceTint: createToken(primary["40"]!.$value, "color"),
      },
      dark: {
        primary: createToken(primary["80"]!.$value, "color"),
        onPrimary: createToken(primary["20"]!.$value, "color"),
        primaryContainer: createToken(primary["30"]!.$value, "color"),
        onPrimaryContainer: createToken(primary["90"]!.$value, "color"),
        secondary: createToken(primary["80"]!.$value, "color"),
        onSecondary: createToken(primary["20"]!.$value, "color"),
        secondaryContainer: createToken(primary["30"]!.$value, "color"),
        onSecondaryContainer: createToken(primary["90"]!.$value, "color"),
        tertiary: createToken(primary["80"]!.$value, "color"),
        onTertiary: createToken(primary["20"]!.$value, "color"),
        tertiaryContainer: createToken(primary["30"]!.$value, "color"),
        onTertiaryContainer: createToken(primary["90"]!.$value, "color"),
        error: createToken("#ffb4ab", "color"),
        onError: createToken("#690005", "color"),
        errorContainer: createToken("#93000a", "color"),
        onErrorContainer: createToken("#ffdad6", "color"),
        surface: createToken(neutral["10"]!.$value, "color"),
        onSurface: createToken(neutral["90"]!.$value, "color"),
        surfaceVariant: createToken(neutral["30"]!.$value, "color"),
        onSurfaceVariant: createToken(neutral["80"]!.$value, "color"),
        surfaceDim: createToken(neutral["10"]!.$value, "color"),
        surfaceBright: createToken(neutral["30"]!.$value, "color"),
        surfaceContainerLowest: createToken(neutral["0"]!.$value, "color"),
        surfaceContainerLow: createToken(neutral["10"]!.$value, "color"),
        surfaceContainer: createToken(neutral["10"]!.$value, "color"),
        surfaceContainerHigh: createToken(neutral["20"]!.$value, "color"),
        surfaceContainerHighest: createToken(neutral["30"]!.$value, "color"),
        primaryFixed: createToken(primary["90"]!.$value, "color"),
        primaryFixedDim: createToken(primary["80"]!.$value, "color"),
        onPrimaryFixed: createToken(primary["10"]!.$value, "color"),
        onPrimaryFixedVariant: createToken(primary["30"]!.$value, "color"),
        secondaryFixed: createToken(primary["90"]!.$value, "color"),
        secondaryFixedDim: createToken(primary["80"]!.$value, "color"),
        onSecondaryFixed: createToken(primary["10"]!.$value, "color"),
        onSecondaryFixedVariant: createToken(primary["30"]!.$value, "color"),
        tertiaryFixed: createToken(primary["90"]!.$value, "color"),
        tertiaryFixedDim: createToken(primary["80"]!.$value, "color"),
        onTertiaryFixed: createToken(primary["10"]!.$value, "color"),
        onTertiaryFixedVariant: createToken(primary["30"]!.$value, "color"),
        outline: createToken("#8c9199", "color"),
        outlineVariant: createToken("#42474e", "color"),
        inverseSurface: createToken(neutral["90"]!.$value, "color"),
        inverseOnSurface: createToken(neutral["20"]!.$value, "color"),
        inversePrimary: createToken(primary["40"]!.$value, "color"),
        shadow: createToken("#000000", "color"),
        scrim: createToken("#000000", "color"),
        surfaceTint: createToken(primary["80"]!.$value, "color"),
      }
    };

    const makeTypeStyle = (def: { size: string; line: string; weight: number; track: string }) => ({
      fontFamily: createToken("Inter", "fontFamily"),
      fontSize: createToken(def.size, "dimension"),
      lineHeight: createToken(def.line, "dimension"),
      fontWeight: createToken(def.weight, "fontWeight"),
      letterSpacing: createToken(def.track, "dimension"),
    });

    const typescale: M3Typescale = {
      displayLarge: makeTypeStyle(M3_TYPESCALE_DEFAULTS.displayLarge),
      displayMedium: makeTypeStyle(M3_TYPESCALE_DEFAULTS.displayMedium),
      displaySmall: makeTypeStyle(M3_TYPESCALE_DEFAULTS.displaySmall),
      headlineLarge: makeTypeStyle(M3_TYPESCALE_DEFAULTS.headlineLarge),
      headlineMedium: makeTypeStyle(M3_TYPESCALE_DEFAULTS.headlineMedium),
      headlineSmall: makeTypeStyle(M3_TYPESCALE_DEFAULTS.headlineSmall),
      titleLarge: makeTypeStyle(M3_TYPESCALE_DEFAULTS.titleLarge),
      titleMedium: makeTypeStyle(M3_TYPESCALE_DEFAULTS.titleMedium),
      titleSmall: makeTypeStyle(M3_TYPESCALE_DEFAULTS.titleSmall),
      bodyLarge: makeTypeStyle(M3_TYPESCALE_DEFAULTS.bodyLarge),
      bodyMedium: makeTypeStyle(M3_TYPESCALE_DEFAULTS.bodyMedium),
      bodySmall: makeTypeStyle(M3_TYPESCALE_DEFAULTS.bodySmall),
      labelLarge: makeTypeStyle(M3_TYPESCALE_DEFAULTS.labelLarge),
      labelMedium: makeTypeStyle(M3_TYPESCALE_DEFAULTS.labelMedium),
      labelSmall: makeTypeStyle(M3_TYPESCALE_DEFAULTS.labelSmall),
    };

    const state: M3StateLayers = {
      hover: createToken(M3_STATE_DEFAULTS.hover, "number"),
      focus: createToken(M3_STATE_DEFAULTS.focus, "number"),
      pressed: createToken(M3_STATE_DEFAULTS.pressed, "number"),
      dragged: createToken(M3_STATE_DEFAULTS.dragged, "number"),
      disabledContent: createToken(M3_STATE_DEFAULTS.disabledContent, "number"),
      disabledContainer: createToken(M3_STATE_DEFAULTS.disabledContainer, "number"),
      focusRingWidth: createToken(M3_STATE_DEFAULTS.focusRingWidth, "dimension"),
      focusRingOffset: createToken(M3_STATE_DEFAULTS.focusRingOffset, "dimension"),
    };

    const makeElevation = (def: { dp: string; tint: number; shadow: string }) => ({
      elevationDp: createToken(def.dp, "dimension"),
      surfaceTintPercentage: createToken(def.tint, "number"),
      shadow: createToken(def.shadow, "shadow"),
    });

    const elevation: M3ElevationSystem = {
      level0: makeElevation(M3_ELEVATION_DEFAULTS.level0),
      level1: makeElevation(M3_ELEVATION_DEFAULTS.level1),
      level2: makeElevation(M3_ELEVATION_DEFAULTS.level2),
      level3: makeElevation(M3_ELEVATION_DEFAULTS.level3),
      level4: makeElevation(M3_ELEVATION_DEFAULTS.level4),
      level5: makeElevation(M3_ELEVATION_DEFAULTS.level5),
    };

    const config: TrainableDsConfig = {
      name: "Acme Test DS",
      version: "1.0.0",
      framework: "react-tailwind",
      mode: "dual-scheme",
      sourceDirs: ["./src"],
      docsDirs: ["./docs"],
      output: {
        designMdPath: "./DESIGN.md",
        cursorRulesPath: "./.cursor/rules/design-system.mdc",
        tokensJsonPath: "./.design-system/tokens.json",
        componentsManifestPath: "./.design-system/components.manifest.json",
      },
      compliance: {
        strictHexDisallowed: true,
        strictTypescaleOnly: true,
        minTouchTargetPx: 48,
        requireSentenceCase: true,
        requireOnColorPairing: true,
      },
    };

    const markdown = compileDesignMd({
      config,
      colors,
      typescale,
      state,
      elevation,
      designThesis: "Clean, robust enterprise UI.",
    });

    expect(markdown).toContain("schema: trainable-ds/v1.7");
    expect(markdown).toContain("Clean, robust enterprise UI.");
    expect(markdown).toContain("NO RAW HEX CODES");

    const parsed = parseDesignMd(markdown);
    expect(parsed.frontmatter).toBeDefined();
    expect((parsed.frontmatter as any).name).toBe("Acme Test DS");
  });
});
