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
  .description("Derive and extract design system at M3 fidelity from code & docs")
  .option("--src <path>", "Source code directory to scan", "./src")
  .option("--docs <path>", "Documentation directory", "./docs")
  .action(async (options) => {
    await runTrain(options);
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

program.parse();

