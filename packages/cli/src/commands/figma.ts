import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { formatDtcgForFigma } from "@trainable-ds/compiler";

export interface FigmaPushOptions {
  fileKey?: string;
  token?: string;
  dryRun?: boolean;
}

export async function runFigmaPush(options: FigmaPushOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const tokensPath = path.join(cwd, ".design-system", "tokens.json");

  if (!fs.existsSync(tokensPath)) {
    console.error(pc.red("✖ No .design-system/tokens.json found. Run `tds train` first."));
    process.exit(1);
  }

  console.log(pc.cyan("🎨 Exporting W3C DTCG tokens to Figma Variables..."));

  const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf-8"));
  const figmaPayload = formatDtcgForFigma(tokens);

  const outputPath = path.join(cwd, ".design-system", "figma-variables.json");
  fs.writeFileSync(outputPath, JSON.stringify(figmaPayload, null, 2), "utf-8");
  console.log(pc.green(`✔ Wrote Figma payload to: `) + pc.bold(".design-system/figma-variables.json"));
  console.log(pc.gray(`  - Collections: ${figmaPayload.variableCollections.length}`));
  console.log(pc.gray(`  - Modes: ${figmaPayload.variableModes.length + 1} (Light + Dark)`));
  console.log(pc.gray(`  - Variables: ${figmaPayload.variables.length}`));
  console.log(pc.gray(`  - Mode Values: ${figmaPayload.variableModeValues.length}`));

  const figmaToken = options.token || process.env.FIGMA_ACCESS_TOKEN;
  const fileKey = options.fileKey;

  if (options.dryRun || !fileKey || !figmaToken) {
    if (!fileKey || !figmaToken) {
      console.log(pc.yellow("\n💡 To push directly to Figma:"));
      console.log(pc.gray("   tds figma push --file-key <KEY> --token <FIGMA_TOKEN>"));
      console.log(pc.gray("   or set FIGMA_ACCESS_TOKEN in your environment."));
    } else {
      console.log(pc.blue("\n✔ Dry run complete. No network changes made to Figma."));
    }
    return;
  }

  console.log(pc.blue(`\n🚀 Pushing variables to Figma file: ${fileKey}...`));
  try {
    const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables`, {
      method: "POST",
      headers: {
        "X-Figma-Token": figmaToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(figmaPayload),
    });

    if (res.ok) {
      console.log(pc.green("✔ Successfully synchronized variables with Figma!"));
    } else {
      const errText = await res.text();
      console.error(pc.red(`✖ Figma API error (${res.status}): ${errText}`));
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(pc.red(`✖ Failed to connect to Figma API: ${msg}`));
  }
}
