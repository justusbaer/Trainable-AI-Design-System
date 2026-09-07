import * as fs from "node:fs/promises";
import * as path from "node:path";
import pc from "picocolors";
import { VCSStore, SemanticMerger, MergeGatekeeper } from "@trainable-ds/compiler";

export interface MergeOptions {
  target?: string;
  skipGates?: boolean;
  dir?: string;
  force?: boolean;
}

export async function runMerge(sourceBranch: string, options: MergeOptions = {}): Promise<void> {
  const rootDir = path.resolve(options.dir || ".");
  const store = new VCSStore(rootDir);
  await store.init();

  const targetBranch = options.target || await store.getCurrentBranch();

  if (sourceBranch === targetBranch) {
    console.error(pc.red(`Cannot merge branch '${sourceBranch}' into itself.`));
    process.exit(1);
  }

  console.log(pc.cyan(`\n🔀 Merging branch '${sourceBranch}' into '${targetBranch}'...`));

  // Get snapshots
  const targetSnapshot = await store.getHeadSnapshot(targetBranch);
  const sourceSnapshot = await store.getHeadSnapshot(sourceBranch);

  if (!sourceSnapshot) {
    console.error(pc.red(`Source branch '${sourceBranch}' does not exist or has no commits.`));
    process.exit(1);
  }
  if (!targetSnapshot) {
    console.error(pc.red(`Target branch '${targetBranch}' does not exist or has no commits.`));
    process.exit(1);
  }

  // Base snapshot: for now target snapshot before merge
  const baseSnapshot = targetSnapshot;

  // Run 3-way AST-aware semantic merge
  const merger = new SemanticMerger();
  const mergeResult = merger.merge(baseSnapshot, targetSnapshot, sourceSnapshot);

  // Check for conflicts
  if (!mergeResult.success) {
    console.error(pc.red(`\n✖ Merge Conflict Detected!`));
    if (mergeResult.tokenConflicts.length > 0) {
      console.log(pc.bold("\n  Conflicting Tokens:"));
      for (const tc of mergeResult.tokenConflicts) {
        console.log(pc.red(`   • Path: ${tc.path}`));
        console.log(pc.dim(`     - ${targetBranch} (ours):  ${JSON.stringify(tc.ourValue)}`));
        console.log(pc.dim(`     - ${sourceBranch} (theirs): ${JSON.stringify(tc.theirValue)}`));
      }
    }
    if (mergeResult.componentConflicts.length > 0) {
      console.log(pc.bold("\n  Conflicting Components:"));
      for (const cc of mergeResult.componentConflicts) {
        console.log(pc.red(`   • Component: ${cc.componentName} [${cc.field}]`));
      }
    }
    console.log(pc.yellow(`\nResolve conflicts before merging. Merge aborted.`));
    process.exit(1);
  }

  // Run Merge Gatekeeper (Evaluator CI Gate)
  const gatekeeper = new MergeGatekeeper();
  const gateResult = gatekeeper.check(mergeResult.mergedSnapshot);

  console.log(pc.bold(`\n🛡️  Running Merge Quality & A11y Gates (Score: ${gateResult.score}/100)...`));

  if (gateResult.warnings.length > 0) {
    gateResult.warnings.forEach(w => console.log(pc.yellow(`  ⚠ [WARN] ${w}`)));
  }

  if (!gateResult.passed) {
    console.log(pc.red(`\n✖ Merge Gatekeeper Failed with ${gateResult.violations.length} violation(s):`));
    gateResult.violations.forEach(v => console.log(pc.red(`  ✕ [FAIL] ${v}`)));

    if (!options.skipGates) {
      console.error(pc.red(`\nMerge blocked by quality gatekeeper. Use --skip-gates to bypass.`));
      process.exit(1);
    } else {
      console.log(pc.yellow(`\n⚠ Proceeding anyway because --skip-gates was specified.`));
    }
  } else {
    console.log(pc.green(`  ✓ WCAG 2.1 AA Contrast Gate Passed (≥ 4.5:1)`));
    console.log(pc.green(`  ✓ Interactive Component Touch Target Gate Passed (≥ 48px)`));
  }

  // Ensure target branch is checked out
  await store.switchBranch(targetBranch);

  // Commit merged snapshot
  const commit = await store.commit(
    `Merge branch '${sourceBranch}' into '${targetBranch}'`,
    mergeResult.mergedSnapshot,
    "tds-merge"
  );

  // Sync workspace tokens.json
  try {
    await fs.writeFile(
      path.join(rootDir, "tokens.json"),
      JSON.stringify(mergeResult.mergedSnapshot.tokens, null, 2),
      "utf-8"
    );
  } catch {
    // VCS authoritative
  }

  console.log(pc.green(`\n✓ Successfully merged '${sourceBranch}' into '${targetBranch}' (commit: ${commit.id})`));
}
