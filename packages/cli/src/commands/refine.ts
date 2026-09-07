import * as fs from "node:fs/promises";
import * as path from "node:path";
import pc from "picocolors";
import { ConversationAdapter, FusionEngine, VCSStore } from "@trainable-ds/compiler";
import { DesignSystemSnapshot } from "@trainable-ds/core";

export interface RefineOptions {
  branch?: string;
  force?: boolean;
  dir?: string;
}

export async function runRefine(prompt: string, options: RefineOptions = {}): Promise<void> {
  const rootDir = path.resolve(options.dir || ".");
  const store = new VCSStore(rootDir);
  await store.init();

  const currentBranch = options.branch || await store.getCurrentBranch();
  if (options.branch && options.branch !== (await store.getCurrentBranch())) {
    await store.switchBranch(options.branch);
  }

  console.log(pc.cyan(`\n💬 Processing natural language refinement directive:`));
  console.log(pc.bold(`   "${prompt}"\n`));

  // Run Conversation Adapter
  const adapter = new ConversationAdapter();
  const ingestResult = await adapter.ingest(prompt);

  // Load existing snapshot
  let snapshot = await store.getHeadSnapshot(currentBranch);
  if (!snapshot) {
    let diskTokens = {};
    try {
      diskTokens = JSON.parse(await fs.readFile(path.join(rootDir, "tokens.json"), "utf-8"));
    } catch {
      // empty
    }
    snapshot = { tokens: diskTokens, components: {}, guidelines: "", fonts: {}, icons: [] };
  }

  // Fuse results
  const fusion = new FusionEngine();
  const fused = fusion.fuse(snapshot, [ingestResult], { force: options.force });

  // Commit changes
  const commit = await store.commit(
    `Refine: "${prompt.slice(0, 60)}"`,
    fused.snapshot,
    "user-refine"
  );

  // Sync tokens.json
  try {
    await fs.writeFile(
      path.join(rootDir, "tokens.json"),
      JSON.stringify(fused.snapshot.tokens, null, 2),
      "utf-8"
    );
  } catch {
    // VCS is authoritative
  }

  console.log(pc.green(`✓ Refinement applied to branch '${currentBranch}' (commit: ${commit.id})`));
  if (ingestResult.tokens.length > 0) {
    console.log(pc.bold("  Updated Tokens:"));
    ingestResult.tokens.forEach(t => {
      console.log(pc.dim(`   • ${t.path} → ${JSON.stringify(t.value)}`));
    });
  }
  if (ingestResult.components.length > 0) {
    console.log(pc.bold("  Updated Components:"));
    ingestResult.components.forEach(c => {
      console.log(pc.dim(`   • ${c.componentName}`));
    });
  }
}
