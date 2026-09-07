import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { 
  BranchInfo, 
  CommitRecord, 
  DesignSystemSnapshot 
} from "@trainable-ds/core";

export class VCSStore {
  readonly vcsDir: string;

  constructor(readonly rootDir: string = process.cwd()) {
    this.vcsDir = path.join(this.rootDir, ".tds", "vcs");
  }

  /**
   * Initializes .tds/vcs/ if it doesn't already exist.
   */
  async init(initialSnapshot?: DesignSystemSnapshot): Promise<void> {
    const refsDir = path.join(this.vcsDir, "refs", "heads");
    const commitsDir = path.join(this.vcsDir, "commits");
    const snapshotsDir = path.join(this.vcsDir, "snapshots");

    await fs.mkdir(refsDir, { recursive: true });
    await fs.mkdir(commitsDir, { recursive: true });
    await fs.mkdir(snapshotsDir, { recursive: true });

    const headPath = path.join(this.vcsDir, "HEAD");
    try {
      await fs.access(headPath);
    } catch {
      // Create default branch 'main'
      await fs.writeFile(headPath, "ref: refs/heads/main\n", "utf-8");

      const defaultSnapshot: DesignSystemSnapshot = initialSnapshot || {
        tokens: {},
        components: {},
        guidelines: "",
        fonts: {},
        icons: []
      };

      await this.commit("Initial design system commit", defaultSnapshot, "tds-init");
    }
  }

  /**
   * Returns current checked out branch name.
   */
  async getCurrentBranch(): Promise<string> {
    const headPath = path.join(this.vcsDir, "HEAD");
    try {
      const content = (await fs.readFile(headPath, "utf-8")).trim();
      if (content.startsWith("ref: refs/heads/")) {
        return content.replace("ref: refs/heads/", "");
      }
      return "main";
    } catch {
      return "main";
    }
  }

