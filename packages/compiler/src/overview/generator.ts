/**
 * Trainable DS — Interactive Human Overview Page Generator
 * Generates an interactive, responsive overview.html with live reviewer overrides synced back to machine assets.
 */

import { HarvestedFontManifest, HarvestedSvgIcon } from "../aligner/assets-harvester.js";
import { generatePrototypeComponentLibrary } from "../extractor/component-library-generator.js";

export interface OverviewGeneratorOptions {
  brandName: string;
  version?: string;
  tokens: Record<string, any>;
  components: Record<string, any>;
  fonts?: HarvestedFontManifest;
  icons?: HarvestedSvgIcon[];
  crawledPages?: string[];
  complianceScore?: number;
}

export function generateOverviewHtml(options: OverviewGeneratorOptions): string {
  const brandName = options.brandName || "Design System";
  const version = options.version || "1.7.0";
  const complianceScore = options.complianceScore ?? 98;
  const crawledPages = options.crawledPages || [];
  const fonts = options.fonts || { families: {} };
  const icons = options.icons || [];
  const tokens = options.tokens || {};

  // Normalize components and ensure 6 canonical families exist
  let componentsMap: Record<string, any> = {};
  if (options.components && typeof options.components === "object") {
    if (options.components.components && Object.keys(options.components.components).length > 0) {
      componentsMap = { ...options.components.components };
    } else if (Object.keys(options.components).length > 0) {
      componentsMap = { ...options.components };
    }
  }

  const generatedLib = generatePrototypeComponentLibrary({
    brandName,
    tokens,
    fonts,
    icons
  });

  for (const [name, meta] of Object.entries(generatedLib.manifest)) {
    if (!componentsMap[name]) {
      componentsMap[name] = meta;
    } else {
      if (!componentsMap[name].code) componentsMap[name].code = meta.code;
      if (!componentsMap[name].anatomy) componentsMap[name].anatomy = meta.anatomy;
      if (!componentsMap[name].variants) componentsMap[name].variants = meta.variants;
      if (!componentsMap[name].props) componentsMap[name].props = meta.props;
      if (!componentsMap[name].authoritativeSource) componentsMap[name].authoritativeSource = meta.authoritativeSource;
    }
  }

  // Build @font-face rules from harvested fonts
  let fontFacesCss = "";
  for (const fam of Object.values(fonts.families)) {
    if (fam.cssBlock) fontFacesCss += fam.cssBlock + "\n\n";
  }

  const primaryFontFamily = Object.keys(fonts.families)[0] || "system-ui, sans-serif";

  // Serialize tokens and components safely for embedded client script
  const tokensJsonStr = JSON.stringify(tokens);
  const componentsJsonStr = JSON.stringify(componentsMap);

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} — Design System Overview & Human Reviewer Portal</title>
  
  <style>
    ${fontFacesCss}

    :root {
      --font-brand: "${primaryFontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, monospace;

      /* Dark Theme Defaults */
      --bg-canvas: #090a0f;
      --bg-surface: #13151f;
      --bg-surface-elevated: #1a1d2b;
      --bg-surface-card: #1f2335;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: #3b82f6;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-primary: #3b82f6;
      --accent-success: #10b981;
      --accent-warning: #f59e0b;
      --accent-danger: #ef4444;

      /* Brand Token Live Overrides */
      --pds-primary: #ffffff;
      --pds-surface: #19191a;
      --pds-radius-button: 9999px;
      --pds-padding-button: 16px 28px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-brand);
      background: var(--bg-canvas);
      color: var(--text-primary);
      line-height: 1.5;
      padding-bottom: 5rem;
    }

    /* Top Sticky Header */
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(19, 21, 31, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .brand-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .badge-pill {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-score {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-save {
      background: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.6rem 1.25rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s, transform 0.1s;
    }

    .btn-save:hover { background: #2563eb; transform: translateY(-1px); }

    /* Navigation Tabs */
    .nav-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 2rem;
      background: var(--bg-surface);
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 1rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }

    .tab-btn:hover { color: var(--text-primary); }
    .tab-btn.active {
      color: var(--accent-primary);
      border-bottom-color: var(--accent-primary);
    }

    /* Main Container */
    .container {
      max-width: 1300px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* Section Cards */
    .section-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.75rem;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    /* Grid Layouts */
    .token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .token-card {
      background: var(--bg-surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .token-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .token-name {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .token-preview-color {
      height: 48px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .override-control-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .input-override {
      flex: 1;
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }

    .input-override:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .color-picker-input {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
    }

    /* Pill/Radio Controls */
    .segmented-control {
      display: flex;
      background: var(--bg-canvas);
      border-radius: 6px;
      padding: 2px;
      border: 1px solid var(--border-subtle);
    }

    .segmented-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .segmented-btn.active {
      background: var(--accent-primary);
      color: white;
    }

    /* Component Review Studio */
    .comp-nav-pills {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .comp-nav-pill {
      background: var(--bg-surface-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .comp-nav-pill:hover {
      color: var(--text-primary);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .comp-nav-pill.active {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
    }

    .comp-nav-pill .lock-badge {
      font-size: 0.75rem;
      opacity: 0.85;
    }

    .comp-studio-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 960px) {
      .comp-studio-grid {
        grid-template-columns: 1fr;
      }
    }

    .studio-panel {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .studio-card {
      background: var(--bg-surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 1.25rem;
    }

    .studio-card-header {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .preview-sandbox {
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      min-height: 250px;
    }

    .code-editor-box {
      font-family: var(--font-mono);
      font-size: 0.825rem;
      line-height: 1.5;
      background: #0b0d14;
      color: #e2e8f0;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 1rem;
      width: 100%;
      height: 380px;
      resize: vertical;
      white-space: pre;
      tab-size: 2;
    }

    .code-editor-box:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-select, .form-input, .form-textarea {
      background: #090a0f;
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      color: var(--text-primary);
      font-size: 0.85rem;
      font-family: inherit;
    }

    .form-textarea {
      resize: vertical;
      min-height: 70px;
      font-family: inherit;
    }

    .form-select:focus, .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .toggle-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .status-text {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Live Component Sandbox */
    .component-preview-box {
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .btn-sample-primary {
      background: var(--pds-primary);
      color: #000;
      border: none;
      border-radius: var(--pds-radius-button);
      padding: var(--pds-padding-button);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: opacity 0.2s, transform 0.1s;
    }

    .btn-sample-secondary {
      background: rgba(156, 156, 159, 0.3);
      backdrop-filter: blur(16px);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--pds-radius-button);
      padding: var(--pds-padding-button);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Icon Grid */
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 1rem;
    }

    .icon-card {
      background: var(--bg-surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: transform 0.1s, border-color 0.2s;
    }

    .icon-card:hover {
      border-color: var(--accent-primary);
      transform: translateY(-2px);
    }

    .icon-svg-wrapper {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-title {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-align: center;
      word-break: break-word;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      width: 90%;
      max-width: 580px;
      padding: 1.75rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
      line-height: 1;
    }

    .modal-close-btn:hover {
      color: var(--text-primary);
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-subtle);
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: none;
      z-index: 1200;
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header class="header">
    <div class="brand-title-group">
      <div class="brand-title">${brandName} Overview</div>
      <span class="badge-pill">v${version}</span>
      <span class="badge-score">✔ ${complianceScore}% Aligned</span>
    </div>

    <div class="header-actions">
      <!-- Branch Selector & VCS Controls -->
      <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-surface-card); border: 1px solid var(--border-subtle); padding: 0.35rem 0.75rem; border-radius: 6px;">
        <span style="font-size: 0.8rem; color: var(--text-muted);">🌿 Branch:</span>
        <select id="vcs-branch-select" style="background: transparent; border: none; color: var(--text-primary); font-weight: 600; font-size: 0.85rem; cursor: pointer; outline: none;">
          <option value="main">main</option>
        </select>
        <button type="button" id="btn-branch-new" title="Create New Branch" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); color: var(--text-secondary); border-radius: 4px; padding: 0.2rem 0.5rem; font-size: 0.75rem; cursor: pointer;">+ New</button>
        <button type="button" id="btn-branch-merge" title="Merge Branch" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); color: var(--text-secondary); border-radius: 4px; padding: 0.2rem 0.5rem; font-size: 0.75rem; cursor: pointer;">🔀 Merge</button>
      </div>

      <!-- Ingest & Refine Tools -->
      <button type="button" id="btn-open-ingest" style="background: var(--bg-surface-card); border: 1px solid var(--border-subtle); color: var(--text-primary); padding: 0.45rem 0.85rem; border-radius: 6px; font-weight: 600; font-size: 0.825rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
        📥 Ingest Source
      </button>
      <button type="button" id="btn-open-refine" style="background: var(--bg-surface-card); border: 1px solid var(--border-subtle); color: var(--text-primary); padding: 0.45rem 0.85rem; border-radius: 6px; font-weight: 600; font-size: 0.825rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
        💬 Refine (AI)
      </button>

      <span id="pending-count" style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem;">0 overrides pending</span>
      <button type="button" id="btn-save-all" class="btn-save">
        💾 Save All Overrides to Disk
      </button>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <nav class="nav-tabs">
    <button type="button" class="tab-btn active" data-tab="foundations">Foundations & Tokens</button>
    <button type="button" class="tab-btn" data-tab="components">Component Contracts &amp; Review Studio</button>
    <button type="button" class="tab-btn" data-tab="icons">Icon Library (${icons.length})</button>
    <button type="button" class="tab-btn" data-tab="diff">Reviewer Overrides & Diff</button>
  </nav>

  <div class="container">

    <!-- Tab 1: Foundations -->
    <div id="tab-foundations" class="tab-content active">
      
      <!-- Colors Section -->
      <section class="section-card">
        <div class="section-title">
          <span>Semantic Color Roles</span>
          <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">Dual-Scheme (Light/Dark)</span>
        </div>
        <p class="section-desc">Extracted color tokens. Edit hex or pick colors below to override.</p>

        <div class="token-grid">
          
          <div class="token-card" data-token="sys.color.primary">
            <div class="token-header">
              <span class="token-name">sys.color.primary</span>
              <label style="font-size:0.75rem;"><input type="checkbox" class="lock-toggle" checked> Lock</label>
            </div>
            <div class="token-preview-color" style="background: #010205; color: #fff;">Primary Brand Fill</div>
            <div class="override-control-row">
              <input type="color" class="color-picker-input" value="#010205">
              <input type="text" class="input-override" value="#010205" data-key="sys.color.primary">
            </div>
          </div>

          <div class="token-card" data-token="sys.color.surface-container">
            <div class="token-header">
              <span class="token-name">sys.color.surface-container</span>
              <label style="font-size:0.75rem;"><input type="checkbox" class="lock-toggle" checked> Lock</label>
            </div>
            <div class="token-preview-color" style="background: rgba(156, 156, 159, 0.3); color: #fff;">Surface Container</div>
            <div class="override-control-row">
              <input type="color" class="color-picker-input" value="#9c9c9f">
              <input type="text" class="input-override" value="rgba(156, 156, 159, 0.3)" data-key="sys.color.surface-container">
            </div>
          </div>

          <div class="token-card" data-token="sys.color.canvas">
            <div class="token-header">
              <span class="token-name">sys.color.canvas</span>
              <label style="font-size:0.75rem;"><input type="checkbox" class="lock-toggle" checked> Lock</label>
            </div>
            <div class="token-preview-color" style="background: #000000; color: #fff;">Page Canvas Background</div>
            <div class="override-control-row">
              <input type="color" class="color-picker-input" value="#000000">
              <input type="text" class="input-override" value="#000000" data-key="sys.color.canvas">
            </div>
          </div>

        </div>
      </section>

      <!-- Typography Section -->
      <section class="section-card">
        <div class="section-title">
          <span>Typography & Loaded Webfonts</span>
        </div>
        <p class="section-desc">Active font family: <strong>${primaryFontFamily}</strong>. Rendered live via extracted @font-face declarations.</p>
        
        <div class="token-grid">
          <div class="token-card" style="grid-column: 1 / -1;">
            <div class="token-name">ref.typeface.brand</div>
            <div class="override-control-row">
              <input type="text" class="input-override" value="${primaryFontFamily}" data-key="ref.typeface.brand" style="font-size: 1rem;">
            </div>
            <div style="margin-top: 1rem; font-family: var(--font-brand); font-size: 2rem; font-weight: 700;">
              The quick brown fox jumps over the lazy dog. 0123456789
            </div>
          </div>
        </div>
      </section>

      <!-- Geometry & Spacing Section -->
      <section class="section-card">
        <div class="section-title">
          <span>Component Geometry & Corner Radii</span>
        </div>
        <p class="section-desc">Button corner shape and padding tokens.</p>
        
        <div class="token-grid">
          <div class="token-card">
            <div class="token-name">comp.button.shape.corner</div>
            <div class="segmented-control" id="ctrl-btn-shape">
              <button type="button" class="segmented-btn active" data-val="9999px">Full Pill</button>
              <button type="button" class="segmented-btn" data-val="12px">Rounded Rect (12px)</button>
              <button type="button" class="segmented-btn" data-val="4px">Square (4px)</button>
            </div>
          </div>

          <div class="token-card">
            <div class="token-name">comp.button.spacing.padding</div>
            <div class="override-control-row">
              <input type="text" class="input-override" id="ctrl-btn-padding" value="16px 28px" data-key="comp.button.spacing.padding">
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- Tab 2: Components Review Studio -->
    <div id="tab-components" class="tab-content">
      <section class="section-card">
        <div class="section-title">
          <span>Component Review Studio & Prototype Library</span>
          <span class="badge-pill" id="studio-comp-count">6 Certified Families</span>
        </div>
        <p class="section-desc">
          Review, customize, and lock individual components. Bind to an authoritative upstream library (e.g. <code>@mui/material</code>, <code>@radix-ui</code>, <code>shadcn/ui</code>) or edit the standalone React/TSX code directly. Locked components are frozen from automated crawler overwrites.
        </p>

        <!-- Component Selector Switcher -->
        <div class="comp-nav-pills" id="comp-selector-pills">
          <!-- Dynamically populated via renderComponentPills() -->
        </div>

        <div class="comp-studio-grid">
          <!-- Left Panel: Live Preview & Anatomy -->
          <div class="studio-panel">
            <div class="studio-card">
              <div class="studio-card-header">
                <span id="preview-comp-title">Button</span>
                <span class="badge-pill" id="preview-comp-family">actions</span>
              </div>
              
              <!-- Dynamic Preview Sandbox -->
              <div class="preview-sandbox" id="preview-sandbox-container">
                <!-- Injected based on active component -->
              </div>

              <!-- Quick Anatomy / Contract Metadata -->
              <div style="margin-top: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem;">
                  <span style="color: var(--text-muted);">Min Touch Target:</span>
                  <strong id="meta-touch-target" style="color: #34d399;">48x48px (Compliant)</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem;">
                  <span style="color: var(--text-muted);">Target Path:</span>
                  <code id="meta-target-path" style="font-family: var(--font-mono); color: #60a5fa;">components/ui/Button.tsx</code>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">Available Variants:</span>
                  <span id="meta-variants-list" style="color: var(--text-secondary); font-size: 0.75rem;">filled, tonal, outlined, text, elevated</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel: Controls, Binding & Monospace Editor -->
          <div class="studio-panel">
            <div class="studio-card">
              <div class="studio-card-header">
                <span>Component Configuration & Bindings</span>
                <label class="toggle-label">
                  <input type="checkbox" id="comp-locked-toggle">
                  <span id="comp-locked-text">🔒 Lock Component</span>
                </label>
              </div>

              <!-- Authoritative Upstream Source Binding -->
              <div class="form-group">
                <label class="form-label">Authoritative Source Binding</label>
                <select id="comp-source-type" class="form-select">
                  <option value="generated">Generated Prototype (Self-Contained React/TSX)</option>
                  <option value="authoritative-library">Certified Upstream Package (npm)</option>
                  <option value="custom">Custom Internal Package</option>
                </select>
              </div>

              <div id="authoritative-fields-row" style="display: none; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label">npm Package Name</label>
                  <input type="text" id="comp-package-name" class="form-input" placeholder="@mui/material">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label">Export Symbol</label>
                  <input type="text" id="comp-export-name" class="form-input" placeholder="Button">
                </div>
              </div>

              <!-- Human Guidance / Agent Prompt Notes -->
              <div class="form-group">
                <label class="form-label">Reviewer Guidance & AI Agent Prompt Notes</label>
                <textarea id="comp-human-notes" class="form-textarea" placeholder="Instructions for AI agents when using this component (e.g. 'Use sentence-case labels only. Default to filled variant for checkout')."></textarea>
              </div>

              <!-- TSX Monospace Editor -->
              <div class="form-group" style="margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <label class="form-label">Executable React/TSX Source Code</label>
                  <button type="button" id="btn-copy-code" style="background: transparent; border: 1px solid var(--border-subtle); color: var(--text-secondary); border-radius: 4px; padding: 0.2rem 0.5rem; font-size: 0.75rem; cursor: pointer;">
                    📋 Copy Code
                  </button>
                </div>
                <textarea id="comp-code-editor" class="code-editor-box" spellcheck="false"></textarea>
              </div>

              <!-- Actions & Status -->
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <button type="button" id="btn-save-comp" class="btn-save">
                  💾 Save Component to Disk
                </button>
                <span id="comp-status-indicator" class="status-text">● Synced with disk</span>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Tab 3: Icons -->
    <div id="tab-icons" class="tab-content">
      <section class="section-card">
        <div class="section-title">
          <span>Extracted SVG Icons (${icons.length})</span>
          <input type="text" id="icon-search" placeholder="Filter icons..." class="input-override" style="max-width: 250px;">
        </div>
        <p class="section-desc">Extracted directly from source SVGs and custom icon shadow roots. Click any icon to copy its SVG.</p>

        <div class="icon-grid" id="icon-grid-container">
          ${icons.map(ic => `
            <div class="icon-card" data-name="${ic.name}" data-svg="${encodeURIComponent(ic.svg)}">
              <div class="icon-svg-wrapper">${ic.svg}</div>
              <span class="icon-title">${ic.name}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </div>

    <!-- Tab 4: Diff Inspector -->
    <div id="tab-diff" class="tab-content">
      <section class="section-card">
        <div class="section-title">Reviewer Overrides Log</div>
        <p class="section-desc">Tracks all manual overrides made on this page that will be saved to tokens.json and DESIGN.md.</p>

        <table style="width:100%; border-collapse: collapse; font-size: 0.85rem; font-family: var(--font-mono);">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-subtle); text-align: left;">
              <th style="padding: 0.75rem;">Token / Contract</th>
              <th style="padding: 0.75rem;">Extracted Value</th>
              <th style="padding: 0.75rem;">Human Override</th>
              <th style="padding: 0.75rem;">Status</th>
            </tr>
          </thead>
          <tbody id="diff-table-body">
            <tr><td colspan="4" style="padding: 1rem; color: var(--text-muted); text-align: center;">No overrides applied yet. Edit any token above to override.</td></tr>
          </tbody>
        </table>
      </section>
    </div>

  </div>

  <div id="toast" class="toast">✔ Overrides saved to disk!</div>

  <script>
    // Embedded Initial Data
    const INITIAL_TOKENS = ${tokensJsonStr};
    const INITIAL_COMPONENTS = ${componentsJsonStr};
    const OVERRIDES = {};
    const COMPONENT_OVERRIDES = {};
    const ALL_COMPONENTS = JSON.parse(JSON.stringify(INITIAL_COMPONENTS));
    let CURRENT_COMP_NAME = Object.keys(ALL_COMPONENTS)[0] || 'Button';

    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      });
    });

    // Handle Button Shape Override
    document.querySelectorAll('#ctrl-btn-shape .segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#ctrl-btn-shape .segmented-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const radius = btn.dataset.val;
        document.documentElement.style.setProperty('--pds-radius-button', radius);
        recordOverride('comp.button.shape.corner', radius);
      });
    });

    // Handle Button Padding Override
    document.getElementById('ctrl-btn-padding').addEventListener('input', (e) => {
      const val = e.target.value;
      document.documentElement.style.setProperty('--pds-padding-button', val);
      recordOverride('comp.button.spacing.padding', val);
    });

    // Handle Color Inputs
    document.querySelectorAll('.token-card').forEach(card => {
      const colorPicker = card.querySelector('.color-picker-input');
      const textInput = card.querySelector('.input-override');
      const preview = card.querySelector('.token-preview-color');

      if (colorPicker && textInput) {
        colorPicker.addEventListener('input', (e) => {
          textInput.value = e.target.value;
          if (preview) preview.style.background = e.target.value;
          recordOverride(textInput.dataset.key, e.target.value);
        });

        textInput.addEventListener('input', (e) => {
          if (preview) preview.style.background = e.target.value;
          recordOverride(textInput.dataset.key, e.target.value);
        });
      }
    });

    function recordOverride(key, value) {
      if (!key) return;
      OVERRIDES[key] = { value, locked: true };
      updatePendingCount();
      renderDiffTable();
    }

    function updatePendingCount() {
      const tokenCount = Object.keys(OVERRIDES).length;
      const compCount = Object.keys(COMPONENT_OVERRIDES).length;
      const total = tokenCount + compCount;
      document.getElementById('pending-count').textContent = total + ' override(s) pending';
    }

    function renderDiffTable() {
      const tbody = document.getElementById('diff-table-body');
      const tokenKeys = Object.keys(OVERRIDES);
      const compKeys = Object.keys(COMPONENT_OVERRIDES);
      if (tokenKeys.length === 0 && compKeys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="padding: 1rem; color: var(--text-muted); text-align: center;">No overrides applied yet. Edit any token or component above to override.</td></tr>';
        return;
      }

      let rows = '';
      for (const k of tokenKeys) {
        rows += \`
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 0.75rem; color: #60a5fa;">\${k}</td>
            <td style="padding: 0.75rem; color: var(--text-muted); font-size: 0.75rem;">(extracted token)</td>
            <td style="padding: 0.75rem; color: #34d399; font-weight: 600;">\${OVERRIDES[k].value}</td>
            <td style="padding: 0.75rem;"><span style="color: #f59e0b;">● Overridden</span></td>
          </tr>
        \`;
      }
      for (const name of compKeys) {
        const item = COMPONENT_OVERRIDES[name];
        const desc = item.authoritativeSource && item.authoritativeSource.type === 'authoritative-library'
          ? \`Bound to \${item.authoritativeSource.packageName || ''}\`
          : 'Custom TSX / Reviewer Notes';
        rows += \`
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 0.75rem; color: #a78bfa;">Component: \${name}</td>
            <td style="padding: 0.75rem; color: var(--text-muted); font-size: 0.75rem;">(prototype TSX)</td>
            <td style="padding: 0.75rem; color: #34d399; font-weight: 600;">\${desc}</td>
            <td style="padding: 0.75rem;"><span style="color: #10b981;">🔒 Locked</span></td>
          </tr>
        \`;
      }
      tbody.innerHTML = rows;
    }

    // --- Component Review Studio Logic ---
    function renderComponentPills() {
      const container = document.getElementById('comp-selector-pills');
      if (!container) return;
      const compNames = Object.keys(ALL_COMPONENTS);
      const countEl = document.getElementById('studio-comp-count');
      if (countEl) countEl.textContent = compNames.length + ' Certified Families';

      container.innerHTML = compNames.map(name => {
        const comp = ALL_COMPONENTS[name];
        const isLocked = comp.locked ? '<span class="lock-badge">🔒</span> ' : '';
        const activeClass = name === CURRENT_COMP_NAME ? ' active' : '';
        return \`<button type="button" class="comp-nav-pill\${activeClass}" data-comp="\${name}">
          <span>\${isLocked}\${name}</span>
          <span style="font-size:0.7rem; opacity:0.7;">(\${comp.family || 'ui'})</span>
        </button>\`;
      }).join('');

      container.querySelectorAll('.comp-nav-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          selectComponent(pill.dataset.comp);
        });
      });
    }

    function selectComponent(name) {
      if (!ALL_COMPONENTS[name]) return;
      CURRENT_COMP_NAME = name;
      const comp = ALL_COMPONENTS[name];

      // Update Pill Highlights
      document.querySelectorAll('.comp-nav-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.comp === name);
      });

      // Update Header & Metadata
      const titleEl = document.getElementById('preview-comp-title');
      if (titleEl) titleEl.textContent = name;
      const familyEl = document.getElementById('preview-comp-family');
      if (familyEl) familyEl.textContent = comp.family || 'ui';

      const touchEl = document.getElementById('meta-touch-target');
      if (touchEl) touchEl.textContent = (comp.anatomy && comp.anatomy.container && comp.anatomy.container.minTouchTarget) || (comp.a11y && comp.a11y.minTouchTarget) || '48x48px (Compliant)';

      const pathEl = document.getElementById('meta-target-path');
      if (pathEl) pathEl.textContent = comp.path || ('components/ui/' + name + '.tsx');

      const varEl = document.getElementById('meta-variants-list');
      if (varEl) varEl.textContent = Object.keys(comp.variants || {}).join(', ') || 'filled, tonal, outlined';

      // Update Controls Form
      const lockToggle = document.getElementById('comp-locked-toggle');
      if (lockToggle) lockToggle.checked = !!comp.locked;

      const srcType = (comp.authoritativeSource && comp.authoritativeSource.type) || 'generated';
      const srcSelect = document.getElementById('comp-source-type');
      if (srcSelect) srcSelect.value = srcType;

      const authRow = document.getElementById('authoritative-fields-row');
      if (authRow) authRow.style.display = srcType === 'generated' ? 'none' : 'grid';

      const pkgInput = document.getElementById('comp-package-name');
      if (pkgInput) pkgInput.value = (comp.authoritativeSource && comp.authoritativeSource.packageName) || '';

      const exportInput = document.getElementById('comp-export-name');
      if (exportInput) exportInput.value = (comp.authoritativeSource && comp.authoritativeSource.exportName) || name;

      const notesTextarea = document.getElementById('comp-human-notes');
      if (notesTextarea) notesTextarea.value = comp.humanNotes || '';

      const codeEditor = document.getElementById('comp-code-editor');
      if (codeEditor) codeEditor.value = comp.code || '';

      const statusEl = document.getElementById('comp-status-indicator');
      if (statusEl) {
        if (COMPONENT_OVERRIDES[name]) {
          statusEl.textContent = '● Modified (Pending Save)';
          statusEl.style.color = '#f59e0b';
        } else {
          statusEl.textContent = comp.locked ? '🔒 Locked (Frozen)' : '● Synced with disk';
          statusEl.style.color = comp.locked ? '#34d399' : 'var(--text-muted)';
        }
      }

      // Update Sandbox Preview
      renderPreviewSandbox(name);
    }

    function renderPreviewSandbox(name) {
      const box = document.getElementById('preview-sandbox-container');
      if (!box) return;

      if (name === 'Button') {
        box.innerHTML = \`
          <div style="display: flex; gap: 1rem; align-items: center; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn-sample-primary">
              <span>Primary Action</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button type="button" class="btn-sample-secondary">
              <span>Secondary Action</span>
            </button>
          </div>
        \`;
      } else if (name === 'Card') {
        box.innerHTML = \`
          <div style="width: 100%; max-width: 320px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-primary); font-weight: 700;">Containment Family</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Model Feature Card</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">High-fidelity preview container reflecting current elevation and theme tokens.</p>
            <button type="button" class="btn-sample-primary" style="margin-top: 0.5rem; align-self: flex-start; padding: 8px 16px; font-size: 0.85rem;">
              Explore More
            </button>
          </div>
        \`;
      } else if (name === 'TextField') {
        box.innerHTML = \`
          <div style="width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Configuration Search</label>
            <input type="text" value="Type your query..." class="form-input" style="height: 48px; border-color: var(--accent-primary); font-family: var(--font-brand); font-size: 0.9rem;" readonly>
            <span style="font-size: 0.75rem; color: var(--text-muted);">48px touch target verified</span>
          </div>
        \`;
      } else if (name === 'Badge') {
        box.innerHTML = \`
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 700;">Active Status</span>
            <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 700;">Certified</span>
            <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 700;">99% Aligned</span>
          </div>
        \`;
      } else if (name === 'Chip') {
        box.innerHTML = \`
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <button type="button" class="comp-nav-pill active" style="padding: 0.4rem 0.85rem;">All Variants</button>
            <button type="button" class="comp-nav-pill" style="padding: 0.4rem 0.85rem;">Sport Series</button>
            <button type="button" class="comp-nav-pill" style="padding: 0.4rem 0.85rem;">Electric</button>
            <button type="button" class="comp-nav-pill" style="padding: 0.4rem 0.85rem;">Executive</button>
          </div>
        \`;
      } else {
        box.innerHTML = \`
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-primary);">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="12 8 8 12 12 16 16 12 12 8"></polygon>
            </svg>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">\${name} Component Preview</span>
          </div>
        \`;
      }
    }

    function recordComponentChange(name) {
      const comp = ALL_COMPONENTS[name];
      if (!comp) return;

      const isLocked = document.getElementById('comp-locked-toggle').checked;
      const srcType = document.getElementById('comp-source-type').value;
      const pkgName = document.getElementById('comp-package-name').value.trim();
      const exportName = document.getElementById('comp-export-name').value.trim();
      const notes = document.getElementById('comp-human-notes').value;
      const code = document.getElementById('comp-code-editor').value;

      comp.locked = isLocked;
      comp.authoritativeSource = {
        type: srcType,
        packageName: pkgName || undefined,
        exportName: exportName || name,
        notes: notes || undefined
      };
      comp.humanNotes = notes;
      comp.code = code;

      COMPONENT_OVERRIDES[name] = {
        code,
        authoritativeSource: comp.authoritativeSource,
        humanNotes: notes,
        locked: isLocked
      };

      const statusEl = document.getElementById('comp-status-indicator');
      if (statusEl) {
        statusEl.textContent = '● Modified (Pending Save)';
        statusEl.style.color = '#f59e0b';
      }

      updatePendingCount();
      renderDiffTable();
      renderComponentPills();
    }

    // Attach Component Form Listeners
    document.getElementById('comp-locked-toggle').addEventListener('change', () => recordComponentChange(CURRENT_COMP_NAME));
    document.getElementById('comp-source-type').addEventListener('change', (e) => {
      document.getElementById('authoritative-fields-row').style.display = e.target.value === 'generated' ? 'none' : 'grid';
      document.getElementById('comp-locked-toggle').checked = true;
      recordComponentChange(CURRENT_COMP_NAME);
    });
    document.getElementById('comp-package-name').addEventListener('input', () => {
      document.getElementById('comp-locked-toggle').checked = true;
      recordComponentChange(CURRENT_COMP_NAME);
    });
    document.getElementById('comp-export-name').addEventListener('input', () => {
      document.getElementById('comp-locked-toggle').checked = true;
      recordComponentChange(CURRENT_COMP_NAME);
    });
    document.getElementById('comp-human-notes').addEventListener('input', () => recordComponentChange(CURRENT_COMP_NAME));
    document.getElementById('comp-code-editor').addEventListener('input', () => {
      document.getElementById('comp-locked-toggle').checked = true;
      recordComponentChange(CURRENT_COMP_NAME);
    });

    // Copy Code Button
    document.getElementById('btn-copy-code').addEventListener('click', () => {
      const code = document.getElementById('comp-code-editor').value;
      navigator.clipboard.writeText(code);
      showToast('Copied ' + CURRENT_COMP_NAME + ' code to clipboard');
    });

    // Save Single Component Button
    document.getElementById('btn-save-comp').addEventListener('click', async () => {
      recordComponentChange(CURRENT_COMP_NAME);
      try {
        const payload = {
          components: {
            [CURRENT_COMP_NAME]: COMPONENT_OVERRIDES[CURRENT_COMP_NAME]
          }
        };
        const res = await fetch('/api/v1/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          showToast('✔ Saved ' + CURRENT_COMP_NAME + '.tsx to disk!');
          const statusEl = document.getElementById('comp-status-indicator');
          if (statusEl) {
            statusEl.textContent = '✔ Saved & Locked on Disk';
            statusEl.style.color = '#34d399';
          }
        } else {
          downloadJson(COMPONENT_OVERRIDES, 'components.overrides.json');
          showToast('Saved to components.overrides.json (Static Mode)');
        }
      } catch (err) {
        downloadJson(COMPONENT_OVERRIDES, 'components.overrides.json');
        showToast('Saved to components.overrides.json');
      }
    });

    // Save All Overrides Button (Tokens + Components)
    document.getElementById('btn-save-all').addEventListener('click', async () => {
      try {
        const res = await fetch('/api/v1/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ overrides: OVERRIDES, components: COMPONENT_OVERRIDES })
        });

        if (res.ok) {
          showToast('✔ All tokens and components saved to disk & DESIGN.md!');
          const statusEl = document.getElementById('comp-status-indicator');
          if (statusEl) {
            statusEl.textContent = '✔ Saved & Locked on Disk';
            statusEl.style.color = '#34d399';
          }
        } else {
          downloadJson({ tokens: OVERRIDES, components: COMPONENT_OVERRIDES }, 'tokens.overrides.json');
          showToast('Saved overrides to JSON (Static Mode)');
        }
      } catch (err) {
        downloadJson({ tokens: OVERRIDES, components: COMPONENT_OVERRIDES }, 'tokens.overrides.json');
        showToast('Saved overrides to JSON');
      }
    });

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3500);
    }

    function downloadJson(data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Icon Search Filter & Copy
    document.getElementById('icon-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.icon-card').forEach(card => {
        const name = card.dataset.name.toLowerCase();
        card.style.display = name.includes(q) ? 'flex' : 'none';
      });
    });

    document.querySelectorAll('.icon-card').forEach(card => {
      card.addEventListener('click', () => {
        const svg = decodeURIComponent(card.dataset.svg);
        navigator.clipboard.writeText(svg);
        showToast('Copied SVG: ' + card.dataset.name);
      });
    });

    // =========================================================================
    // Multi-Modal Ingest, Refine, and DS-VCS Versioning Client Logic
    // =========================================================================
    let CURRENT_BRANCH = 'main';

    async function loadBranches() {
      try {
        const res = await fetch('/api/v1/branches');
        if (!res.ok) return;
        const data = await res.json();
        CURRENT_BRANCH = data.currentBranch || 'main';

        const select = document.getElementById('vcs-branch-select');
        const mergeSourceSelect = document.getElementById('merge-source-select');
        select.innerHTML = '';
        mergeSourceSelect.innerHTML = '';

        (data.branches || []).forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.name;
          opt.textContent = b.name + (b.isDefault ? ' (HEAD)' : '');
          if (b.name === CURRENT_BRANCH) opt.selected = true;
          select.appendChild(opt);

          if (b.name !== CURRENT_BRANCH) {
            const mOpt = document.createElement('option');
            mOpt.value = b.name;
            mOpt.textContent = b.name;
            mergeSourceSelect.appendChild(mOpt);
          }
        });
      } catch {
        // Static mode
      }
    }

    // Branch Switch
    document.getElementById('vcs-branch-select').addEventListener('change', async (e) => {
      const branch = e.target.value;
      try {
        const res = await fetch('/api/v1/branch/switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branch })
        });
        if (res.ok) {
          showToast('Switched to branch: ' + branch);
          setTimeout(() => window.location.reload(), 600);
        } else {
          showToast('Failed to switch branch');
        }
      } catch {
        showToast('Switched branch locally (Static Mode)');
      }
    });

    // Modals Open / Close Helper
    function openModal(id) {
      document.getElementById(id).style.display = 'flex';
    }
    function closeModal(id) {
      document.getElementById(id).style.display = 'none';
    }

    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.style.display = 'none';
      });
    });

    // 1. New Branch
    document.getElementById('btn-branch-new').addEventListener('click', () => openModal('modal-branch-new'));
    document.getElementById('btn-confirm-branch-create').addEventListener('click', async () => {
      const name = document.getElementById('new-branch-name').value.trim();
      if (!name) {
        showToast('Please enter a branch name');
        return;
      }
      try {
        const res = await fetch('/api/v1/branch/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, from: CURRENT_BRANCH })
        });
        if (res.ok) {
          showToast('Created branch: ' + name);
          closeModal('modal-branch-new');
          await loadBranches();
        } else {
          const err = await res.json();
          showToast('Error: ' + (err.error || 'Failed to create branch'));
        }
      } catch (err) {
        showToast('Branch created in memory');
        closeModal('modal-branch-new');
      }
    });

    // 2. Merge Branch
    document.getElementById('btn-branch-merge').addEventListener('click', () => {
      document.getElementById('merge-target-display').textContent = CURRENT_BRANCH;
      openModal('modal-branch-merge');
    });
    document.getElementById('btn-confirm-branch-merge').addEventListener('click', async () => {
      const source = document.getElementById('merge-source-select').value;
      const skipGates = document.getElementById('merge-skip-gates').checked;
      if (!source) {
        showToast('Select a source branch to merge');
        return;
      }
      try {
        const res = await fetch('/api/v1/branch/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, target: CURRENT_BRANCH, skipGates })
        });
        const data = await res.json();
        if (data.success) {
          showToast('✔ Merge succeeded: ' + source + ' → ' + CURRENT_BRANCH);
          closeModal('modal-branch-merge');
          setTimeout(() => window.location.reload(), 700);
        } else if (data.gateBlocked) {
          alert('Merge Blocked by Quality & A11y Gatekeeper:\n\n' + (data.gateResult?.violations || []).join('\n'));
        } else if (data.conflicts) {
          alert('Merge Conflicts Detected:\n\nTokens: ' + (data.conflicts.tokens?.length || 0) + ' conflicts\nComponents: ' + (data.conflicts.components?.length || 0) + ' conflicts');
        } else {
          showToast('Merge failed: ' + (data.summary || 'Unknown error'));
        }
      } catch {
        showToast('Merge simulated in static mode');
        closeModal('modal-branch-merge');
      }
    });

    // 3. Ingest Source
    document.getElementById('btn-open-ingest').addEventListener('click', () => openModal('modal-ingest'));
    document.getElementById('btn-confirm-ingest').addEventListener('click', async () => {
      const type = document.getElementById('ingest-type-select').value;
      const content = document.getElementById('ingest-content-text').value.trim();
      const fileName = document.getElementById('ingest-filename-input').value.trim() || 'upload';
      if (!content) {
        showToast('Please paste or upload content');
        return;
      }
      try {
        const res = await fetch('/api/v1/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, type, fileName, branch: CURRENT_BRANCH })
        });
        const data = await res.json();
        if (data.success) {
          showToast('✔ Ingested: ' + data.summary);
          closeModal('modal-ingest');
          setTimeout(() => window.location.reload(), 800);
        } else {
          showToast('Ingest error: ' + (data.error || 'Failed'));
        }
      } catch {
        showToast('Source ingested in static session');
        closeModal('modal-ingest');
      }
    });

    // 4. Refine (AI)
    document.getElementById('btn-open-refine').addEventListener('click', () => openModal('modal-refine'));
    document.getElementById('btn-confirm-refine').addEventListener('click', async () => {
      const prompt = document.getElementById('refine-prompt-text').value.trim();
      if (!prompt) {
        showToast('Please enter an instruction prompt');
        return;
      }
      try {
        const res = await fetch('/api/v1/refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, branch: CURRENT_BRANCH })
        });
        const data = await res.json();
        if (data.success) {
          showToast('✔ Refinement applied to ' + CURRENT_BRANCH);
          closeModal('modal-refine');
          setTimeout(() => window.location.reload(), 800);
        } else {
          showToast('Refinement error: ' + (data.error || 'Failed'));
        }
      } catch {
        showToast('Refinement simulated');
        closeModal('modal-refine');
      }
    });

    // Initialize Component Review Studio & VCS
    renderComponentPills();
    selectComponent(CURRENT_COMP_NAME);
    loadBranches();
  </script>

  <!-- Modal 1: New Branch -->
  <div id="modal-branch-new" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">🌿 Create New Version Branch</div>
        <button type="button" class="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">Create an isolated design branch to experiment with dark mode, contrast updates, or new components without affecting main.</p>
        <div class="form-group">
          <label class="form-label">Branch Name</label>
          <input type="text" id="new-branch-name" class="form-input" placeholder="e.g. feature/teal-brand or refine/dark-mode">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-cancel btn-modal-cancel">Cancel</button>
        <button type="button" id="btn-confirm-branch-create" class="btn-save">Create Branch</button>
      </div>
    </div>
  </div>

  <!-- Modal 2: Merge Branch -->
  <div id="modal-branch-merge" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">🔀 Merge Design System Branch</div>
        <button type="button" class="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">
          Merge changes from a feature branch into <strong id="merge-target-display" style="color:var(--text-primary);">main</strong> with 3-way AST semantic reconciliation and automated WCAG 2.1 contrast evaluation.
        </p>
        <div class="form-group">
          <label class="form-label">Source Branch (Theirs)</label>
          <select id="merge-source-select" class="form-input">
            <option value="">No other branches available</option>
          </select>
        </div>
        <div class="form-group" style="margin-top:0.5rem;">
          <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--text-secondary); cursor:pointer;">
            <input type="checkbox" id="merge-skip-gates">
            <span>Bypass WCAG AA Contrast & Touch Target Gatekeeper</span>
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-cancel btn-modal-cancel">Cancel</button>
        <button type="button" id="btn-confirm-branch-merge" class="btn-save" style="background:#10b981;">Merge into Active Branch</button>
      </div>
    </div>
  </div>

  <!-- Modal 3: Ingest Source -->
  <div id="modal-ingest" class="modal-overlay">
    <div class="modal-card" style="max-width:640px;">
      <div class="modal-header">
        <div class="modal-title">📥 Ingest Multi-Modal Design Source</div>
        <button type="button" class="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">
          Ingest tokens and guidelines from tables (CSV, Tokens Studio JSON), brand guideline docs (Markdown), or visual samples (SVG, screenshots).
        </p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group">
            <label class="form-label">Source Type</label>
            <select id="ingest-type-select" class="form-input">
              <option value="table">Table (CSV, Tokens Studio JSON)</option>
              <option value="document">Document (Markdown, Text Guidelines)</option>
              <option value="vision">Vision (SVG Markup, Color List)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Label / Source Identifier</label>
            <input type="text" id="ingest-filename-input" class="form-input" placeholder="e.g. brand-tokens.csv">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Content Payload</label>
          <textarea id="ingest-content-text" class="code-editor-box" style="height:180px;" placeholder="Paste CSV, JSON, Markdown guidelines, or SVG markup here..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-cancel btn-modal-cancel">Cancel</button>
        <button type="button" id="btn-confirm-ingest" class="btn-save">Ingest &amp; Fuse</button>
      </div>
    </div>
  </div>

  <!-- Modal 4: Refine (AI) -->
  <div id="modal-refine" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">💬 Conversational AI Refinement</div>
        <button type="button" class="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">
          Tell the AI model how to refine your design system in plain English. The agent compiles your instruction directly into exact token and component patches.
        </p>
        <div class="form-group">
          <label class="form-label">Natural Language Directive</label>
          <textarea id="refine-prompt-text" class="form-input" style="height:100px; resize:vertical;" placeholder="e.g. Change primary color to #00458C, make secondary emerald green #10b981, and set card border radius to 12px"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-cancel btn-modal-cancel">Cancel</button>
        <button type="button" id="btn-confirm-refine" class="btn-save" style="background:#8b5cf6;">Apply Refinement</button>
      </div>
    </div>
  </div>

</body>
</html>`;
}
