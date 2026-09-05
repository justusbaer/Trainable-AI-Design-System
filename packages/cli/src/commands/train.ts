import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
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
  TrainableDsConfig,
} from "@trainable-ds/core";
import { compileDesignMd, scanComponentsInDir } from "@trainable-ds/compiler";

export interface TrainOptions {
  src?: string;
  docs?: string;
}

/**
 * Extracts and "trains" an M3 design system from source code files.
 */
export async function runTrain(options: TrainOptions) {
  const cwd = process.cwd();
  const srcDir = path.resolve(cwd, options.src || "./src");
  console.log(pc.cyan("🔬 Training Design System from:") + ` ${srcDir}`);

  // 1. Scan directory for color values
  const detectedColors: Map<string, number> = new Map();
  const detectedComponents: Set<string> = new Set();

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          scanDir(fullPath);
        }
      } else if (/\.(tsx|jsx|css|scss|html|vue|svelte)$/i.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");

        // Collect hex colors
        const hexMatches = content.match(/#[0-9a-fA-F]{6}\b/g) || [];
        for (const hex of hexMatches) {
          const lower = hex.toLowerCase();
          detectedColors.set(lower, (detectedColors.get(lower) || 0) + 1);
        }

        // Collect component names (PascalCase exports)
        const compMatches = content.match(/export\s+(?:function|const)\s+([A-Z][a-zA-Z0-9]+)/g) || [];
        for (const m of compMatches) {
          const name = m.split(/\s+/)[2];
          if (name) detectedComponents.add(name);
        }
      }
    }
  }

  scanDir(srcDir);

  // Pick top dominant brand color or fallback to standard M3 primary (#00639b)
  let dominantHex = "#00639b";
  let maxCount = 0;
  for (const [hex, count] of detectedColors.entries()) {
    // Avoid pure black and white as primary seed
    if (hex !== "#000000" && hex !== "#ffffff" && count > maxCount) {
      maxCount = count;
      dominantHex = hex;
    }
  }

  console.log(pc.green(`✔ Discovered dominant brand color: `) + pc.bold(dominantHex));
  console.log(pc.green(`✔ Discovered ${detectedComponents.size} UI component(s)`));

  // 2. Derive M3 Tonal Palettes via HCT color math
  const primaryPalette = generateTonalPalette(dominantHex, "Primary");
  const neutralPalette = generateTonalPalette("#5e5e62", "Neutral");

  // 3. Assemble M3 Dual Color Scheme
  const colors: M3DualColorScheme = {
    light: {
      primary: createToken(primaryPalette["40"]!.$value, "color", "Primary action color"),
      onPrimary: createToken(primaryPalette["100"]!.$value, "color", "Text on primary"),
      primaryContainer: createToken(primaryPalette["90"]!.$value, "color", "Low-emphasis primary container"),
      onPrimaryContainer: createToken(primaryPalette["10"]!.$value, "color", "Text on primary container"),

      secondary: createToken(primaryPalette["40"]!.$value, "color", "Secondary accent"),
      onSecondary: createToken(primaryPalette["100"]!.$value, "color", "Text on secondary"),
      secondaryContainer: createToken(primaryPalette["90"]!.$value, "color", "Secondary container"),
      onSecondaryContainer: createToken(primaryPalette["10"]!.$value, "color", "Text on secondary container"),

      tertiary: createToken(primaryPalette["40"]!.$value, "color", "Tertiary accent"),
      onTertiary: createToken(primaryPalette["100"]!.$value, "color", "Text on tertiary"),
      tertiaryContainer: createToken(primaryPalette["90"]!.$value, "color", "Tertiary container"),
      onTertiaryContainer: createToken(primaryPalette["10"]!.$value, "color", "Text on tertiary container"),

      error: createToken("#ba1a1a", "color", "Error state color"),
      onError: createToken("#ffffff", "color", "Text on error"),
      errorContainer: createToken("#ffdad6", "color", "Error container"),
      onErrorContainer: createToken("#410002", "color", "Text on error container"),

      surface: createToken(neutralPalette["98"]!.$value, "color", "Base surface background"),
      onSurface: createToken(neutralPalette["10"]!.$value, "color", "Text on base surface"),
      surfaceVariant: createToken(neutralPalette["90"]!.$value, "color", "Surface variant"),
      onSurfaceVariant: createToken(neutralPalette["30"]!.$value, "color", "Text on surface variant"),
      surfaceDim: createToken(neutralPalette["80"]!.$value, "color", "Dim surface"),
      surfaceBright: createToken(neutralPalette["99"]!.$value, "color", "Bright surface"),
      surfaceContainerLowest: createToken(neutralPalette["100"]!.$value, "color", "Lowest container"),
      surfaceContainerLow: createToken(neutralPalette["95"]!.$value, "color", "Low container"),
      surfaceContainer: createToken(neutralPalette["90"]!.$value, "color", "Default container"),
      surfaceContainerHigh: createToken(neutralPalette["80"]!.$value, "color", "High container"),
      surfaceContainerHighest: createToken(neutralPalette["70"]!.$value, "color", "Highest container"),

      primaryFixed: createToken(primaryPalette["90"]!.$value, "color", "Theme-invariant primary fixed"),
      primaryFixedDim: createToken(primaryPalette["80"]!.$value, "color", "Theme-invariant primary fixed dim"),
      onPrimaryFixed: createToken(primaryPalette["10"]!.$value, "color", "Text on primary fixed"),
      onPrimaryFixedVariant: createToken(primaryPalette["30"]!.$value, "color", "Text on primary fixed variant"),

      secondaryFixed: createToken(primaryPalette["90"]!.$value, "color", "Secondary fixed"),
      secondaryFixedDim: createToken(primaryPalette["80"]!.$value, "color", "Secondary fixed dim"),
      onSecondaryFixed: createToken(primaryPalette["10"]!.$value, "color", "Text on secondary fixed"),
      onSecondaryFixedVariant: createToken(primaryPalette["30"]!.$value, "color", "Text on secondary fixed variant"),

      tertiaryFixed: createToken(primaryPalette["90"]!.$value, "color", "Tertiary fixed"),
      tertiaryFixedDim: createToken(primaryPalette["80"]!.$value, "color", "Tertiary fixed dim"),
      onTertiaryFixed: createToken(primaryPalette["10"]!.$value, "color", "Text on tertiary fixed"),
      onTertiaryFixedVariant: createToken(primaryPalette["30"]!.$value, "color", "Text on tertiary fixed variant"),

      outline: createToken("#72777f", "color", "3:1 boundary outline"),
      outlineVariant: createToken("#c2c7cf", "color", "Divider outline"),
      inverseSurface: createToken(neutralPalette["20"]!.$value, "color", "Inverse surface"),
      inverseOnSurface: createToken(neutralPalette["95"]!.$value, "color", "Text on inverse surface"),
      inversePrimary: createToken(primaryPalette["80"]!.$value, "color", "Inverse primary"),
      shadow: createToken("#000000", "color", "Elevation shadow"),
      scrim: createToken("#000000", "color", "Modal backdrop scrim"),
      surfaceTint: createToken(primaryPalette["40"]!.$value, "color", "Elevation surface tint overlay"),
    },
    dark: {
      primary: createToken(primaryPalette["80"]!.$value, "color", "Primary action color (dark)"),
      onPrimary: createToken(primaryPalette["20"]!.$value, "color", "Text on primary (dark)"),
      primaryContainer: createToken(primaryPalette["30"]!.$value, "color", "Primary container (dark)"),
      onPrimaryContainer: createToken(primaryPalette["90"]!.$value, "color", "Text on primary container (dark)"),

      secondary: createToken(primaryPalette["80"]!.$value, "color", "Secondary accent (dark)"),
      onSecondary: createToken(primaryPalette["20"]!.$value, "color", "Text on secondary (dark)"),
      secondaryContainer: createToken(primaryPalette["30"]!.$value, "color", "Secondary container (dark)"),
      onSecondaryContainer: createToken(primaryPalette["90"]!.$value, "color", "Text on secondary container (dark)"),

      tertiary: createToken(primaryPalette["80"]!.$value, "color", "Tertiary accent (dark)"),
      onTertiary: createToken(primaryPalette["20"]!.$value, "color", "Text on tertiary (dark)"),
      tertiaryContainer: createToken(primaryPalette["30"]!.$value, "color", "Tertiary container (dark)"),
      onTertiaryContainer: createToken(primaryPalette["90"]!.$value, "color", "Text on tertiary container (dark)"),

      error: createToken("#ffb4ab", "color", "Error state color (dark)"),
      onError: createToken("#690005", "color", "Text on error (dark)"),
      errorContainer: createToken("#93000a", "color", "Error container (dark)"),
      onErrorContainer: createToken("#ffdad6", "color", "Text on error container (dark)"),

      surface: createToken(neutralPalette["10"]!.$value, "color", "Base surface background (dark)"),
      onSurface: createToken(neutralPalette["90"]!.$value, "color", "Text on base surface (dark)"),
      surfaceVariant: createToken(neutralPalette["30"]!.$value, "color", "Surface variant (dark)"),
      onSurfaceVariant: createToken(neutralPalette["80"]!.$value, "color", "Text on surface variant (dark)"),
      surfaceDim: createToken(neutralPalette["10"]!.$value, "color", "Dim surface (dark)"),
      surfaceBright: createToken(neutralPalette["30"]!.$value, "color", "Bright surface (dark)"),
      surfaceContainerLowest: createToken(neutralPalette["0"]!.$value, "color", "Lowest container (dark)"),
      surfaceContainerLow: createToken(neutralPalette["10"]!.$value, "color", "Low container (dark)"),
      surfaceContainer: createToken(neutralPalette["10"]!.$value, "color", "Default container (dark)"),
      surfaceContainerHigh: createToken(neutralPalette["20"]!.$value, "color", "High container (dark)"),
      surfaceContainerHighest: createToken(neutralPalette["30"]!.$value, "color", "Highest container (dark)"),

      primaryFixed: createToken(primaryPalette["90"]!.$value, "color", "Theme-invariant primary fixed"),
      primaryFixedDim: createToken(primaryPalette["80"]!.$value, "color", "Theme-invariant primary fixed dim"),
      onPrimaryFixed: createToken(primaryPalette["10"]!.$value, "color", "Text on primary fixed"),
      onPrimaryFixedVariant: createToken(primaryPalette["30"]!.$value, "color", "Text on primary fixed variant"),

      secondaryFixed: createToken(primaryPalette["90"]!.$value, "color", "Secondary fixed"),
      secondaryFixedDim: createToken(primaryPalette["80"]!.$value, "color", "Secondary fixed dim"),
      onSecondaryFixed: createToken(primaryPalette["10"]!.$value, "color", "Text on secondary fixed"),
      onSecondaryFixedVariant: createToken(primaryPalette["30"]!.$value, "color", "Text on secondary fixed variant"),

      tertiaryFixed: createToken(primaryPalette["90"]!.$value, "color", "Tertiary fixed"),
      tertiaryFixedDim: createToken(primaryPalette["80"]!.$value, "color", "Tertiary fixed dim"),
      onTertiaryFixed: createToken(primaryPalette["10"]!.$value, "color", "Text on tertiary fixed"),
      onTertiaryFixedVariant: createToken(primaryPalette["30"]!.$value, "color", "Text on tertiary fixed variant"),

      outline: createToken("#8c9199", "color", "3:1 boundary outline (dark)"),
      outlineVariant: createToken("#42474e", "color", "Divider outline (dark)"),
      inverseSurface: createToken(neutralPalette["90"]!.$value, "color", "Inverse surface (dark)"),
      inverseOnSurface: createToken(neutralPalette["20"]!.$value, "color", "Text on inverse surface (dark)"),
      inversePrimary: createToken(primaryPalette["40"]!.$value, "color", "Inverse primary (dark)"),
      shadow: createToken("#000000", "color", "Elevation shadow"),
      scrim: createToken("#000000", "color", "Modal backdrop scrim"),
      surfaceTint: createToken(primaryPalette["80"]!.$value, "color", "Elevation surface tint overlay (dark)"),
    }
  };

  // 4. Default M3 Foundations
  const makeTypeStyle = (def: { size: string; line: string; weight: number; track: string }) => ({
    fontFamily: createToken("Inter, sans-serif", "fontFamily"),
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
    name: "Trained Design System",
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

  // 5. Save W3C DTCG tokens.json
  const dsDir = path.join(cwd, ".design-system");
  if (!fs.existsSync(dsDir)) fs.mkdirSync(dsDir, { recursive: true });

  const tokensPayload = {
    ref: {
      palette: {
        primary: primaryPalette,
        neutral: neutralPalette,
      }
    },
    sys: {
      color: colors,
      typescale,
      state,
      elevation,
    }
  };
  fs.writeFileSync(path.join(dsDir, "tokens.json"), JSON.stringify(tokensPayload, null, 2), "utf-8");
  console.log(pc.green("✔ Wrote W3C DTCG 3-tier tokens to .design-system/tokens.json"));

  // 6. Extract component manifests across 6 M3 functional families
  const componentsManifest = scanComponentsInDir(srcDir, cwd);
  const componentCount = Object.keys(componentsManifest.components).length;
  console.log(pc.green(`✔ Discovered and cataloged ${componentCount} component(s) across M3 families`));

  fs.writeFileSync(
    path.join(dsDir, "components.manifest.json"),
    JSON.stringify(componentsManifest, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(dsDir, "components.json"),
    JSON.stringify(componentsManifest, null, 2),
    "utf-8"
  );

  // 7. Compile and write root DESIGN.md
  const compiledMd = compileDesignMd({
    config,
    colors,
    typescale,
    state,
    elevation,
    components: componentsManifest,
  });
  fs.writeFileSync(path.join(cwd, "DESIGN.md"), compiledMd, "utf-8");
  console.log(pc.green("✔ Compiled and synchronized root DESIGN.md with tokens and component contracts"));

  console.log(pc.bold(pc.green("\n✨ Training complete! Design system derived at M3 fidelity.")));
}
