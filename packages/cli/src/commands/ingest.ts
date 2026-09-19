import * as fs from "node:fs/promises";
import * as path from "node:path";
import pc from "picocolors";
import { 
  TableAdapter, 
  DocumentAdapter, 
  VisionAdapter, 
  ConversationAdapter, 
  FusionEngine, 
  VCSStore,
  emitAgentSkills 
} from "@trainable-ds/compiler";
import { IngestSourceType, DesignSystemSnapshot } from "@trainable-ds/core";

export interface IngestOptions {
  file?: string;
  type?: IngestSourceType | "auto";
  branch?: string;
  force?: boolean;
  dir?: string;
  content?: string;
}

export async function runIngest(options: IngestOptions): Promise<void> {
  const rootDir = path.resolve(options.dir || ".");
  const store = new VCSStore(rootDir);
  await store.init();

  const currentBranch = options.branch || await store.getCurrentBranch();
  if (options.branch && options.branch !== (await store.getCurrentBranch())) {
    await store.switchBranch(options.branch);
  }

  let rawContent: string = options.content || "";
  let detectedType: IngestSourceType = "document";
  let fileName = "input-data";

  if (options.file) {
    const filePath = path.resolve(rootDir, options.file);
    try {
      rawContent = await fs.readFile(filePath, "utf-8");
      fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();

      if (ext === ".csv" || ext === ".tsv" || (ext === ".json" && !fileName.includes("package"))) {
        detectedType = "table";
      } else if (ext === ".md" || ext === ".txt" || ext === ".html") {
        detectedType = "document";
      } else if (ext === ".svg" || ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
        detectedType = "vision";
      }
    } catch (err: any) {
      console.error(pc.red(`Failed to read file '${options.file}': ${err.message}`));
      process.exit(1);
    }
  }

  const sourceType = options.type && options.type !== "auto" ? options.type : detectedType;

  console.log(pc.cyan(`\n📥 Ingesting multi-modal design source [${sourceType.toUpperCase()}]: ${fileName} (branch: ${currentBranch})...`));

  let ingestResult;
  if (sourceType === "table") {
    const adapter = new TableAdapter();
    ingestResult = await adapter.ingest({ content: rawContent, sourceName: fileName });
  } else if (sourceType === "vision") {
    const adapter = new VisionAdapter();
    ingestResult = await adapter.ingest(rawContent);
  } else if (sourceType === "conversation") {
    const adapter = new ConversationAdapter();
    ingestResult = await adapter.ingest(rawContent);
  } else {
    const adapter = new DocumentAdapter();
    ingestResult = await adapter.ingest({ content: rawContent, documentTitle: fileName, sourceUri: options.file });
  }

  // Load existing snapshot from VCS
  let snapshot = await store.getHeadSnapshot(currentBranch);
  if (!snapshot) {
    // Check if tokens.json exists in rootDir
    let diskTokens = {};
    try {
      diskTokens = JSON.parse(await fs.readFile(path.join(rootDir, "tokens.json"), "utf-8"));
    } catch {
      // none
    }
    snapshot = { tokens: diskTokens, components: {}, guidelines: "", fonts: {}, icons: [] };
  }

  // Fuse results
  const fusion = new FusionEngine();
  const fused = fusion.fuse(snapshot, [ingestResult], { force: options.force });

  // Commit changes to DS-VCS
  const commit = await store.commit(
    `Ingest ${sourceType} source: ${fileName}`,
    fused.snapshot,
    "tds-ingest"
  );

  // Write updated tokens.json to workspace for immediate developer visibility
  try {
    await fs.writeFile(
      path.join(rootDir, "tokens.json"),
      JSON.stringify(fused.snapshot.tokens, null, 2),
      "utf-8"
    );
  } catch {
    // VCS is authoritative
  }

  // Synchronize Open Agent Skills
  try {
    await emitAgentSkills(rootDir);
  } catch {
    // Non-critical
  }

  console.log(pc.green(`✔ Ingest complete! Created commit ${pc.cyan(commit.id.slice(0, 8))} on branch ${pc.cyan(currentBranch)}`));
  console.log(pc.dim(`  • Tokens applied: ${fused.appliedTokensCount} (${fused.skippedLockedTokensCount} locked tokens skipped)`));
  console.log(pc.dim(`  • Components updated: ${fused.appliedComponentsCount}`));
  console.log(pc.dim(`  • Guidelines integrated: ${fused.appliedGuidelinesCount}`));
}
