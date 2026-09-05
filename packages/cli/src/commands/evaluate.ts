import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { evaluateCode, EvaluationResult } from "@trainable-ds/evaluator";

export interface EvaluateCliOptions {
  json?: boolean;
  strict?: boolean;
}

/**
 * Runs closed-loop compliance evaluation on a target file
 */
export async function runEvaluate(targetPath: string, options: EvaluateCliOptions) {
  const resolvedPath = path.resolve(process.cwd(), targetPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(pc.red(`Error: File not found at '${targetPath}'`));
    process.exit(1);
  }

  const code = fs.readFileSync(resolvedPath, "utf-8");
  const result: EvaluationResult = evaluateCode(code, {
    fileName: targetPath,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    if (!result.certified && options.strict) {
      process.exit(1);
    }
    return;
  }

  // Terminal Human-Formatted Output
  console.log(pc.bold(`\n📋 Trainable DS Compliance Audit: `) + pc.cyan(targetPath));
  console.log(pc.gray("═".repeat(60)));

  if (result.certified) {
    console.log(pc.bold(pc.green(`✔ CERTIFIED COMPLIANT (Score: 100/100)`)));
    console.log(pc.green("No design system violations detected. Ready for production!\n"));
    return;
  }

  console.log(pc.bold(pc.red(`✖ COMPLIANCE FAILED (Score: ${result.score}/100)`)));
  console.log(pc.yellow(`Found ${result.diagnostics.length} violation(s):\n`));

  result.diagnostics.forEach((diag, idx) => {
    const sevColor = diag.severity === "CRITICAL" ? pc.bgRed(pc.white(` ${diag.severity} `))
      : diag.severity === "HIGH" ? pc.red(`[${diag.severity}]`)
      : pc.yellow(`[${diag.severity}]`);

    console.log(`${idx + 1}. ${sevColor} ${pc.bold(diag.code)} at Line ${pc.bold(diag.line.toString())}`);
    console.log(`   ${pc.white(diag.message)}`);
    console.log(`   ${pc.cyan("Fix:")} ${diag.remediation}\n`);
  });

  console.log(pc.gray("═".repeat(60)));
  console.log(pc.gray("Tip: Ask your AI assistant to fix these diagnostics until certification passes at 100%.\n"));

  if (options.strict) {
    process.exit(1);
  }
}
