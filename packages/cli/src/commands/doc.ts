import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { generatePrototypeComponentLibrary } from "@trainable-ds/compiler";

export interface DocOptions {
  dir?: string;
  json?: boolean;
}

/**
 * JIT Component Documentation & Contract Retrieval (Astryx Parity)
 * Enables AI agents and engineers to query certified imports, prop contracts,
 * reviewer guidance notes, and ready-to-use snippets on demand.
 */
export async function runDoc(componentName?: string, options: DocOptions = {}) {
  const cwd = options.dir ? path.resolve(options.dir) : process.cwd();

  // 1. Locate components.json or fallback to generated defaults
  const candidateFiles = [
    path.join(cwd, "components.json"),
    path.join(cwd, ".design-system", "components.json"),
    path.join(cwd, "Test DS", "components.json"),
  ];

  let componentsFile: string | null = null;
  for (const f of candidateFiles) {
    if (fs.existsSync(f)) {
      componentsFile = f;
      break;
    }
  }

  let componentsManifest: Record<string, any> = {};
  if (componentsFile) {
    try {
      const parsed = JSON.parse(fs.readFileSync(componentsFile, "utf-8"));
      componentsManifest = parsed.components || parsed;
    } catch {
      // Fallback
    }
  }

  // Ensure default canonical components are available even if components.json is partial or missing
  const defaultLib = generatePrototypeComponentLibrary();
  for (const [name, meta] of Object.entries(defaultLib.manifest)) {
    if (!componentsManifest[name]) {
      componentsManifest[name] = meta;
    }
  }

  // If no component name provided, list available components
  if (!componentName) {
    if (options.json) {
      console.log(JSON.stringify(Object.values(componentsManifest), null, 2));
      return;
    }

    console.log(pc.bold("\n📦 Trainable DS — Certified Component Catalog (Astryx JIT Parity)"));
    console.log(pc.gray("═".repeat(65)));
    console.log(pc.gray("Usage: tds doc <ComponentName> [--json]\n"));

    for (const comp of Object.values(componentsManifest)) {
      const lockBadge = comp.locked ? pc.green("🔒 Locked") : pc.yellow("⚡ Prototype");
      const srcBadge = comp.authoritativeSource?.type === "authoritative-library"
        ? pc.cyan(`(Upstream: ${comp.authoritativeSource.packageName})`)
        : pc.gray(`(${comp.path || "components/ui/" + comp.name + ".tsx"})`);
      console.log(
        `  ${pc.bold(pc.white(comp.name.padEnd(16)))} ` +
        `${pc.magenta(comp.family.padEnd(14))} ` +
        `${lockBadge}  ${srcBadge}`
      );
    }
    console.log(pc.gray("\n" + "═".repeat(65)));
    return;
  }

  // Find target component (case-insensitive)
  const targetKey = Object.keys(componentsManifest).find(
    (k) => k.toLowerCase() === componentName.toLowerCase()
  );

  if (!targetKey) {
    console.error(pc.red(`\n✖ Component "${componentName}" not found in design system catalog.`));
    console.log(pc.yellow(`Available components: ${Object.keys(componentsManifest).join(", ")}\n`));
    process.exit(1);
  }

  const comp = componentsManifest[targetKey];

  // Also check if component source file exists on disk to get latest code
  const codePath = path.isAbsolute(comp.path || "")
    ? comp.path
    : path.join(cwd, comp.path || `components/ui/${comp.name}.tsx`);

  if (fs.existsSync(codePath)) {
    try {
      comp.code = fs.readFileSync(codePath, "utf-8");
    } catch {
      // Keep existing code in memory
    }
  }

  if (options.json) {
    console.log(JSON.stringify(comp, null, 2));
    return;
  }

  // Terminal JIT Documentation Formatting
  console.log(pc.bold(`\n📦 Component Contract: `) + pc.cyan(pc.bold(comp.name)));
  console.log(pc.gray("═".repeat(65)));

  console.log(
    `${pc.bold("Family:")}        ${pc.magenta(comp.family)}  |  ` +
    `${pc.bold("Status:")} ${comp.locked ? pc.green("🔒 Locked (Human Certified)") : pc.yellow("⚡ Extracted Prototype")}`
  );
  console.log(`${pc.bold("Description:")}   ${comp.description || "Certified M3 Component"}`);

  // Import Directive
  console.log(pc.bold("\n🚀 Import Directive:"));
  if (comp.authoritativeSource?.type === "authoritative-library") {
    console.log(
      pc.green(`  import { ${comp.authoritativeSource.exportName || comp.name} } from "${comp.authoritativeSource.packageName}";`)
    );
    console.log(pc.gray(`  (Bound to upstream certified package: ${comp.authoritativeSource.packageName})`));
  } else {
    console.log(pc.green(`  import { ${comp.name} } from "@/${comp.path || "components/ui/" + comp.name}";`));
  }

  // Human Reviewer Guidance & Notes
  if (comp.humanNotes) {
    console.log(pc.bold("\n📝 Reviewer Guidance & Agent Constraints:"));
    console.log(pc.cyan(`  ${comp.humanNotes}`));
  }

  // Touch Target & Anatomy
  const touchTarget = comp.anatomy?.container?.minTouchTarget || comp.a11y?.minTouchTarget || "48x48px";
  console.log(pc.bold("\n🎯 Anatomy & Accessibility:"));
  console.log(`  • Touch Target:     ${pc.green(touchTarget)} (A11y Compliant)`);
  if (comp.anatomy?.container?.shape) {
    console.log(`  • Corner Shape:     ${comp.anatomy.container.shape}`);
  }

  // Variants
  const variants = Object.keys(comp.variants || {});
  if (variants.length > 0) {
    console.log(pc.bold("\n🎨 Available Variants:"));
    console.log(`  ${variants.map((v) => pc.cyan(v)).join(", ")}`);
  }

  // Props Contract
  const props = comp.props || {};
  if (Object.keys(props).length > 0) {
    console.log(pc.bold("\n⚙️ Props Contract:"));
    for (const [pName, pMeta] of Object.entries<any>(props)) {
      const req = pMeta.required ? pc.red("(required)") : pc.gray("(optional)");
      const typeStr = pMeta.enum ? pMeta.enum.map((e: string) => `"${e}"`).join(" | ") : pMeta.type;
      console.log(`  • ${pc.bold(pName)}: ${pc.yellow(typeStr)} ${req}`);
      if (pMeta.description) {
        console.log(`    ${pc.gray(pMeta.description)}`);
      }
    }
  }

  // Ready-to-use TSX Snippet
  if (comp.examples && comp.examples.length > 0) {
    console.log(pc.bold("\n💡 Copy-Paste Example Snippet:"));
    console.log(pc.gray("```tsx"));
    console.log(comp.examples[0].trim());
    console.log(pc.gray("```"));
  }

  // Source File Location
  console.log(pc.bold("\n📄 Implementation File:"));
  console.log(pc.blue(`  ${codePath}`));
  console.log(pc.gray("═".repeat(65)) + "\n");
}
