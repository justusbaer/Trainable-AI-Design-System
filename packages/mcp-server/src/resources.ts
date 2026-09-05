import fs from "node:fs";
import path from "node:path";
import type { ResourceDefinition, ResourceContent } from "./types.js";

export const RESOURCES: ResourceDefinition[] = [
  {
    uri: "design-system://tokens",
    name: "Design System Tokens",
    description: "W3C DTCG 3-tier M3 tokens (Reference, System, Component) currently active in workspace",
    mimeType: "application/json",
  },
  {
    uri: "design-system://design-md",
    name: "Root DESIGN.md",
    description: "Machine & human readable design system facade with design thesis, token mapping, and constraints",
    mimeType: "text/markdown",
  },
  {
    uri: "design-system://components",
    name: "Component Catalog",
    description: "Manifest of canonical and local design system components across 6 functional families",
    mimeType: "application/json",
  },
];

export function readResource(uri: string, workspaceDir: string = process.cwd()): ResourceContent {
  switch (uri) {
    case "design-system://tokens": {
      const tokenPath = path.join(workspaceDir, ".design-system", "tokens.json");
      const content = fs.existsSync(tokenPath)
        ? fs.readFileSync(tokenPath, "utf-8")
        : JSON.stringify({ notice: "No custom tokens.json found, using canonical M3 tokens" }, null, 2);
      return {
        uri,
        mimeType: "application/json",
        text: content,
      };
    }

    case "design-system://design-md": {
      const mdPath = path.join(workspaceDir, "DESIGN.md");
      const content = fs.existsSync(mdPath)
        ? fs.readFileSync(mdPath, "utf-8")
        : "# DESIGN.md\nNo DESIGN.md found at root. Run `tds train` or `tds init` to generate.";
      return {
        uri,
        mimeType: "text/markdown",
        text: content,
      };
    }

    case "design-system://components": {
      const compPath = path.join(workspaceDir, ".design-system", "components.json");
      const content = fs.existsSync(compPath)
        ? fs.readFileSync(compPath, "utf-8")
        : JSON.stringify({ message: "Default canonical M3 components active" }, null, 2);
      return {
        uri,
        mimeType: "application/json",
        text: content,
      };
    }

    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}
