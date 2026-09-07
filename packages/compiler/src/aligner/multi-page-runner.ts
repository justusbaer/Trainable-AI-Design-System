import fs from "node:fs";
import path from "node:path";
import { CdpRunner } from "./cdp-runner.js";
import { 
  getInPageHarvesterScript, 
  normalizeHarvestedSnapshot, 
  HarvestedSystemSnapshot, 
  HarvestedElement 
} from "./deep-harvester.js";
import { 
  getAssetsHarvesterScript, 
  normalizeHarvestedAssets, 
  HarvestedAssets, 
  HarvestedSvgIcon 
} from "./assets-harvester.js";
import { analyzeDrift, DriftReport } from "./discrepancy-analyzer.js";
import { reconcileTokensAndComponents } from "./token-reconciler.js";
import { compileDesignMd } from "../design-md/compiler.js";
import { generateOverviewHtml } from "../overview/generator.js";
import { generatePrototypeComponentLibrary } from "../extractor/component-library-generator.js";
import { 
  M3_TYPESCALE_DEFAULTS, 
  M3_STATE_DEFAULTS, 
  M3_ELEVATION_DEFAULTS,
  TrainableDsConfig,
  TrainableDsConfigSchema
} from "@trainable-ds/core";

export interface MultiPageRunnerOptions {
  rootUrl: string;
  pages?: string[];
  maxLoops?: number;
  threshold?: number;
  dsDirectory?: string;
  brandName?: string;
  onProgress?: (stage: string, data: any) => void;
  // Mock injections for offline unit testing
  mockSnapshots?: {
    systems?: HarvestedSystemSnapshot[];
    assets?: HarvestedAssets[];
  };
}

export interface MultiPageRunnerResult {
  rootUrl: string;
  crawledPages: string[];
  finalScore: number;
  isConverged: boolean;
  loopsCompleted: number;
  tokens: Record<string, any>;
  components: Record<string, any>;
  fonts: HarvestedAssets["fonts"];
  icons: HarvestedSvgIcon[];
  overviewHtmlPath: string;
  componentLibraryPath: string;
  totalPatchesApplied: string[];
}

