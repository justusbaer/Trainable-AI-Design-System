import path from "node:path";
import pc from "picocolors";
import { auditDirectory, AuditRunResult } from "@trainable-ds/evaluator";

export interface AuditCliOptions {
  json?: boolean;
  strict?: boolean;
  report?: boolean;
  dir?: string;
  runId?: string;
}

/**
 * Runs a project or directory-level design system compliance audit.
 */
export async function runAudit(targetPath: string = ".", options: AuditCliOptions = {}) {
  const workspaceDir = options.dir || process.cwd();
  const resolvedTarget = path.resolve(workspaceDir, targetPath);

  const writeReport = options.report !== false;

  const result: AuditRunResult = await auditDirectory(resolvedTarget, {
    workspaceDir,
    writeReport,
    runId: options.runId,
  });

  const { summary } = result;

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    if (!summary.certified && options.strict) {
      process.exit(1);
    }
    return;
  }

  // Styled Terminal Output
  console.log(pc.bold(`\n🔍 Trainable DS Project Compliance Audit`));
  console.log(pc.gray("═".repeat(65)));
  console.log(`${pc.bold("Target:")}       ${pc.cyan(targetPath)}`);
  console.log(`${pc.bold("Run ID:")}       ${pc.gray(summary.runId)}`);
  console.log(`${pc.bold("Files Scanned:")} ${summary.totalFilesScanned}`);
  console.log(`${pc.bold("Compliant:")}     ${pc.green(summary.compliantFilesCount.toString())}`);
  console.log(`${pc.bold("Failed:")}        ${summary.failedFilesCount > 0 ? pc.red(summary.failedFilesCount.toString()) : pc.gray("0")}`);
  console.log(pc.gray("─".repeat(65)));

  if (summary.certified) {
    console.log(pc.bold(pc.green(`✔ CERTIFIED COMPLIANT (Score: 100/100)`)));
    console.log(pc.green("All scanned files strictly adhere to Material Design 3 and Trainable DS invariants.\n"));
  } else {
    console.log(pc.bold(pc.red(`✖ AUDIT FAILED (Score: ${summary.overallScore}/100)`)));
    console.log(pc.yellow(`Found ${summary.totalViolations} violation(s) across ${summary.failedFilesCount} file(s):\n`));

    // Show severity summary
    console.log(`  ${pc.red(`• Critical:`)} ${summary.severityCounts.CRITICAL}`);
    console.log(`  ${pc.yellow(`• High:`)}     ${summary.severityCounts.HIGH}`);
    console.log(`  ${pc.gray(`• Other:`)}    ${summary.severityCounts.MEDIUM + summary.severityCounts.LOW}\n`);

    // Preview top 5 failed files
    const failedFiles = result.fileResults.filter(f => !f.evaluation.certified).slice(0, 5);
    for (const fileRes of failedFiles) {
      console.log(`  ${pc.bold(pc.white(fileRes.relativeFile))} ${pc.gray(`(Score: ${fileRes.evaluation.score}/100)`)}`);
      fileRes.evaluation.diagnostics.slice(0, 3).forEach(diag => {
        const sev = diag.severity === "CRITICAL" ? pc.red(`[${diag.severity}]`) : pc.yellow(`[${diag.severity}]`);
        console.log(`    ${sev} Line ${diag.line}: ${diag.message}`);
      });
      if (fileRes.evaluation.diagnostics.length > 3) {
        console.log(`    ${pc.gray(`...and ${fileRes.evaluation.diagnostics.length - 3} more violation(s)`)}`);
      }
      console.log();
    }
  }

  if (result.runDir) {
    console.log(pc.gray("═".repeat(65)));
    console.log(pc.bold("📄 Audit Artifacts:"));
    console.log(`  • Markdown Report: ${pc.cyan(path.join(result.runDir, "report.md"))}`);
    console.log(`  • JSON Summary:    ${pc.cyan(path.join(result.runDir, "summary.json"))}`);
    console.log(pc.gray("\nTip: Prompt your AI assistant with the report to automatically repair issues:"));
    console.log(pc.italic(pc.gray(`     "Repair design system violations according to .tds/audits/${summary.runId}/report.md"\n`)));
  }

  if (!summary.certified && options.strict) {
    process.exit(1);
  }
}
