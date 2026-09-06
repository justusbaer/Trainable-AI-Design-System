import { describe, it, expect, afterEach } from "vitest";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { runMultiPageAlignment } from "./multi-page-runner.js";
import { HarvestedSystemSnapshot } from "./deep-harvester.js";

describe("multi-page-runner", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "multi-page-test-"));
  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("crawls multiple pages, merges assets, and generates overview.html", async () => {
    const page1Snapshot: HarvestedSystemSnapshot = {
      url: "https://porsche.com/germany/",
      timestamp: Date.now(),
      title: "Porsche Home",
      elements: [
        {
          selector: "p-button.primary",
          tagName: "p-button",
          isShadowRoot: true,
          family: "actions",
          role: "button.primary",
          geometry: {
            padding: { top: 16, right: 28, bottom: 16, left: 28 },
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

    const page2Snapshot: HarvestedSystemSnapshot = {
      url: "https://porsche.com/germany/models/911/",
      timestamp: Date.now(),
      title: "Porsche 911",
      elements: [
        {
          selector: "p-button.primary",
          tagName: "p-button",
          isShadowRoot: true,
          family: "actions",
          role: "button.primary",
          geometry: {
            padding: { top: 16, right: 28, bottom: 16, left: 28 },
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

    const result = await runMultiPageAlignment({
      rootUrl: "https://porsche.com/germany/",
      pages: ["https://porsche.com/germany/", "https://porsche.com/germany/models/911/"],
      brandName: "Porsche Design System",
      dsDirectory: tempDir,
      maxLoops: 2,
      threshold: 95,
      mockSnapshots: {
        systems: [page1Snapshot, page2Snapshot],
        assets: [
          {
            fonts: {
              families: {
                "Porsche Next": {
                  name: "Porsche Next",
                  weights: ["400"],
                  styles: ["normal"],
                  faces: [],
                  cssBlock: "@font-face { font-family: 'Porsche Next'; }"
                }
              }
            },
            icons: [
              { id: "icon-1", name: "arrow-right", viewBox: "0 0 24 24", width: 24, height: 24, svg: "<svg></svg>", occurrences: 3 }
            ]
          },
          {
            fonts: {
              families: {
                "Porsche Next": {
                  name: "Porsche Next",
                  weights: ["700"],
                  styles: ["normal"],
                  faces: [],
                  cssBlock: "@font-face { font-family: 'Porsche Next'; font-weight: 700; }"
                }
              }
            },
            icons: [
              { id: "icon-2", name: "chevron-down", viewBox: "0 0 24 24", width: 24, height: 24, svg: "<svg></svg>", occurrences: 2 }
            ]
          }
        ]
      }
    });

    expect(result.crawledPages.length).toBe(2);
    expect(result.fonts.families["Porsche Next"]).toBeDefined();
    expect(result.fonts.families["Porsche Next"].weights).toContain("400");
    expect(result.fonts.families["Porsche Next"].weights).toContain("700");
    expect(result.icons.length).toBe(2);
    expect(result.overviewHtmlPath).toContain("overview.html");
  });
});