  /**
   * Lists all existing branches with metadata.
   */
  async listBranches(): Promise<BranchInfo[]> {
    const refsDir = path.join(this.vcsDir, "refs", "heads");
    try {
      const branches: BranchInfo[] = [];
      const currentBranch = await this.getCurrentBranch();

      const scanDir = async (dir: string, prefix: string = "") => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith(".")) continue;
          const fullPath = path.join(dir, entry.name);
          const relName = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.isDirectory()) {
            await scanDir(fullPath, relName);
          } else {
            const headCommitId = (await fs.readFile(fullPath, "utf-8")).trim();
            const stat = await fs.stat(fullPath);
            branches.push({
              name: relName,
              headCommitId,
              createdAt: stat.birthtime.toISOString(),
              updatedAt: stat.mtime.toISOString(),
              isDefault: relName === currentBranch
            });
          }
        }
      };

      await scanDir(refsDir);
      return branches;
    } catch {
      return [];
    }
  }

  /**
   * Creates a new branch pointing to an existing branch's head or commit.
   */
  async createBranch(branchName: string, startFrom?: string): Promise<BranchInfo> {
    const cleanName = branchName.replace(/[^a-zA-Z0-9_\-\/]/g, "-").toLowerCase();
    const refsDir = path.join(this.vcsDir, "refs", "heads");
    await fs.mkdir(refsDir, { recursive: true });

    const targetBranch = startFrom || await this.getCurrentBranch();
    const sourceCommitId = await this.getBranchHeadCommitId(targetBranch);

    if (!sourceCommitId) {
      throw new Error(`Cannot branch from '${targetBranch}': branch or commit not found.`);
    }

    const branchPath = path.join(refsDir, cleanName);
    await fs.mkdir(path.dirname(branchPath), { recursive: true });
    await fs.writeFile(branchPath, `${sourceCommitId}\n`, "utf-8");

    return {
      name: cleanName,
      headCommitId: sourceCommitId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: false
    };
  }

  /**
   * Switches HEAD to the given branch and returns its snapshot.
   */
  async switchBranch(branchName: string): Promise<DesignSystemSnapshot> {
    const refsDir = path.join(this.vcsDir, "refs", "heads");
    const branchPath = path.join(refsDir, branchName);

    try {
      await fs.access(branchPath);
    } catch {
      throw new Error(`Branch '${branchName}' does not exist.`);
    }

    const headPath = path.join(this.vcsDir, "HEAD");
    await fs.writeFile(headPath, `ref: refs/heads/${branchName}\n`, "utf-8");

    const snapshot = await this.getHeadSnapshot(branchName);
    if (!snapshot) {
      return { tokens: {}, components: {}, guidelines: "", fonts: {}, icons: [] };
    }
    return snapshot;
  }

  /**
   * Creates a new commit on the current (or specified) branch.
   */
  async commit(message: string, snapshot: DesignSystemSnapshot, author: string = "agent"): Promise<CommitRecord> {
    const currentBranch = await this.getCurrentBranch();
    const parentId = await this.getBranchHeadCommitId(currentBranch);

    // Save snapshot
    const snapshotStr = JSON.stringify(snapshot, null, 2);
    const snapshotHash = crypto.createHash("sha256").update(snapshotStr).digest("hex").slice(0, 16);
    const snapshotPath = path.join(this.vcsDir, "snapshots", `${snapshotHash}.json`);
    await fs.writeFile(snapshotPath, snapshotStr, "utf-8");

    // Create commit record
    const timestamp = new Date().toISOString();
    const tokenCount = Object.keys(snapshot.tokens || {}).length;
    const compCount = Object.keys(snapshot.components || {}).length;
    const changesSummary = `Updated design system (${tokenCount} tokens, ${compCount} components)`;

    const commitPayload = `${parentId || ""}:${currentBranch}:${timestamp}:${snapshotHash}:${message}`;
    const commitId = crypto.createHash("sha256").update(commitPayload).digest("hex").slice(0, 12);

    const record: CommitRecord = {
      id: commitId,
      parentId,
      branch: currentBranch,
      message,
      timestamp,
      author,
      changesSummary,
      snapshotHash
    };

    // Save commit
    const commitPath = path.join(this.vcsDir, "commits", `${commitId}.json`);
    await fs.writeFile(commitPath, JSON.stringify(record, null, 2), "utf-8");

    // Update branch ref
    const refPath = path.join(this.vcsDir, "refs", "heads", currentBranch);
    await fs.mkdir(path.dirname(refPath), { recursive: true });
    await fs.writeFile(refPath, `${commitId}\n`, "utf-8");

    return record;
  }

  /**
   * Retrieves the current snapshot for a branch or HEAD.
   */
  async getHeadSnapshot(branchName?: string): Promise<DesignSystemSnapshot | null> {
    const branch = branchName || await this.getCurrentBranch();
    const commitId = await this.getBranchHeadCommitId(branch);
    if (!commitId) return null;

    const commit = await this.getCommit(commitId);
    if (!commit) return null;

    return this.getSnapshot(commit.snapshotHash);
  }

  /**
   * Retrieves snapshot by hash.
   */
  async getSnapshot(hash: string): Promise<DesignSystemSnapshot | null> {
    const snapshotPath = path.join(this.vcsDir, "snapshots", `${hash}.json`);
    try {
      const data = await fs.readFile(snapshotPath, "utf-8");
      return JSON.parse(data) as DesignSystemSnapshot;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves commit record by ID.
   */
  async getCommit(commitId: string): Promise<CommitRecord | null> {
    const commitPath = path.join(this.vcsDir, "commits", `${commitId}.json`);
    try {
      const data = await fs.readFile(commitPath, "utf-8");
      return JSON.parse(data) as CommitRecord;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves commit history for a branch.
   */
  async getHistory(branchName?: string, limit: number = 50): Promise<CommitRecord[]> {
    const branch = branchName || await this.getCurrentBranch();
    let currentId: string | null = await this.getBranchHeadCommitId(branch);
    const history: CommitRecord[] = [];

    while (currentId && history.length < limit) {
      const commit = await this.getCommit(currentId);
      if (!commit) break;
      history.push(commit);
      currentId = commit.parentId;
    }

    return history;
  }

  /**
   * Compares snapshots between two branches to produce diff.
   */
  async getDiff(baseBranch: string, targetBranch: string): Promise<{
    tokenDiffs: { path: string; base: any; target: any; type: "added" | "modified" | "removed" }[];
    componentDiffs: { name: string; base: any; target: any; type: "added" | "modified" | "removed" }[];
  }> {
    const baseSnap = await this.getHeadSnapshot(baseBranch) || { tokens: {}, components: {} };
    const targetSnap = await this.getHeadSnapshot(targetBranch) || { tokens: {}, components: {} };

    const tokenDiffs: any[] = [];
    const baseTokens = this.flattenTokens(baseSnap.tokens || {});
    const targetTokens = this.flattenTokens(targetSnap.tokens || {});

    const allTokenKeys = new Set([...Object.keys(baseTokens), ...Object.keys(targetTokens)]);
    for (const key of allTokenKeys) {
      if (key.startsWith("_meta")) continue;
      const bVal = baseTokens[key];
      const tVal = targetTokens[key];

      if (bVal === undefined && tVal !== undefined) {
        tokenDiffs.push({ path: key, base: null, target: tVal, type: "added" });
      } else if (bVal !== undefined && tVal === undefined) {
        tokenDiffs.push({ path: key, base: bVal, target: null, type: "removed" });
      } else if (JSON.stringify(bVal) !== JSON.stringify(tVal)) {
        tokenDiffs.push({ path: key, base: bVal, target: tVal, type: "modified" });
      }
    }

    const componentDiffs: any[] = [];
    const baseComps = baseSnap.components || {};
    const targetComps = targetSnap.components || {};
    const allCompKeys = new Set([...Object.keys(baseComps), ...Object.keys(targetComps)]);

    for (const name of allCompKeys) {
      const bComp = baseComps[name];
      const tComp = targetComps[name];

      if (!bComp && tComp) {
        componentDiffs.push({ name, base: null, target: tComp, type: "added" });
      } else if (bComp && !tComp) {
        componentDiffs.push({ name, base: bComp, target: null, type: "removed" });
      } else if (JSON.stringify(bComp) !== JSON.stringify(tComp)) {
        componentDiffs.push({ name, base: bComp, target: tComp, type: "modified" });
      }
    }

    return { tokenDiffs, componentDiffs };
  }

  private async getBranchHeadCommitId(branch: string): Promise<string | null> {
    const branchPath = path.join(this.vcsDir, "refs", "heads", branch);
    try {
      return (await fs.readFile(branchPath, "utf-8")).trim();
    } catch {
      return null;
    }
  }

  private flattenTokens(obj: Record<string, any>, prefix: string = ""): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (val && typeof val === "object" && ("value" in val || "$value" in val)) {
        flat[fullPath] = val.value !== undefined ? val.value : val.$value;
      } else if (val && typeof val === "object" && !Array.isArray(val)) {
        Object.assign(flat, this.flattenTokens(val, fullPath));
      } else {
        flat[fullPath] = val;
      }
    }
    return flat;
  }
}
