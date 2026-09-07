import { describe, it, expect } from "vitest";
import { TableAdapter } from "./table-adapter.js";
import { DocumentAdapter } from "./document-adapter.js";
import { VisionAdapter } from "./vision-adapter.js";
import { ConversationAdapter } from "./conversation-adapter.js";
import { FusionEngine } from "./fusion.js";
import { DesignSystemSnapshot } from "@trainable-ds/core";

describe("Universal Multi-Modal Ingestion Adapters", () => {
  it("TableAdapter parses CSV tokens and Tokens Studio JSON correctly", async () => {
    const adapter = new TableAdapter();

    // CSV test
    const csvData = `token,value,type,description
color.brand.primary,#0055ff,color,Primary brand blue
spacing.base,8px,dimension,Base grid spacing
`;
    const csvResult = await adapter.ingest(csvData);
    expect(csvResult.tokens.length).toBe(2);
    expect(csvResult.tokens[0].path).toBe("color.brand.primary");
    expect(csvResult.tokens[0].value).toBe("#0055ff");
    expect(csvResult.tokens[1].value).toBe(8);

    // Tokens Studio JSON test
    const jsonData = {
      global: {
        primary: {
          value: "#0066cc",
          type: "color",
          description: "Studio primary"
        }
      }
    };
    const jsonResult = await adapter.ingest(jsonData);
    expect(jsonResult.tokens.length).toBe(1);
    expect(jsonResult.tokens[0].path).toBe("global.primary");
    expect(jsonResult.tokens[0].value).toBe("#0066cc");
  });

  it("DocumentAdapter parses markdown brand guidelines and DOs/DONTs", async () => {
    const adapter = new DocumentAdapter();
    const markdown = `# Brand Guidelines

Font Family: 'Inter', sans-serif
Grid: 8px
Border-radius: 8px

Primary: #00458C
Secondary: #FFB800

✅ DO: Use primary button for main call to action
❌ DON'T: Never use red for positive confirmation
Rule: Minimum contrast ratio 4.5:1

## Button
- Touch target: 48px
- Must be accessible
\`\`\`tsx
<Button>Click</Button>
\`\`\`
`;
    const result = await adapter.ingest(markdown);
    expect(result.tokens.some(t => t.path === "typography.fontFamily.base")).toBe(true);
    expect(result.tokens.some(t => t.path === "color.primary" && t.value === "#00458C")).toBe(true);
    expect(result.guidelines.length).toBe(3);
    expect(result.guidelines.some(g => g.severity === "CRITICAL")).toBe(true);
    expect(result.components.length).toBe(1);
    expect(result.components[0].componentName).toBe("Button");
    expect(result.components[0].props?.minHeight).toBe(48);
  });

  it("VisionAdapter clusters dominant colors and snaps spatial quantum", async () => {
    const adapter = new VisionAdapter();
    const result = await adapter.ingest({
      colors: ["#ffffff", "#0055ff", "#000000", "#f8f9fa"],
      dimensions: [{ width: 16, height: 48 }, { width: 32, height: 24 }],
      detectedShapes: [{ type: "rect", cornerRadius: 12 }]
    });

    expect(result.tokens.some(t => t.path === "sys.color.primary" && t.value === "#0055ff")).toBe(true);
    expect(result.tokens.some(t => t.path === "sys.color.onPrimary" && t.value === "#ffffff")).toBe(true);
    expect(result.tokens.some(t => t.path === "sys.spacing.quantum" && t.value === 8)).toBe(true);
    expect(result.tokens.some(t => t.path === "sys.shape.corner.base" && t.value === 12)).toBe(true);
  });

  it("ConversationAdapter compiles natural language prompt into exact patches", async () => {
    const adapter = new ConversationAdapter();
    const result = await adapter.ingest("Change primary color to #002b66, increase card radius to 16px, and make Button height at least 48px");

    expect(result.tokens.some(t => t.path === "sys.color.primary" && t.value === "#002b66")).toBe(true);
    expect(result.tokens.some(t => t.path === "sys.color.onPrimary")).toBe(true);
    expect(result.tokens.some(t => t.path === "comp.card.corner.radius" && t.value === 16)).toBe(true);
    expect(result.components.some(c => c.componentName === "Button" && c.props?.minHeight === 48)).toBe(true);
  });

  it("FusionEngine respects source precedence and lock protection", async () => {
    const tableAdapter = new TableAdapter();
    const convAdapter = new ConversationAdapter();
    const fusion = new FusionEngine();

    const baseSnapshot: DesignSystemSnapshot = {
      tokens: {
        sys: {
          color: {
            primary: { value: "#111111" }
          }
        },
        _meta: {
          locks: { "sys.color.primary": true },
          provenance: {}
        }
      },
      components: {}
    };

    const tableResult = await tableAdapter.ingest(`token,value\nsys.color.primary,#222222`);
    const fused = fusion.fuse(baseSnapshot, [tableResult]);

    // Primary is locked, so tableResult should have been skipped!
    expect(fused.skippedLockedTokensCount).toBe(1);
    expect(fused.snapshot.tokens.sys.color.primary.value).toBe("#111111");

    // Force override or unlocking
    const convResult = await convAdapter.ingest("Change primary color to #333333");
    const fusedForce = fusion.fuse(baseSnapshot, [convResult], { force: true });
    expect(fusedForce.snapshot.tokens.sys.color.primary.value).toBe("#333333");
  });
});
