import { ComponentBlueprint, ComponentSlotDefinition, StandardSlotName } from "./types.js";

/**
 * Universal slot descriptions and roles
 */
export const STANDARD_SLOT_DESCRIPTIONS: Record<StandardSlotName, string> = {
  header: "Top section container, typically housing eyebrow, publisher badges, or timestamps",
  eyebrow: "Small category or publisher metadata above the headline",
  media: "Visual asset container (thumbnail image, video embed, or icon illustration)",
  title: "Primary headline or card title",
  content: "Main body text, narrative summary, or structured list items",
  footer: "Bottom metadata or auxiliary information bar",
  actions: "Interactive buttons, overflow menus, or share triggers",
  secondary: "Nested sub-stories, related links, or secondary list items",
  emptyState: "Fallback placeholder shown when content is unavailable",
  custom: "Domain-specific custom slot"
};

/**
 * Validates whether a component definition fulfills touch target requirements (>= 48x48px).
 */
export function validateTouchTarget(width: number, height: number): { valid: boolean; recommendation?: string } {
  const MIN_TARGET = 48;
  if (width < MIN_TARGET || height < MIN_TARGET) {
    return {
      valid: false,
      recommendation: `Interactive elements must provide at least 48x48px bounding box (got ${width}x${height}px) to satisfy WCAG 2.5.5.`
    };
  }
  return { valid: true };
}

/**
 * Generates a standard component blueprint skeleton.
 */
export function createComponentBlueprint(
  name: string,
  family: ComponentBlueprint["family"],
  description: string,
  domElement: string,
  slots: Record<string, Partial<ComponentSlotDefinition>>,
  minBoundingBox: { width: number; height: number } = { width: 48, height: 48 }
): ComponentBlueprint {
  const normalizedSlots: Record<string, ComponentSlotDefinition> = {};

  for (const [slotKey, def] of Object.entries(slots)) {
    const role = (def.role || slotKey) as StandardSlotName;
    normalizedSlots[slotKey] = {
      name: def.name || slotKey,
      role,
      description: def.description || STANDARD_SLOT_DESCRIPTIONS[role] || "Component slot",
      required: def.required ?? false,
      acceptedComponents: def.acceptedComponents,
      defaultContent: def.defaultContent
    };
  }

  return {
    name,
    family,
    description,
    domElement,
    minBoundingBox,
    slots: normalizedSlots,
    states: {
      default: { state: "default", visualChanges: {} },
      hover: { state: "hover", visualChanges: {} },
      active: { state: "active", visualChanges: {} },
      "focus-visible": { state: "focus-visible", visualChanges: { outline: "2px solid var(--focus)" } },
      disabled: { state: "disabled", visualChanges: { opacity: 0.38 } }
    },
    variants: {},
    enforcedRules: []
  };
}