export async function runMultiPageAlignment(options: MultiPageRunnerOptions): Promise<MultiPageRunnerResult> {
  const rootUrl = options.rootUrl;
  const pages = options.pages && options.pages.length > 0 ? options.pages : [rootUrl];
  const maxLoops = options.maxLoops || 3;
  const threshold = options.threshold || 95;
  const dsDir = path.resolve(options.dsDirectory || process.cwd());
  const brandName = options.brandName || "Trained Design System";

  const tokensFile = path.join(dsDir, "tokens.json");
  const componentsFile = path.join(dsDir, "components.json");

  let tokens = fs.existsSync(tokensFile) ? JSON.parse(fs.readFileSync(tokensFile, "utf-8")) : {};
  let components = fs.existsSync(componentsFile) ? JSON.parse(fs.readFileSync(componentsFile, "utf-8")) : {};

  const cdp = new CdpRunner();
  const aggregatedElements: HarvestedElement[] = [];
  const mergedFonts: HarvestedAssets["fonts"] = { families: {} };
  const iconMap = new Map<string, HarvestedSvgIcon>();

  // 1. CRAWL ALL APPROVED PAGES
  for (let i = 0; i < pages.length; i++) {
    const pageUrl = pages[i];
    if (options.onProgress) {
      options.onProgress("crawling", { page: pageUrl, index: i + 1, total: pages.length });
    }

    let sysSnapshot: HarvestedSystemSnapshot;
    let assetData: HarvestedAssets;

    if (options.mockSnapshots && options.mockSnapshots.systems && options.mockSnapshots.systems[i]) {
      sysSnapshot = options.mockSnapshots.systems[i];
      assetData = options.mockSnapshots.assets?.[i] || { fonts: { families: {} }, icons: [] };
    } else {
      try {
        sysSnapshot = await cdp.harvestUrl(pageUrl);
      } catch {
        sysSnapshot = normalizeHarvestedSnapshot(null);
      }
      assetData = { fonts: { families: {} }, icons: [] };
    }

    // Accumulate elements
    sysSnapshot.elements.forEach(el => {
      aggregatedElements.push(el);
    });

    // Merge fonts
    for (const [famName, fam] of Object.entries(assetData.fonts.families)) {
      if (!mergedFonts.families[famName]) {
        mergedFonts.families[famName] = fam;
      } else {
        fam.weights.forEach(w => {
          if (!mergedFonts.families[famName].weights.includes(w)) {
            mergedFonts.families[famName].weights.push(w);
          }
        });
        if (fam.cssBlock && !mergedFonts.families[famName].cssBlock.includes(fam.cssBlock)) {
          mergedFonts.families[famName].cssBlock += "\n\n" + fam.cssBlock;
        }
      }
    }

    // Merge icons
    for (const ic of assetData.icons) {
      if (iconMap.has(ic.id)) {
        iconMap.get(ic.id)!.occurrences += ic.occurrences;
      } else {
        iconMap.set(ic.id, { ...ic });
      }
    }
  }

  const aggregatedIcons = Array.from(iconMap.values()).sort((a, b) => b.occurrences - a.occurrences);

  const aggregatedSnapshot: HarvestedSystemSnapshot = {
    url: rootUrl,
    timestamp: Date.now(),
    title: brandName,
    elements: aggregatedElements,
    brandColors: {},
    detectedWebComponents: []
  };

  // 2. ITERATIVE CONVERGENCE LOOPS
  let finalScore = 0;
  let loopsCompleted = 0;
  const totalPatchesApplied: string[] = [];

  for (let loop = 1; loop <= maxLoops; loop++) {
    loopsCompleted = loop;

    // Compare aggregated source against current extracted tokens/components
    const mockExtracted: HarvestedSystemSnapshot = {
      url: "http://localhost:5000",
      timestamp: Date.now(),
      title: "Extracted",
      elements: buildExtractedElementsFromTokens(tokens, components),
      brandColors: {},
      detectedWebComponents: []
    };

    const driftReport: DriftReport = analyzeDrift(aggregatedSnapshot, mockExtracted, threshold);
    finalScore = driftReport.score;

    if (options.onProgress) {
      options.onProgress("loop", { loop, maxLoops, report: driftReport });
    }

    if (driftReport.isConverged) break;

    const reconcileResult = reconcileTokensAndComponents(tokens, components, driftReport);
    tokens = reconcileResult.tokens;
    components = reconcileResult.components;
    totalPatchesApplied.push(...reconcileResult.appliedPatches);
  }

  // 3. GENERATE COMPLETE ARTIFACT BUNDLE
  // Synthesize prototype component library
  const protoLib = generatePrototypeComponentLibrary({
    brandName,
    tokens,
    components,
    fonts: mergedFonts,
    icons: aggregatedIcons
  });

  // Preserve locked components or existing human customizations
  if (!components.components) components.components = {};
  for (const [compName, protoDef] of Object.entries(protoLib.manifest)) {
    if (!components.components[compName]) {
      components.components[compName] = protoDef;
    } else {
      // If not locked, update code and anatomy from latest tokens
      if (!components.components[compName].locked) {
        components.components[compName].code = protoDef.code;
        components.components[compName].anatomy = protoDef.anatomy;
        components.components[compName].variants = protoDef.variants;
      }
    }
  }

  // Write component library files to <dsDir>/components/ui/
  const uiDir = path.join(dsDir, "components", "ui");
  try {
    fs.mkdirSync(uiDir, { recursive: true });
    for (const [fname, content] of Object.entries(protoLib.files)) {
      const compName = fname.replace(/\.tsx?$/, "");
      if (components.components[compName]?.locked && fs.existsSync(path.join(uiDir, fname))) {
        continue;
      }
      fs.writeFileSync(path.join(uiDir, fname), content, "utf-8");
    }
  } catch {
    // Non-fatal if filesystem is restricted
  }

  const overviewHtmlContent = generateOverviewHtml({
    brandName,
    version: "1.7.0",
    tokens,
    components,
    fonts: mergedFonts,
    icons: aggregatedIcons,
    crawledPages: pages,
    complianceScore: finalScore
  });

  const overviewPath = path.join(dsDir, "overview.html");
  const fontsPath = path.join(dsDir, "fonts.json");
  const iconsPath = path.join(dsDir, "icons.json");
  const designMdPath = path.join(dsDir, "DESIGN.md");

  try {
    fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), "utf-8");
    fs.writeFileSync(componentsFile, JSON.stringify(components, null, 2), "utf-8");
    fs.writeFileSync(fontsPath, JSON.stringify(mergedFonts, null, 2), "utf-8");
    fs.writeFileSync(iconsPath, JSON.stringify(aggregatedIcons, null, 2), "utf-8");
    fs.writeFileSync(overviewPath, overviewHtmlContent, "utf-8");

    // Recompile DESIGN.md
    const cfg: TrainableDsConfig = TrainableDsConfigSchema.parse({
      name: brandName,
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
    fs.writeFileSync(designMdPath, compiledMd, "utf-8");
  } catch {
    // Non-fatal if writing fails in sandbox/read-only mode
  }

  return {
    rootUrl,
    crawledPages: pages,
    finalScore,
    isConverged: finalScore >= threshold,
    loopsCompleted,
    tokens,
    components,
    fonts: mergedFonts,
    icons: aggregatedIcons,
    overviewHtmlPath: overviewPath,
    componentLibraryPath: uiDir,
    totalPatchesApplied
  };
}

function buildExtractedElementsFromTokens(tokens: Record<string, any>, components: Record<string, any>): HarvestedElement[] {
  const elements: HarvestedElement[] = [];

  // Button element
  const btnCorner = tokens?.["comp.button.shape.corner"]?.["$value"] || "12px";
  const btnPadding = tokens?.["comp.button.spacing.padding"]?.["$value"] || "16px 28px";
  const isPill = String(btnCorner).includes("pill") || String(btnCorner).includes("9999");
  const primaryBg = tokens?.["sys.color.primary"]?.["$value"] || "#010205";

  elements.push({
    selector: "button.primary",
    tagName: "button",
    isShadowRoot: false,
    family: "actions",
    role: "button.primary",
    geometry: {
      padding: { top: 16, right: 28, bottom: 16, left: 28 },
      height: 56,
      minHeight: 56,
      borderRadius: isPill ? 9999 : parseFloat(btnCorner) || 12,
      isPill
    },
    material: {
      backgroundColor: { hex: primaryBg, rgb: primaryBg, alpha: 1 },
      color: { hex: "#ffffff", rgb: "rgb(255, 255, 255)", alpha: 1 },
      opacity: 1
    },
    rawComputed: {}
  });

  return elements;
}
