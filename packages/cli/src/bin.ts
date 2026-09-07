#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runTrain } from "./commands/train.js";
import { runEvaluate } from "./commands/evaluate.js";

const program = new Command();

program
  .name("tds")
  .description("Trainable DS: Agent-Native Design System Engine with Material Design 3 Fidelity")
  .version("1.7.0");

program
  .command("init")
  .description("Autonomous zero-friction onboarding (Astryx parity)")
  .option("--auto", "Automatically detect agent and configure settings", true)
  .option("--agent <type>", "Target agent (cursor, antigravity, claude)")
  .option("--remote <url>", "Remote Firebase registry URL")
  .action(async (options) => {
    await runInit(options);
  });

program
  .command("train")
  .description("Derive and extract design system at M3 fidelity from code, docs, or a live website")
  .option("--src <path>", "Source code directory to scan", "./src")
  .option("--docs <path>", "Documentation directory", "./docs")
  .option("--url <url>", "Train directly on a live website with multi-page discovery and asset extraction")
  .option("--pages <list>", "Comma-separated list of approved subpage URLs to crawl")
  .option("--align <url>", "Immediately run visual alignment loops against source URL")
  .option("--max-loops <n>", "Maximum alignment refinement loops (default: 3)", "3")
  .option("--threshold <pct>", "Target convergence percentage threshold (default: 95)", "95")
  .action(async (options) => {
    await runTrain(options);
  });

program
  .command("align")
  .description("Multi-loop visual alignment engine against live source website")
  .requiredOption("--url <url>", "Source of truth website or application URL")
  .option("--template <path>", "Local HTML template or component testbed")
  .option("--max-loops <n>", "Maximum refinement loops (default: 3)", "3")
  .option("--threshold <pct>", "Convergence score percentage threshold (default: 95)", "95")
  .option("--dir <path>", "Target design system directory", ".")
  .action(async (options) => {
    const { runAlign } = await import("./commands/align.js");
    await runAlign(options);
  });

program
  .command("evaluate <file>")
  .description("Run 4-tier closed-loop compliance evaluation on code")
  .option("--json", "Emit structured machine-actionable JSON output", false)
  .option("--strict", "Exit with error code 1 if violations found", false)
  .action(async (file, options) => {
    await runEvaluate(file, options);
  });

program
  .command("mcp")
  .description("Start Model Context Protocol (MCP) server for AI pair programming")
  .option("--stdio", "Use stdio transport (default)", true)
  .option("--port <port>", "Port for HTTP/SSE transport")
  .option("--sse", "Use Server-Sent Events (SSE) transport")
  .option("--dir <path>", "Workspace directory")
  .action(async (options) => {
    const { runMcp } = await import("./commands/mcp.js");
    await runMcp(options);
  });

const figmaCmd = program
  .command("figma")
  .description("Figma integrations and variable synchronization");

figmaCmd
  .command("push")
  .description("Export and synchronize W3C DTCG tokens with Figma Variables")
  .option("--file-key <key>", "Figma file key")
  .option("--token <token>", "Figma personal access token")
  .option("--dry-run", "Export variables payload without network call", false)
  .action(async (options) => {
    const { runFigmaPush } = await import("./commands/figma.js");
    await runFigmaPush(options);
  });

program
  .command("serve")
  .description("Launch the Trainable DS Source of Truth Web Portal for humans and AI agents")
  .option("--port <port>", "Port to listen on (default: 5000)", "5000")
  .option("--dir <path>", "Workspace directory")
  .action(async (options) => {
    const { runServe } = await import("./commands/serve.js");
    await runServe(options);
  });

program
  .command("doc [component]")
  .description("Query certified component contracts, authoritative source, props, and ready-to-use TSX snippets for AI agents (Astryx JIT parity)")
  .option("--dir <path>", "Design system directory")
  .option("--json", "Emit structured JSON output", false)
  .action(async (component, options) => {
    const { runDoc } = await import("./commands/doc.js");
    await runDoc(component, options);
  });

program
  .command("ingest")
  .description("Ingest tokens and guidelines from diverse multi-modal sources (CSV, tokens JSON, markdown docs, screenshots/SVGs)")
  .option("-f, --file <path>", "File path to ingest")
  .option("-t, --type <type>", "Ingestion type (table, document, vision, conversation, auto)")
  .option("-b, --branch <name>", "Target branch")
  .option("--force", "Overwrite locked tokens")
  .option("--dir <path>", "Design system directory")
  .action(async (options) => {
    const { runIngest } = await import("./commands/ingest.js");
    await runIngest(options);
  });

program
  .command("refine <prompt>")
  .description("Conversational refinement of design tokens, components, and rules using natural language directives")
  .option("-b, --branch <name>", "Target branch")
  .option("--force", "Overwrite locked tokens")
  .option("--dir <path>", "Design system directory")
  .action(async (prompt, options) => {
    const { runRefine } = await import("./commands/refine.js");
    await runRefine(prompt, options);
  });

const branchCmd = program
  .command("branch")
  .description("Manage Trainable DS version branches and commits");

branchCmd
  .command("list", { isDefault: true })
  .description("List all local design system branches")
  .option("--dir <path>", "Design system directory")
  .action(async (options) => {
    const { runBranchList } = await import("./commands/branch.js");
    await runBranchList(options);
  });

branchCmd
  .command("create <name>")
  .description("Create a new design system branch")
  .option("--from <branch>", "Source branch to branch from")
  .option("--dir <path>", "Design system directory")
  .action(async (name, options) => {
    const { runBranchCreate } = await import("./commands/branch.js");
    await runBranchCreate(name, options);
  });

branchCmd
  .command("switch <name>")
  .description("Switch the active design system branch")
  .option("--dir <path>", "Design system directory")
  .action(async (name, options) => {
    const { runBranchSwitch } = await import("./commands/branch.js");
    await runBranchSwitch(name, options);
  });

branchCmd
  .command("diff <source>")
  .description("Show token and component diffs between branches")
  .option("--target <branch>", "Target branch to compare against")
  .option("--dir <path>", "Design system directory")
  .action(async (source, options) => {
    const { runBranchDiff } = await import("./commands/branch.js");
    await runBranchDiff(source, options);
  });

program
  .command("merge <source>")
  .description("AST-aware 3-way semantic merge with automated accessibility evaluation gatekeeper")
  .option("-t, --target <branch>", "Target branch to merge into (default: current HEAD)")
  .option("--skip-gates", "Bypass WCAG AA contrast and touch-target merge gatekeeper")
  .option("--dir <path>", "Design system directory")
  .action(async (source, options) => {
    const { runMerge } = await import("./commands/merge.js");
    await runMerge(source, options);
  });

program.parse();

