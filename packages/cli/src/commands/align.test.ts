import { describe, it, expect, vi } from "vitest";
import { runAlign } from "./align.js";
import * as compiler from "@trainable-ds/compiler";

describe("cli runAlign", () => {
  it("executes visual alignment and returns loop results", async () => {
    // Mock runVisualAlignmentLoop so unit test doesn't launch real browser
    vi.spyOn(compiler, "runVisualAlignmentLoop").mockResolvedValue({
      initialScore: 62,
      finalScore: 96,
      loopsCompleted: 3,
      isConverged: true,
      driftHistory: [
        {
          score: 62,
          isConverged: false,
          threshold: 95,
          discrepancies: [
            {
              id: "btn-shape",
              category: "geometry",
              componentRole: "button.primary",
              property: "borderRadius",
              observedValue: "pill (9999px)",
              currentValue: "12px",
              severity: "high",
              remediation: "Set button to pill"
            }
          ],
          categoryScores: { geometry: 60, color: 80, typography: 90, material: 85 }
        },
        {
          score: 96,
          isConverged: true,
          threshold: 95,
          discrepancies: [],
          categoryScores: { geometry: 98, color: 95, typography: 95, material: 96 }
        }
      ],
      totalPatchesApplied: ["Updated button corner radius to 9999px"]
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await runAlign({
      url: "https://example.com",
      maxLoops: 3,
      threshold: 95
    });

    expect(result.isConverged).toBe(true);
    expect(result.finalScore).toBe(96);
    expect(result.loopsCompleted).toBe(3);
    expect(result.totalPatchesApplied).toContain("Updated button corner radius to 9999px");

    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });
});
