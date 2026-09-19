import fs from "node:fs";
import path from "node:path";
import { evaluateCode, EvaluateOptions } from "./engine.js";
import { EvaluationResult, DiagnosticIssue } from "./types.js";

export interface AuditFileResult {
  file: string;
  relativeFile: string;
  evaluation: EvaluationResult;
}

export interface AuditRunSummary {
  runId: string;
  timestamp: string;
  targetPath: string;
  totalFilesScanned: number;
  compliantFilesCount: number;
  failedFilesCount: number;
  overallScore: number;
  certified: boolean;
  totalViolations: number;
  severityCounts: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  ruleBreakdown: Record<string, number>;
}

export interface AuditRunResult {
  summary: AuditRunSummary;
  fileResults: AuditFileResult[];
  reportMarkdown: string;
  runDir?: string;
}

export interface AuditDirectoryOptions extends EvaluateOptions {
  workspaceDir?: string;
  writeReport?: boolean;
  runId?: string;
  includeExtensions?: string[];
  excludeDirs?: string[];
  migrationsPath?: string;
}

/**
 * Recursively collects target source files for design system compliance auditing.
 */
export function discoverAuditFiles(
  dir: string,
  options: { includeExtensions?: string[]; excludeDirs?: string[] } = {}
): string[] {
  const exts = options.includeExtensions || [".tsx", ".jsx", ".vue", ".svelte", ".html", ".css"];
  const excludes = new Set(options.excludeDirs || [
    "node_modules",
    "dist",
    ".git",
    ".tds",
    ".next",
    "build",
    ".turbo",
    "coverage",
    ".agents"
  ]);

  const results: string[] = [];

  function walk(current: string) {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      const base = path.basename(current);
      if (excludes.has(base) || base.startsWith(".")) return;
      const entries = fs.readdirSync(current);
      for (const entry of entries) {
        walk(path.join(current, entry));
      }
    } else if (stat.isFile()) {
      const ext = path.extname(current).toLowerCase();
      if (exts.includes(ext)) {
        results.push(current);
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Checks code against deprecated tokens and components from migrations.json.
 */
export function checkDeprecations(
  code: string,
  migrations: Record<string, string> = {}
): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  const lines = code.split(/\r?\n/);

  lines.forEach((lineText, lineIdx) => {
    const lineNum = lineIdx + 1;
    for (const [deprecated, replacement] of Object.entries(migrations)) {
      if (lineText.includes(deprecated)) {
        issues.push({
          severity: "HIGH",
          code: "TDS-DEPRECATED-TOKEN",
          line: lineNum,
          message: `Deprecated token or API '${deprecated}' detected.`,
          remediation: `Replace with current design system token '${replacement}'.`,
        });
      }
    }
  });

  return issues;
}

/**
 * Generates an executive Markdown report for an audit run.
 */
export function generateAuditReportMarkdown(
  summary: AuditRunSummary,
  fileResults: AuditFileResult[]
): string {
  const failedFiles = fileResults.filter(f => !f.evaluation.certified);

  let md = `# Trainable DS Compliance Audit Report\n\n`;
  md += `**Run ID:** \`${summary.runId}\`  \n`;
  md += `**Timestamp:** ${summary.timestamp}  \n`;
  md += `**Target Path:** \`${summary.targetPath}\`  \n`;
  md += `**Overall Score:** **${summary.overallScore}/100** ${summary.certified ? "✅ (CERTIFIED)" : "❌ (FAILED)"}\n\n`;

  md += `## Executive Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Total Files Scanned** | ${summary.totalFilesScanned} |\n`;
  md += `| **Compliant Files** | ${summary.compliantFilesCount} |\n`;
  md += `| **Failed Files** | ${summary.failedFilesCount} |\n`;
  md += `| **Total Violations** | ${summary.totalViolations} |\n`;
  md += `| **Critical Violations** | ${summary.severityCounts.CRITICAL} |\n`;
  md += `| **High Severity Violations** | ${summary.severityCounts.HIGH} |\n`;
  md += `| **Medium/Low Violations** | ${summary.severityCounts.MEDIUM + summary.severityCounts.LOW} |\n\n`;

  if (Object.keys(summary.ruleBreakdown).length > 0) {
    md += `### Violation Breakdown by Rule\n\n`;
    md += `| Rule Code | Count |\n`;
    md += `| :--- | :--- |\n`;
    for (const [code, count] of Object.entries(summary.ruleBreakdown)) {
      md += `| \`${code}\` | ${count} |\n`;
    }
    md += `\n`;
  }

  if (failedFiles.length === 0) {
    md += `## File Findings\n\n`;
    md += `🎉 **No design system violations detected across all ${summary.totalFilesScanned} files!** All components and tokens comply with Material Design 3 and Trainable DS invariants.\n`;
  } else {
    md += `## File Findings (${failedFiles.length} files with violations)\n\n`;

    for (const res of failedFiles) {
      md += `### \`${res.relativeFile}\` (Score: ${res.evaluation.score}/100)\n\n`;
      md += `| Line | Severity | Code | Message | Remediation |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;

      for (const diag of res.evaluation.diagnostics) {
        md += `| ${diag.line} | **${diag.severity}** | \`${diag.code}\` | ${diag.message} | ${diag.remediation} |\n`;
      }
      md += `\n`;
    }

    md += `## Remediation Instructions for AI Agents\n\n`;
    md += `To repair the violations found above, prompt your AI coding assistant with:\n\n`;
    md += `\`\`\`text\n`;
    md += `Please repair the design system violations reported in .tds/audits/${summary.runId}/report.md. Follow the rules in .agents/skills/tds-knowledge/SKILL.md.\n`;
    md += `\`\`\`\n`;
  }

  return md;
}

/**
 * Runs a project or directory-wide design system compliance audit,
 * returning structured metrics and writing persistent reports in .tds/audits/<runId>/.
 */
export async function auditDirectory(
  targetPath: string,
  options: AuditDirectoryOptions = {}
): Promise<AuditRunResult> {
  const workspaceDir = options.workspaceDir || process.cwd();
  const resolvedTarget = path.isAbsolute(targetPath)
    ? targetPath
    : path.resolve(workspaceDir, targetPath);

  const runId = options.runId || `audit-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;
  const timestamp = new Date().toISOString();

  // Load migrations/deprecations index if available
  let migrations: Record<string, string> = {};
  const migrationsFile = options.migrationsPath || path.join(workspaceDir, ".design-system", "migrations.json");
  if (fs.existsSync(migrationsFile)) {
    try {
      migrations = JSON.parse(fs.readFileSync(migrationsFile, "utf-8"));
    } catch {
      // ignore
    }
  }

  // Discover files
  let targetFiles: string[] = [];
  if (fs.existsSync(resolvedTarget)) {
    const stat = fs.statSync(resolvedTarget);
    if (stat.isFile()) {
      targetFiles = [resolvedTarget];
    } else {
      targetFiles = discoverAuditFiles(resolvedTarget, {
        includeExtensions: options.includeExtensions,
        excludeDirs: options.excludeDirs,
      });
    }
  }

  const fileResults: AuditFileResult[] = [];
  let totalViolations = 0;
  let totalScore = 0;
  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const ruleBreakdown: Record<string, number> = {};

  for (const filePath of targetFiles) {
    const code = fs.readFileSync(filePath, "utf-8");
    const relativeFile = path.relative(workspaceDir, filePath);

    const baseEval = evaluateCode(code, {
      ...options,
      fileName: relativeFile,
    });

    // Check deprecations
    const deprecationIssues = checkDeprecations(code, migrations);
    const combinedDiagnostics = [...baseEval.diagnostics, ...deprecationIssues];

    // Recalculate score if deprecations exist
    let fileScore = baseEval.score;
    if (deprecationIssues.length > 0) {
      fileScore = Math.max(0, fileScore - deprecationIssues.length * 10);
    }
    const certified = combinedDiagnostics.length === 0;

    const evaluation: EvaluationResult = {
      certified,
      score: fileScore,
      summary: certified ? "Certified Compliant" : `Found ${combinedDiagnostics.length} violations`,
      diagnostics: combinedDiagnostics,
    };

    totalScore += fileScore;
    totalViolations += combinedDiagnostics.length;

    for (const diag of combinedDiagnostics) {
      severityCounts[diag.severity] = (severityCounts[diag.severity] || 0) + 1;
      ruleBreakdown[diag.code] = (ruleBreakdown[diag.code] || 0) + 1;
    }

    fileResults.push({
      file: filePath,
      relativeFile,
      evaluation,
    });
  }

  const compliantFilesCount = fileResults.filter(f => f.evaluation.certified).length;
  const failedFilesCount = fileResults.length - compliantFilesCount;
  const overallScore = targetFiles.length > 0 ? Math.round(totalScore / targetFiles.length) : 100;
  const certified = failedFilesCount === 0;

  const summary: AuditRunSummary = {
    runId,
    timestamp,
    targetPath,
    totalFilesScanned: targetFiles.length,
    compliantFilesCount,
    failedFilesCount,
    overallScore,
    certified,
    totalViolations,
    severityCounts,
    ruleBreakdown,
  };

  const reportMarkdown = generateAuditReportMarkdown(summary, fileResults);

  let runDir: string | undefined;

  if (options.writeReport !== false) {
    runDir = path.join(workspaceDir, ".tds", "audits", runId);
    fs.mkdirSync(runDir, { recursive: true });

    fs.writeFileSync(path.join(runDir, "summary.json"), JSON.stringify(summary, null, 2), "utf-8");
    fs.writeFileSync(path.join(runDir, "report.md"), reportMarkdown, "utf-8");
  }

  return {
    summary,
    fileResults,
    reportMarkdown,
    runDir,
  };
}
