import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { generateCursorRules, generateClaudeMdBlock, generateAntigravityRulesBlock } from "@trainable-ds/compiler";

export interface InitOptions {
  auto?: boolean;
  agent?: "cursor" | "antigravity" | "claude";
  remote?: string;
}

/**
 * Autonomous 1-prompt initializer (Astryx Parity)
 */
export async function runInit(options: InitOptions) {
  const cwd = process.cwd();
  console.log(pc.cyan("⚡ Initializing Trainable DS in:") + ` ${cwd}`);

  // 1. Create .design-system directory
  const dsDir = path.join(cwd, ".design-system");
  if (!fs.existsSync(dsDir)) {
    fs.mkdirSync(dsDir, { recursive: true });
    console.log(pc.green("✔ Created .design-system/ directory"));
  }

  // 2. Scaffold default tds.config.yaml
  const configPath = path.join(dsDir, "tds.config.yaml");
  if (!fs.existsSync(configPath)) {
    const defaultConfig = `name: "My Application Design System"
version: "1.0.0"
framework: "react-tailwind"
mode: "dual-scheme"
sourceDirs:
  - "./src"
docsDirs:
  - "./docs"
output:
  designMdPath: "./DESIGN.md"
  cursorRulesPath: "./.cursor/rules/design-system.mdc"
compliance:
  strictHexDisallowed: true
  minTouchTargetPx: 48
  requireSentenceCase: true
`;
    fs.writeFileSync(configPath, defaultConfig, "utf-8");
    console.log(pc.green("✔ Created .design-system/tds.config.yaml"));
  }

  // 3. Emit root DESIGN.md template if none exists
  const designMdPath = path.join(cwd, "DESIGN.md");
  if (!fs.existsSync(designMdPath)) {
    const defaultDesignMd = `---
schema: "trainable-ds/v1.7"
name: "My Application Design System"
version: "1.0.0"
mode: "dual-scheme"
framework: "react-tailwind"
tokens:
  system:
    color:
      light:
        primary: "#00639b"
        onPrimary: "#ffffff"
        primaryContainer: "#cde5ff"
        onPrimaryContainer: "#001d32"
        surface: "#fdfcff"
        surfaceContainer: "#f0f0f4"
---

# Design System: My Application Design System

## 1. Visual Philosophy & Semantic Intent ("The Why")
> **Design Thesis:** Functional clarity and high information density.
- Surfaces use subtle tonal containers to organize information.
- Primary action color is reserved strictly for interactive user focus.

## 2. Foundations Quick-Reference
- **Primary Action:** \`sys.color.primary\` (#00639b) paired with \`sys.color.on-primary\` (#ffffff).
- **Surface Container:** Default card container is \`surface-container\` (#f0f0f4).

## 3. Core Component Library
*Run \`npx tds train\` to extract existing components or import from your library.*

## 4. Executable Constraints (Evaluated by \`tds evaluate\`)
1. **NO RAW HEX CODES:** Map all colors to semantic tokens (\`sys.color.*\`).
2. **NO AD-HOC REINVENTIONS:** Always import certified components.
3. **SENTENCE CASE:** Button and tab labels MUST be sentence case.
4. **MINIMUM TOUCH TARGET:** Minimum 48x48px touch targets.
5. **STRICT USER COMMAND & SKETCH FIDELITY (ZERO FEATURE HALLUCINATION):** Follow user wireframes, sketches, and prompts strictly. NEVER hallucinate, assume, or inject unrequested features, action buttons, or widgets (e.g. heating, horn, walk, tire pressure) to fill space.
6. **INTENTIONAL WHITESPACE & PLACEHOLDER MANDATE:** If an area is marked as whitespace (e.g. "Whitespace (for now)") or left empty, DO NOT invent features. Either ask the user first if they want to add specific features, OR render an explicit visual placeholder indicating the area is intentionally left empty.
`;
    fs.writeFileSync(designMdPath, defaultDesignMd, "utf-8");
    console.log(pc.green("✔ Emitted root DESIGN.md"));
  }

  // 4. Auto-wire Agent Rules (.cursor/rules, .cursor/mcp.json, and CLAUDE.md)
  const cursorDir = path.join(cwd, ".cursor");
  const cursorRulesDir = path.join(cursorDir, "rules");
  if (!fs.existsSync(cursorRulesDir)) {
    fs.mkdirSync(cursorRulesDir, { recursive: true });
  }
  const cursorRuleFile = path.join(cursorRulesDir, "design-system.mdc");
  fs.writeFileSync(cursorRuleFile, generateCursorRules("My Application"), "utf-8");
  console.log(pc.green("✔ Configured Cursor rules (.cursor/rules/design-system.mdc)"));

  // .cursor/mcp.json auto-wire
  const cursorMcpFile = path.join(cursorDir, "mcp.json");
  let mcpConfig: { mcpServers: Record<string, unknown> } = { mcpServers: {} };
  if (fs.existsSync(cursorMcpFile)) {
    try {
      mcpConfig = JSON.parse(fs.readFileSync(cursorMcpFile, "utf-8"));
      mcpConfig.mcpServers = mcpConfig.mcpServers || {};
    } catch {
      mcpConfig = { mcpServers: {} };
    }
  }
  mcpConfig.mcpServers["trainable-ds"] = {
    command: "npx",
    args: ["-y", "@trainable-ds/cli", "mcp"],
  };
  fs.writeFileSync(cursorMcpFile, JSON.stringify(mcpConfig, null, 2), "utf-8");
  console.log(pc.green("✔ Configured Cursor MCP Server (.cursor/mcp.json)"));

  // CLAUDE.md injection
  const claudeMdPath = path.join(cwd, "CLAUDE.md");
  let claudeContent = "";
  if (fs.existsSync(claudeMdPath)) {
    claudeContent = fs.readFileSync(claudeMdPath, "utf-8");
  }
  if (!claudeContent.includes("TRAINABLE_DS_START")) {
    fs.appendFileSync(claudeMdPath, generateClaudeMdBlock("My Application"), "utf-8");
    console.log(pc.green("✔ Injected guidelines into CLAUDE.md"));
  }

  // Google Antigravity injection (AGENTS.md & GEMINI.md)
  const agentsMdPath = path.join(cwd, "AGENTS.md");
  let agentsContent = "";
  if (fs.existsSync(agentsMdPath)) {
    agentsContent = fs.readFileSync(agentsMdPath, "utf-8");
  }
  if (!agentsContent.includes("TRAINABLE_DS_START")) {
    fs.appendFileSync(agentsMdPath, generateAntigravityRulesBlock("My Application"), "utf-8");
    console.log(pc.green("✔ Injected guidelines into AGENTS.md (Antigravity)"));
  }

  // 5. If remote URL provided, log connection
  if (options.remote) {
    console.log(pc.blue(`🔗 Connecting to remote registry: ${options.remote}`));
  }

  console.log(pc.bold(pc.green("\n🎉 Trainable DS initialized successfully!")));
  console.log(pc.gray("Next step: Run `npx tds train` to extract tokens from your codebase, or start generating UI with your AI!"));
}
