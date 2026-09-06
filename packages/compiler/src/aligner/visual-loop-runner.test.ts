import { describe, it, expect, afterEach } from "vitest";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { runVisualAlignmentLoop } from "./visual-loop-runner.js";
import { HarvestedSystemSnapshot } from "./deep-harvester.js";

describe("visual-loop-runner", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "visual-loop-test-"));
  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
  const mockSourceSnapshot: HarvestedSystemSnapshot = {
    url: "https://porsche.com",
    timestamp: Date.now(),
    title: "Source of Truth",
    elements: [
      {
        selector: "p-button.primary",
        tagName: "p-button",
        isShadowRoot: true,
        family: "actions",
        role: "button.primary",
        geometry: {
          padding: { top: 16, right: 16, bottom: 16, left: 16 },
          height: 56,
          minHeight: 56,
          borderRadius: 9999,
          isPill: true
        },
        material: {
          backgroundColor: { hex: "#010205", rgb: "rgb(1, 2, 5)", alpha: 1 },
          color: { hex: "#ffffff", rgb: "rgb(255, 255, 255)", alpha: 1 },
          opacity: 1
        },
        rawComputed: {}
      }
    ],
    brandColors: {},
    detectedWebComponents: ["p-button"]
  };

  it("runs multi-loop convergence with progress callbacks", async () => {
    const mockExtractedSnapshot: HarvestedSystemSnapshot = {
      url: "http://localhost:5000",
      timestamp: Date.now(),
      title: "Extracted System",
      elements: [
        {
          selector: "button.primary",
          tagName: "button",
          isShadowRoot: false,
          family: "actions",
          role: "button.primary",
          geometry: {
            padding: { top: 16, right: 36, bottom: 16, left: 36 },
            height: 56,
            minHeight: 56,
            borderRadius: 12,
            isPill: false
          },
          material: {
            backgroundColor: { hex: "#010205", rgb: "rgb(1, 2, 5)", alpha: 1 },
            color: { hex: "#ffffff", rgb: "rgb(255, 255, 255)", alpha: 1 },
            opacity: 1
          },
          rawComputed: {}
        }
      ],
      brandColors: {},
      detectedWebComponents: []
    };

    const progressLogs: { loop: number; score: number }[] = [];

    const result = await runVisualAlignmentLoop({
      sourceUrl: "https://porsche.com",
      mockSourceSnapshot,
      mockExtractedSnapshot,
      dsDirectory: tempDir,
      maxLoops: 2,
      threshold: 95,
      onProgress: (loop: number, report: any) => {
        progressLogs.push({ loop, score: report.score });
      }
    });

    expect(result.loopsCompleted).toBeGreaterThanOrEqual(1);
    expect(progressLogs.length).toBeGreaterThanOrEqual(1);
    expect(result.initialScore).toBeLessThan(90);
    expect(result.totalPatchesApplied.length).toBeGreaterThan(0);
  });
});
