import path from "node:path";
import pc from "picocolors";
import { runVisualAlignmentLoop, VisualLoopResult } from "@trainable-ds/compiler";

export interface AlignOptions {
  url: string;
  template?: string;
  maxLoops?: number;
  threshold?: number;
  dir?: string;
}

export async function runAlign(options: AlignOptions): Promise<VisualLoopResult> {
  const url = options.url;
  if (!url) {
    console.error(pc.red("✖ Error: --url <source_url> is required for visual alignment."));
    process.exit(1);
  }

  const dsDir = path.resolve(process.cwd(), options.dir || ".");
  const maxLoops = options.maxLoops ? Number(options.maxLoops) : 3;
  const threshold = options.threshold ? Number(options.threshold) : 95;

  console.log(pc.cyan("\n🔄 Starting Visual Alignment Loop Engine (Multi-Loop Convergence)"));
  console.log(pc.gray("---------------------------------------------------------------"));
  console.log(`${pc.bold("Source of Truth URL:")} ${pc.underline(url)}`);
  if (options.template) {
    console.log(`${pc.bold("Testbed Template:")}    ${path.resolve(options.template)}`);
  }
  console.log(`${pc.bold("Target Directory:")}    ${dsDir}`);
  console.log(`${pc.bold("Convergence Target:")}  ${threshold}% (Max ${maxLoops} loops)\n`);

  const result = await runVisualAlignmentLoop({
    sourceUrl: url,
    templatePath: options.template,
    maxLoops,
    threshold,
    dsDirectory: dsDir,
    onProgress: (loop, report, patches) => {
      const scoreColor = report.score >= 90 ? pc.green : report.score >= 70 ? pc.yellow : pc.red;
      console.log(
        `${pc.bold(`[Loop ${loop}/${maxLoops}]`)} Score: ${scoreColor(`${report.score}/100`)} ${
          report.isConverged ? pc.green("✔ CONVERGED") : pc.yellow("⚡ Drift Detected")
        }`
      );

      console.log(
        `  Category Scores: ` +
        `Geom: ${report.categoryScores.geometry}% | ` +
        `Color: ${report.categoryScores.color}% | ` +
        `Typo: ${report.categoryScores.typography}% | ` +
        `Mat: ${report.categoryScores.material}%`
      );

      if (report.discrepancies.length > 0) {
        console.log(pc.gray("  Top Discrepancies:"));
        report.discrepancies.slice(0, 4).forEach(d => {
          const sevColor = d.severity === "high" ? pc.red : pc.yellow;
          console.log(`    ${sevColor(`• [${d.category.toUpperCase()}]`)} ${pc.bold(d.componentRole)} ${d.property}: ` +
            `${pc.strikethrough(String(d.currentValue))} ➔ ${pc.green(String(d.observedValue))}`);
        });
      }

      if (patches.length > 0) {
        console.log(pc.gray("  Applied Patches:"));
        patches.slice(0, 3).forEach(p => {
          console.log(`    ${pc.green("✔")} ${p}`);
        });
        if (patches.length > 3) {
          console.log(pc.gray(`    ... and ${patches.length - 3} more patches`));
        }
      }
      console.log("");
    }
  });

  console.log(pc.gray("---------------------------------------------------------------"));
  if (result.isConverged) {
    console.log(pc.bold(pc.green(`🎉 Visual Convergence Achieved at ${result.finalScore}% in ${result.loopsCompleted} loop(s)!`)));
  } else {
    console.log(
      pc.bold(
        pc.yellow(
          `⚠️ Alignment completed ${result.loopsCompleted} loop(s). Initial: ${result.initialScore}% ➔ Final: ${result.finalScore}% (Target: ${threshold}%)`
        )
      )
    );
  }

  console.log(
    pc.cyan(
      `✔ Patched ${result.totalPatchesApplied.length} token/contract discrepancies in tokens.json, components.json, and DESIGN.md.\n`
    )
  );

  return result;
}
