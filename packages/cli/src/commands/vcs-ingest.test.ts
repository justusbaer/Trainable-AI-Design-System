import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { runIngest } from "./ingest.js";
import { runRefine } from "./refine.js";
import { runBranchCreate, runBranchSwitch, runBranchList } from "./branch.js";
import { runMerge } from "./merge.js";
import { VCSStore } from "@trainable-ds/compiler";

describe("CLI Ingest, Refine, and DS-VCS Branch/Merge Integration", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tds-cli-test-"));
    // Seed initial tokens.json
    await fs.writeFile(
      path.join(tempDir, "tokens.json"),
      JSON.stringify({
        sys: {
          color: {
            primary: { value: "#0055ff" },
            onPrimary: { value: "#ffffff" },
            background: { value: "#ffffff" },
            onBackground: { value: "#111827" }
          }
        }
      }, null, 2),
      "utf-8"
    );
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("runIngest imports CSV tokens and creates commit in VCS", async () => {
    const csvFile = path.join(tempDir, "brand-tokens.csv");
    await fs.writeFile(
      csvFile,
      "token,value,type\nsys.color.accent,#ff9900,color\nspacing.base,8px,dimension\n",
      "utf-8"
    );

    await runIngest({
      file: "brand-tokens.csv",
      type: "table",
      dir: tempDir
    });

    const store = new VCSStore(tempDir);
    const snapshot = await store.getHeadSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.tokens.sys.color.accent.value).toBe("#ff9900");
    expect(snapshot?.tokens.spacing.base.value).toBe(8);
  });

  it("runRefine applies conversational directive to branch", async () => {
    await runRefine("Change secondary color to #10b981", { dir: tempDir });

    const store = new VCSStore(tempDir);
    const snapshot = await store.getHeadSnapshot();
    expect(snapshot?.tokens.sys.color.secondary.value).toBe("#10b981");
  });

  it("branching, switching, and merging with gatekeeper enforcement", async () => {
    const store = new VCSStore(tempDir);
    await store.init({
      tokens: {
        sys: {
          color: {
            primary: { value: "#0055ff" },
            onPrimary: { value: "#ffffff" },
            background: { value: "#ffffff" },
            onBackground: { value: "#000000" }
          }
        }
      },
      components: {
        Button: { name: "Button", props: { minHeight: 48 } }
      }
    });

    // Create and switch to new branch
    await runBranchCreate("feature/teal-brand", { dir: tempDir });
    await runBranchSwitch("feature/teal-brand", { dir: tempDir });
    expect(await store.getCurrentBranch()).toBe("feature/teal-brand");

    // Refine on feature branch: valid teal with white on-color
    await runRefine("Change primary color to #008080 and secondary color to #20b2aa", { dir: tempDir });

    // Switch back to main
    await runBranchSwitch("main", { dir: tempDir });
    expect(await store.getCurrentBranch()).toBe("main");

    // Merge feature/teal-brand into main
    await runMerge("feature/teal-brand", { dir: tempDir });

    const mainSnap = await store.getHeadSnapshot("main");
    expect(mainSnap?.tokens.sys.color.primary.value).toBe("#008080");
    expect(mainSnap?.tokens.sys.color.secondary.value).toBe("#20b2aa");
  });
});
