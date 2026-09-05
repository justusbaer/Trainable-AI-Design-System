import { z } from "zod";

/**
 * W3C Design Tokens Community Group (DTCG) base token schema
 * with Trainable DS human-in-the-loop extensions.
 */

export const TokenExtensionSchema = z.object({
  "tds:locked": z.boolean().optional().default(false),
  "tds:confidence": z.number().min(0).max(1).optional().default(1.0),
  "tds:occurrences": z.number().int().nonnegative().optional().default(1),
  "tds:inferredFrom": z.string().optional(),
}).passthrough();

export type TokenExtension = z.infer<typeof TokenExtensionSchema>;

export const DtcgTokenSchema = z.object({
  $value: z.union([z.string(), z.number(), z.record(z.unknown())]),
  $type: z.enum([
    "color",
    "dimension",
    "fontFamily",
    "fontWeight",
    "duration",
    "cubicBezier",
    "number",
    "shadow",
    "composite",
  ]),
  $description: z.string().optional(),
  $extensions: TokenExtensionSchema.optional(),
});

export type DtcgToken<T = string | number | Record<string, unknown>> = {
  $value: T;
  $type: z.infer<typeof DtcgTokenSchema>["$type"];
  $description?: string;
  $extensions?: TokenExtension;
};

/**
 * Helper to create a certified DTCG token
 */
export function createToken<T extends string | number | Record<string, unknown>>(
  value: T,
  type: z.infer<typeof DtcgTokenSchema>["$type"],
  description?: string,
  locked: boolean = false
): DtcgToken<T> {
  return {
    $value: value,
    $type: type,
    ...(description ? { $description: description } : {}),
    $extensions: {
      "tds:locked": locked,
      "tds:confidence": 1.0,
      "tds:occurrences": 1,
    },
  };
}
