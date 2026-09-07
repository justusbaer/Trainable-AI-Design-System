import * as fs from "node:fs/promises";
import * as path from "node:path";
import pc from "picocolors";
import { VCSStore } from "@trainable-ds/compiler";

export interface BranchOptions {
  dir?: string;
  from?: string;
  target?: string;
}

export async function runBranchList(options: BranchOptions = {}): Promise<void> {
  const rootDir = path.resolve(options.dir || ".");
  const store = new VCSStore(rootDir);
  await store.init();

  const branches = await store.listBranches();
  const current = await store.getCurrentBranch();

  console.log(pc.cyan(`\n🌿 Trainable DS Branches (${branches.length}):`));
  for (const b of branches) {
    const isCurrent = b.name === current;
    const marker = isCurrent ? pc.green("* ") : "  ";
    const nameStr = isCurrent ? pc.bold(pc.green(b.name)) : b.name;
    const commitStr = pc.dim(`(${b.headCommitId.slice(0, 7)})`);
    console.log(`${marker}${nameStr} ${commitStr}`);
  }
  console.log();
}

export async function runBranchCreate(branchName: string, options: BranchOptions = {}): Promise<void> {
  const rootDir = path.resolve(options.dir || ".");
  const store = new VCSStore(rootDir);
  await store.init();

  const branch = await store.createBranch(branchName, options.from);
  console.log(pc.green(`\n✓ Created new branch '${branch.name}' at commit ${branch.headCommitId.slice(0, 7)}`));
}

export async function runBranchSwitch(branchName: string, options: BranchOptions = {}): Promise<void> {
  const rootDir = path.resolve(options.dir || ".");
  const store = new VCSStore(rootDir);
  await store.init();

  const snapshot = await store.switchBranch(branchName);

  // Sync workspace tokens.json to match branch snapshot
  try {
    await fs.writeFile(
      path.join(rootDir, "tokens.json"),
      JSON.stringify(snapshot.tokens, null, 2),
      "utf-8"
    );
  } catch {
    // VCS is authoritative
  }

  console.log(pc.green(`\n✓ Switched to branch '${branchName}'`));
}

export async function runBranchDiff(sourceBranch: string, options: BranchOptions = {}): Promise<void> {
  const rootDir = path.resolve(options.dir || ".");
  const store = new VCSStore(rootDir);
  await store.init();

  const targetBranch = options.target || await store.getCurrentBranch();
  console.log(pc.cyan(`\n🔍 Comparing branch '${sourceBranch}' → '${targetBranch}':`));

  const diff = await store.getDiff(targetBranch, sourceBranch);

  if (diff.tokenDiffs.length === 0 && diff.componentDiffs.length === 0) {
    console.log(pc.dim("  No differences found between branches."));
    return;
  }

  if (diff.tokenDiffs.length > 0) {
    console.log(pc.bold("\n  Token Changes:"));
    for (const d of diff.tokenDiffs) {
      if (d.type === "added") {
        console.log(pc.green(`   + ${d.path}: ${JSON.stringify(d.target)}`));
      } else if (d.type === "removed") {
        console.log(pc.red(`   - ${d.path}: ${JSON.stringify(d.base)}`));
      } else {
        console.log(pc.yellow(`   ~ ${d.path}: ${JSON.stringify(d.base)} → ${JSON.stringify(d.target)}`));
      }
    }
  }

  if (diff.componentDiffs.length > 0) {
    console.log(pc.bold("\n  Component Changes:"));
    for (const d of diff.componentDiffs) {
      if (d.type === "added") {
        console.log(pc.green(`   + ${d.name}`));
      } else if (d.type === "removed") {
        console.log(pc.red(`   - ${d.name}`));
      } else {
        console.log(pc.yellow(`   ~ ${d.name}`));
      }
    }
  }
  console.log();
}
