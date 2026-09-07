import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { VCSStore } from "./store.js";
import { SemanticMerger } from "./semantic-merger.js";
import { MergeGatekeeper } from "./merge-gatekeeper.js";
import { DesignSystemSnapshot } from "@trainable-ds/core";

describe("DS-VCS Version Control System", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tds-vcs-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("VCSStore manages branches, commits, snapshots, and diffs", async () => {
    const store = new VCSStore(tempDir);
    await store.init({
      tokens: { sys: { color: { primary: { value: "#0055ff" } } } },
      components: {
        Button: { name: "Button", props: { minHeight: 48 } }
      }
    });

    expect(await store.getCurrentBranch()).toBe("main");
    const branches = await store.listBranches();
    expect(branches.length).toBe(1);
    expect(branches[0].name).toBe("main");

    // Create branch
    await store.createBranch("feature/dark-mode");
    const branchesAfter = await store.listBranches();
    expect(branchesAfter.length).toBe(2);

    // Switch branch
    await store.switchBranch("feature/dark-mode");
    expect(await store.getCurrentBranch()).toBe("feature/dark-mode");

    // Commit change on feature branch
    await store.commit("Add dark background", {
      tokens: {
        sys: {
          color: {
            primary: { value: "#0055ff" },
            background: { value: "#121212" }
          }
        }
      },
      components: {
        Button: { name: "Button", props: { minHeight: 48 } }
      }
    }, "developer");

    // Check diff between main and feature/dark-mode
    const diff = await store.getDiff("main", "feature/dark-mode");
    expect(diff.tokenDiffs.some(d => d.path === "sys.color.background" && d.type === "added")).toBe(true);

    const history = await store.getHistory("feature/dark-mode");
    expect(history.length).toBe(2);
    expect(history[0].message).toBe("Add dark background");
  });

  it("SemanticMerger performs AST-aware 3-way merge and detects conflicts", () => {
    const merger = new SemanticMerger();

    const base: DesignSystemSnapshot = {
      tokens: {
        sys: {
          color: {
            primary: { value: "#0055ff" },
            secondary: { value: "#888888" }
          }
        }
      },
      components: {
        Button: {
          name: "Button",
          props: { minHeight: 48, variant: "filled" },
          rules: ["Rule 1"]
        }
      }
    };

    // Ours changed secondary to #777777, added rule 2
    const ours: DesignSystemSnapshot = {
      tokens: {
        sys: {
          color: {
            primary: { value: "#0055ff" },
            secondary: { value: "#777777" }
          }
        }
      },
      components: {
        Button: {
          name: "Button",
          props: { minHeight: 48, variant: "filled" },
          rules: ["Rule 1", "Rule 2"]
        }
      }
    };

    // Theirs changed primary to #0033aa, added size prop, added rule 3
    const theirs: DesignSystemSnapshot = {
      tokens: {
        sys: {
          color: {
            primary: { value: "#0033aa" },
            secondary: { value: "#888888" }
          }
        }
      },
      components: {
        Button: {
          name: "Button",
          props: { minHeight: 48, variant: "filled", size: "lg" },
          rules: ["Rule 1", "Rule 3"]
        }
      }
    };

    // Clean merge test
    const cleanResult = merger.merge(base, ours, theirs);
    expect(cleanResult.success).toBe(true);
    expect(cleanResult.mergedSnapshot.tokens.sys.color.primary.value).toBe("#0033aa");
    expect(cleanResult.mergedSnapshot.tokens.sys.color.secondary.value).toBe("#777777");
    expect(cleanResult.mergedSnapshot.components.Button.props.size).toBe("lg");
    expect(cleanResult.mergedSnapshot.components.Button.rules).toContain("Rule 2");
    expect(cleanResult.mergedSnapshot.components.Button.rules).toContain("Rule 3");

    // Conflict test: both sides change primary to different values
    const conflictTheirs: DesignSystemSnapshot = {
      ...theirs,
      tokens: {
        sys: {
          color: {
            primary: { value: "#ff0000" },
            secondary: { value: "#888888" }
          }
        }
      }
    };
    const conflictOurs: DesignSystemSnapshot = {
      ...ours,
      tokens: {
        sys: {
          color: {
            primary: { value: "#00ff00" },
            secondary: { value: "#777777" }
          }
        }
      }
    };

    const conflictResult = merger.merge(base, conflictOurs, conflictTheirs, { preferOurLocks: false });
    expect(conflictResult.success).toBe(false);
    expect(conflictResult.tokenConflicts.length).toBe(1);
    expect(conflictResult.tokenConflicts[0].path).toBe("sys.color.primary");
    expect(conflictResult.tokenConflicts[0].ourValue).toBe("#00ff00");
    expect(conflictResult.tokenConflicts[0].theirValue).toBe("#ff0000");
  });

  it("MergeGatekeeper enforces WCAG 2.1 contrast and 48px touch targets", () => {
    const gatekeeper = new MergeGatekeeper();

    // Snapshot failing contrast (navy #000033 on black #000000) and touch target (32px)
    const failingSnapshot: DesignSystemSnapshot = {
      tokens: {
        sys: {
          color: {
            primary: { value: "#111122" },
            onPrimary: { value: "#222233" }, // Bad contrast ~ 1.1:1
            background: { value: "#ffffff" },
            onBackground: { value: "#000000" } // Good contrast ~ 21:1
          }
        }
      },
      components: {
        Button: {
          name: "Button",
          props: { minHeight: 32 } // Fails 48px gate
        }
      }
    };

    const failingCheck = gatekeeper.check(failingSnapshot);
    expect(failingCheck.passed).toBe(false);
    expect(failingCheck.violations.some(v => v.includes("Contrast failure"))).toBe(true);
    expect(failingCheck.violations.some(v => v.includes("Touch target failure"))).toBe(true);

    // Snapshot passing contrast and touch target
    const passingSnapshot: DesignSystemSnapshot = {
      tokens: {
        sys: {
          color: {
            primary: { value: "#0055ff" },
            onPrimary: { value: "#ffffff" }, // Good contrast > 4.5:1
            background: { value: "#ffffff" },
            onBackground: { value: "#111827" }
          }
        }
      },
      components: {
        Button: {
          name: "Button",
          props: { minHeight: 48 }
        }
      }
    };

    const passingCheck = gatekeeper.check(passingSnapshot);
    expect(passingCheck.passed).toBe(true);
    expect(passingCheck.violations.length).toBe(0);
    expect(passingCheck.score).toBe(100);
  });
});
