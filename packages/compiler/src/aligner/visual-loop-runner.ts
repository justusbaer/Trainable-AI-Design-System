import fs from "node:fs";
import path from "node:path";
import { 
  M3_TYPESCALE_DEFAULTS, 
  M3_STATE_DEFAULTS, 
  M3_ELEVATION_DEFAULTS,
  TrainableDsConfig,
  TrainableDsConfigSchema
} from "@trainable-ds/core";
import { CdpRunner } from "./cdp-runner.js";
import { HarvestedSystemSnapshot } from "./deep-harvester.js";
import { analyzeDrift, DriftReport } from "./discrepancy-analyzer.js";
import { reconcileTokensAndComponents } from "./token-reconciler.js";
import { compileDesignMd } from "../design-md/compiler.js";

export interface VisualLoopOptions {
  sourceUrl: string;
  templateUrl?: string;
  templatePath?: string;
  maxLoops?: number;
  threshold?: number;
  dsDirectory?: string;
  onProgress?: (loop: number, report: DriftReport, patches: string[]) => void;
  // Allows injecting mocked snapshots for unit testing without launching real Chrome
  mockSourceSnapshot?: HarvestedSystemSnapshot;
  mockExtractedSnapshot?: HarvestedSystemSnapshot;
}

export interface VisualLoopResult {
  initialScore: number;
  finalScore: number;
  loopsCompleted: number;
  isConverged: boolean;
  driftHistory: DriftReport[];
  totalPatchesApplied: string[];
}

export async function runVisualAlignmentLoop(options: VisualLoopOptions): Promise<VisualLoopResult> {
  const maxLoops = options.maxLoops || 3;
  const threshold = options.threshold || 95;
  const dsDir = path.resolve(options.dsDirectory || process.cwd());

  const tokensFile = path.join(dsDir, "tokens.json");
  const componentsFile = path.join(dsDir, "components.json");

  let tokens = fs.existsSync(tokensFile) ? JSON.parse(fs.readFileSync(tokensFile, "utf-8")) : {};
  let components = fs.existsSync(componentsFile) ? JSON.parse(fs.readFileSync(componentsFile, "utf-8")) : {};

  const driftHistory: DriftReport[] = [];
  const totalPatchesApplied: string[] = [];

  const cdp = new CdpRunner();

  let previousScore: number | undefined;

  for (let loop = 1; loop <= maxLoops; loop++) {
    // 1. Harvest Source of Truth
    let sourceSnapshot: HarvestedSystemSnapshot;
    if (options.mockSourceSnapshot) {
      sourceSnapshot = options.mockSourceSnapshot;
    } else {
      sourceSnapshot = await cdp.harvestUrl(options.sourceUrl);
    }

    // 2. Harvest Current Extracted DS
    let extractedSnapshot: HarvestedSystemSnapshot;
    if (options.mockExtractedSnapshot) {
      extractedSnapshot = options.mockExtractedSnapshot;
    } else {
      const target = options.templateUrl || (options.templatePath ? `file://${path.resolve(options.templatePath)}` : options.sourceUrl);
      extractedSnapshot = await cdp.harvestUrl(target);
    }

    // 3. Analyze Drift
    const report = analyzeDrift(sourceSnapshot, extractedSnapshot, threshold, previousScore);
    driftHistory.push(report);

    // 4. Check Convergence
    if (report.isConverged) {
      if (options.onProgress) {
        options.onProgress(loop, report, []);
      }
      break;
    }

    // Check diminishing returns
    if (previousScore !== undefined && Math.abs(report.score - previousScore) < 0.5) {
      if (options.onProgress) {
        options.onProgress(loop, report, []);
      }
      break;
    }

    // 5. Reconcile & Patch
    const reconcileResult = reconcileTokensAndComponents(tokens, components, report);
    tokens = reconcileResult.tokens;
    components = reconcileResult.components;
    totalPatchesApplied.push(...reconcileResult.appliedPatches);

    // 6. Save updated artifacts if dsDir is present
    if (fs.existsSync(dsDir)) {
      try {
        fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), "utf-8");
        fs.writeFileSync(componentsFile, JSON.stringify(components, null, 2), "utf-8");

        // Recompile DESIGN.md if compiler inputs are valid
        if (tokens && typeof tokens === "object") {
          const cfg: TrainableDsConfig = TrainableDsConfigSchema.parse({
            name: (components && components.name) || "Aligned Design System",
            version: "1.7.0"
          });

          const compiledMd = compileDesignMd({
            config: cfg,
            colors: (tokens.sys && tokens.sys.color) || { light: {}, dark: {} },
            typescale: (tokens.sys && tokens.sys.typescale) || M3_TYPESCALE_DEFAULTS,
            state: (tokens.sys && tokens.sys.state) || M3_STATE_DEFAULTS,
            elevation: (tokens.sys && tokens.sys.elevation) || M3_ELEVATION_DEFAULTS,
            components: components.components ? components : undefined
          });
          fs.writeFileSync(path.join(dsDir, "DESIGN.md"), compiledMd, "utf-8");
        }
      } catch {
        // Non-fatal if writing to disk fails in read-only environment
      }
    }

    if (options.onProgress) {
      options.onProgress(loop, report, reconcileResult.appliedPatches);
    }

    previousScore = report.score;
  }

  const initialScore = driftHistory.length > 0 ? driftHistory[0].score : 0;
  const finalScore = driftHistory.length > 0 ? driftHistory[driftHistory.length - 1].score : 0;
  const isConverged = finalScore >= threshold;

  return {
    initialScore,
    finalScore,
    loopsCompleted: driftHistory.length,
    isConverged,
    driftHistory,
    totalPatchesApplied
  };
}
