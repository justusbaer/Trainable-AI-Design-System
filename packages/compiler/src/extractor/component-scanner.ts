import fs from "node:fs";
import path from "node:path";
import type {
  ComponentDefinition,
  ComponentManifest,
  M3ComponentFamily,
} from "@trainable-ds/core";

export function categorizeComponentFamily(name: string): M3ComponentFamily {
  const lower = name.toLowerCase();

  if (/(button|fab|action|cta|trigger)/i.test(lower)) {
    return "actions";
  }
  if (/(badge|progress|snackbar|toast|tooltip|alert|indicator|banner|status)/i.test(lower)) {
    return "communication";
  }
  if (/(card|dialog|modal|sheet|drawer|divider|list|accordion|panel|surface|box)/i.test(lower)) {
    return "containment";
  }
  if (/(nav|tab|bar|breadcrumb|pagination|menu|sidebar|rail|header|footer)/i.test(lower)) {
    return "navigation";
  }
  if (/(checkbox|radio|switch|toggle|chip|filter|slider|segment|picker)/i.test(lower)) {
    return "selection";
  }
  if (/(input|field|search|form|select|textarea|combobox)/i.test(lower)) {
    return "text-inputs";
  }

  return "containment";
}

export function extractComponentVariants(content: string): string[] {
  const variants: string[] = [];

  // Match: variant?: 'filled' | 'outlined' | 'elevated'
  const variantPropMatch = content.match(/variant\??:\s*([^;,\n}]+)/);
  if (variantPropMatch && variantPropMatch[1]) {
    const rawTokens = variantPropMatch[1].split("|").map((v) => v.trim().replace(/['"]/g, ""));
    for (const token of rawTokens) {
      if (token && !variants.includes(token) && token !== "string" && token !== "undefined") {
        variants.push(token);
      }
    }
  }

  // Match: const variantStyles = { filled: '...', outlined: '...' }
  const variantObjMatch = content.match(/variant(?:Styles)?\s*=\s*\{([^}]+)\}/);
  if (variantObjMatch && variantObjMatch[1]) {
    const keys = variantObjMatch[1].match(/([a-zA-Z0-9_-]+)\s*:/g);
    if (keys) {
      for (const k of keys) {
        const cleanKey = k.replace(":", "").trim();
        if (cleanKey && !variants.includes(cleanKey)) {
          variants.push(cleanKey);
        }
      }
    }
  }

  return variants.length > 0 ? variants : ["default"];
}

export function extractComponentProps(content: string): Record<string, { type: string; required: boolean }> {
  const props: Record<string, { type: string; required: boolean }> = {};

  // Find interface or type *Props
  const propsBlockMatch = content.match(/(?:interface|type)\s+[A-Za-z0-9]+Props[^={]*[={]([\s\S]*?)(?:^|\n)\s*}/m);
  if (propsBlockMatch && propsBlockMatch[1]) {
    const lines = propsBlockMatch[1].split("\n");
    for (const line of lines) {
      const match = line.trim().match(/^([a-zA-Z0-9_]+)(\?)?:\s*([^;,\n]+)/);
      if (match) {
        const propName = match[1];
        const isOptional = Boolean(match[2]);
        const propType = match[3].trim();
        props[propName] = {
          type: propType,
          required: !isOptional,
        };
      }
    }
  }

  return props;
}

export function scanComponentsInDir(dirPath: string, rootDir: string = dirPath): ComponentManifest {
  const manifest: ComponentManifest = {
    version: "1.7.0",
    lastUpdated: new Date().toISOString(),
    components: {},
  };

  if (!fs.existsSync(dirPath)) return manifest;

  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist") {
          traverse(fullPath);
        }
      } else if (/\.(tsx|jsx)$/i.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");

        // Find exported React functional components or consts
        const exportMatches = content.matchAll(/export\s+(?:const|function)\s+([A-Z][a-zA-Z0-9]+)/g);

        for (const match of exportMatches) {
          const compName = match[1];
          if (!compName) continue;

          const family = categorizeComponentFamily(compName);
          const variantsList = extractComponentVariants(content);
          const props = extractComponentProps(content);
          const relativePath = "./" + path.relative(rootDir, fullPath).replace(/\\/g, "/");

          const variantsRecord: Record<string, { elevation: number; description?: string }> = {};
          for (const v of variantsList) {
            variantsRecord[v] = { elevation: 0, description: `${v} variant` };
          }

          const has48pxTarget =
            content.includes("48px") ||
            content.includes("h-12") ||
            content.includes("min-h-[48px]") ||
            content.includes("py-3");

          const compDef: ComponentDefinition = {
            name: compName,
            path: relativePath,
            family,
            description: `Design system ${compName} component belonging to the ${family} family.`,
            anatomy: {
              container: {
                minTouchTarget: has48pxTarget ? "48px" : "48px (enforced)",
              },
            },
            variants: variantsRecord,
            props,
            a11y: {
              minTouchTarget: "48x48px",
              requiredAria: [],
              focusIndicator: "3px outline with 2px offset",
            },
            rules: [
              `Always use <${compName}> instead of raw HTML elements.`,
              `Ensure touch target is at least 48x48px.`,
              `Use semantic M3 colors for background and text contrast pairing.`,
            ],
            examples: [
              `<${compName} variant="${variantsList[0] || "filled"}">\n  Action text\n</${compName}>`,
            ],
          };

          manifest.components[compName] = compDef;
        }
      }
    }
  }

  traverse(dirPath);
  return manifest;
}
