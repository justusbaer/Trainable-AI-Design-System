import type { PromptDefinition, PromptMessage } from "./types.js";

export const PROMPTS: PromptDefinition[] = [
  {
    name: "generate_m3_ui",
    description: "Generate a UI component strictly compliant with Material Design 3 and Trainable DS constraints",
    arguments: [
      {
        name: "component",
        description: "The type of component to generate (e.g. NavigationDrawer, UserCard, PricingTable)",
        required: true,
      },
      {
        name: "intent",
        description: "What the component does and its functional requirements",
        required: false,
      },
    ],
  },
  {
    name: "audit_and_repair",
    description: "Audit a piece of UI code against the design system and produce the 100% compliant repaired version",
    arguments: [
      {
        name: "code",
        description: "The non-compliant code to audit and repair",
        required: true,
      },
    ],
  },
];

export function getPromptMessages(
  name: string,
  args: Record<string, string> = {}
): PromptMessage[] {
  switch (name) {
    case "generate_m3_ui": {
      const comp = args.component || "Component";
      const intent = args.intent || "General purpose UI element";

      return [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are generating the component "${comp}" (${intent}).
You MUST strictly obey the Trainable DS and Material Design 3 specification:
1. Zero raw hex codes. Use semantic tokens (bg-surface-container-low, text-on-surface, bg-primary, text-on-primary).
2. Spacing: Multiples of 4px/8px quantum grid only (p-2, p-4, p-6, gap-4).
3. Minimum touch target: All clickable/interactive elements must be >= 48x48px (min-h-[48px] min-w-[48px]).
4. Bi-directional RTL logical properties: Use ps-*/pe-* and ms-*/me-* instead of pl/pr/ml/mr.
5. All buttons and labels must use sentence-case ('Save changes', 'Submit inquiry').
6. Reuse existing canonical components instead of inventing raw HTML equivalents.

Now generate the complete, production-ready TSX code.`,
          },
        },
      ];
    }

    case "audit_and_repair": {
      const code = args.code || "";
      return [
        {
          role: "user",
          content: {
            type: "text",
            text: `Audit the following code against Trainable DS compliance rules and produce the repaired, 100% compliant version:

\`\`\`tsx
${code}
\`\`\`

Ensure you fix:
- Any raw hex or arbitrary styles.
- Any non-quantum spacing (e.g. p-[13px]).
- Any physical directional properties (e.g. ml-4 -> ms-4).
- Any touch target < 48px.
- Any title-cased labels -> sentence-case.
Return the corrected code snippet and explain the changes.`,
          },
        },
      ];
    }

    default:
      throw new Error(`Prompt not found: ${name}`);
  }
}
