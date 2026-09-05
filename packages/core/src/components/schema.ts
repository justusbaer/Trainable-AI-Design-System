import { z } from "zod";

/**
 * Material Design 3 Functional Families
 */
export const M3ComponentFamilyEnum = z.enum([
  "actions",        // Common buttons, FAB, Icon buttons, Segmented buttons
  "communication",  // Badges, Progress indicators, Snackbars, Tooltips
  "containment",    // Cards, Dialogs, Bottom/Side sheets, Dividers, Lists
  "navigation",     // App bars, Navigation bar, Navigation drawer, Navigation rail, Tabs, Search
  "selection",      // Checkboxes, Chips, Date/Time pickers, Radio buttons, Sliders, Switches
  "text-inputs",    // Filled & Outlined text fields
]);

export type M3ComponentFamily = z.infer<typeof M3ComponentFamilyEnum>;

export const ComponentPropSchema = z.object({
  type: z.string(),
  enum: z.array(z.string()).optional(),
  required: z.boolean().optional().default(false),
  default: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  description: z.string().optional(),
});

export type ComponentProp = z.infer<typeof ComponentPropSchema>;

export const ComponentAnatomySchema = z.object({
  container: z.object({
    minHeight: z.string().optional(),
    minWidth: z.string().optional(),
    shape: z.string().optional(),
    minTouchTarget: z.string().default("48px"),
  }).optional(),
  stateLayer: z.object({
    enabled: z.boolean().default(true),
    tokens: z.string().optional(),
  }).optional(),
  label: z.object({
    typescale: z.string(),
    case: z.enum(["sentence", "none"]).default("sentence"),
  }).optional(),
  leadingIcon: z.object({
    size: z.string().default("18px"),
    optional: z.boolean().default(true),
  }).optional(),
  trailingIcon: z.object({
    size: z.string().default("18px"),
    optional: z.boolean().default(true),
  }).optional(),
  badge: z.object({
    optional: z.boolean().default(true),
  }).optional(),
}).passthrough();

export type ComponentAnatomy = z.infer<typeof ComponentAnatomySchema>;

export const ComponentVariantSchema = z.object({
  containerColor: z.string().optional(),
  labelColor: z.string().optional(),
  borderColor: z.string().optional(),
  elevation: z.number().int().min(0).max(5).default(0),
  description: z.string().optional(),
});

export type ComponentVariant = z.infer<typeof ComponentVariantSchema>;

export const ComponentDefinitionSchema = z.object({
  name: z.string(),
  path: z.string(),
  family: M3ComponentFamilyEnum,
  description: z.string(),
  anatomy: ComponentAnatomySchema,
  variants: z.record(z.string(), ComponentVariantSchema),
  props: z.record(z.string(), ComponentPropSchema),
  a11y: z.object({
    minTouchTarget: z.string().default("48x48px"),
    requiredAria: z.array(z.string()).default([]),
    focusIndicator: z.string().default("3px outline with 2px offset"),
  }),
  rules: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
});

export type ComponentDefinition = z.infer<typeof ComponentDefinitionSchema>;

export const ComponentManifestSchema = z.object({
  version: z.string(),
  lastUpdated: z.string().optional(),
  components: z.record(z.string(), ComponentDefinitionSchema),
});

export type ComponentManifest = z.infer<typeof ComponentManifestSchema>;
