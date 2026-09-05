import { z } from "zod";

/**
 * Trainable DS Project Configuration Schema (`tds.config.yaml`)
 */
export const TrainableDsConfigSchema = z.object({
  name: z.string(),
  version: z.string().default("1.0.0"),
  framework: z.enum(["react-tailwind", "react-stylex", "vue-tailwind", "generic-css"]).default("react-tailwind"),
  mode: z.enum(["single-scheme", "dual-scheme"]).default("dual-scheme"),
  sourceDirs: z.array(z.string()).default(["./src"]),
  docsDirs: z.array(z.string()).default(["./docs", "./brand"]),
  output: z.object({
    designMdPath: z.string().default("./DESIGN.md"),
    cursorRulesPath: z.string().default("./.cursor/rules/design-system.mdc"),
    tokensJsonPath: z.string().default("./.design-system/tokens.json"),
    componentsManifestPath: z.string().default("./.design-system/components.manifest.json"),
  }).default({}),
  firebase: z.object({
    projectId: z.string().optional(),
    remoteRegistryUrl: z.string().optional(),
    syncOnTrain: z.boolean().default(false),
  }).optional(),
  compliance: z.object({
    strictHexDisallowed: z.boolean().default(true),
    strictTypescaleOnly: z.boolean().default(true),
    minTouchTargetPx: z.number().int().default(48),
    requireSentenceCase: z.boolean().default(true),
    requireOnColorPairing: z.boolean().default(true),
  }).default({}),
});

export type TrainableDsConfig = z.infer<typeof TrainableDsConfigSchema>;

/**
 * Human Overrides Schema (`overrides.yaml`)
 */
export const OverridesConfigSchema = z.object({
  tokenAliases: z.record(z.string(), z.string()).default({}), // e.g. "#0f172a" -> "sys.color.primary"
  lockedTokens: z.array(z.string()).default([]),             // token keys locked from AI re-indexing
  componentOverrides: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
});

export type OverridesConfig = z.infer<typeof OverridesConfigSchema>;
