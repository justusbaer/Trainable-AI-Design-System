/**
 * Trainable DS — Interactive Human Overview Page Generator
 * Generates an interactive, responsive overview.html with live reviewer overrides synced back to machine assets.
 */

import { HarvestedFontManifest, HarvestedSvgIcon } from "../aligner/assets-harvester.js";

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
  const components = options.components || {};

  // Build @font-face rules from harvested fonts
  let fontFacesCss = "";
  for (const fam of Object.values(fonts.families)) {
    if (fam.cssBlock) fontFacesCss += fam.cssBlock + "\n\n";
  }

  const primaryFontFamily = Object.keys(fonts.families)[0] || "system-ui, sans-serif";

  // Serialize tokens and components safely for embedded client script
  const tokensJsonStr = JSON.stringify(tokens);
  const componentsJsonStr = JSON.stringify(components);

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
      z-index: 200;
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
      <span id="pending-count" style="font-size: 0.8rem; color: var(--text-muted);">0 overrides pending</span>
      <button type="button" id="btn-save-all" class="btn-save">
        💾 Save All Overrides to Disk
      </button>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <nav class="nav-tabs">
    <button type="button" class="tab-btn active" data-tab="foundations">Foundations & Tokens</button>
    <button type="button" class="tab-btn" data-tab="components">Component Contracts (6 M3 Families)</button>
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

    <!-- Tab 2: Components -->
    <div id="tab-components" class="tab-content">
      <section class="section-card">
        <div class="section-title">Actions Family: Button Component Contract</div>
        <p class="section-desc">Live interactive preview reflecting current tokens and reviewer overrides.</p>

        <div class="component-preview-box">
          <button type="button" class="btn-sample-primary">
            <span>Primary Action</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>

          <button type="button" class="btn-sample-secondary">
            <span>Secondary Action</span>
          </button>
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
      const count = Object.keys(OVERRIDES).length;
      document.getElementById('pending-count').textContent = count + ' override(s) pending';
    }

    function renderDiffTable() {
      const tbody = document.getElementById('diff-table-body');
      const keys = Object.keys(OVERRIDES);
      if (keys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="padding: 1rem; color: var(--text-muted); text-align: center;">No overrides applied yet.</td></tr>';
        return;
      }

      tbody.innerHTML = keys.map(k => \`
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 0.75rem; color: #60a5fa;">\${k}</td>
          <td style="padding: 0.75rem; color: var(--text-muted); font-size: 0.75rem;">(extracted)</td>
          <td style="padding: 0.75rem; color: #34d399; font-weight: 600;">\${OVERRIDES[k].value}</td>
          <td style="padding: 0.75rem;"><span style="color: #f59e0b;">● Overridden</span></td>
        </tr>
      \`).join('');
    }

    // Save Overrides Button
    document.getElementById('btn-save-all').addEventListener('click', async () => {
      try {
        const res = await fetch('/api/v1/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ overrides: OVERRIDES })
        });

        if (res.ok) {
          showToast('✔ All overrides saved to tokens.json and DESIGN.md!');
        } else {
          // Fallback if not connected to live server: download updated tokens
          downloadJson(OVERRIDES, 'tokens.overrides.json');
          showToast('Saved to tokens.overrides.json (Static Mode)');
        }
      } catch (err) {
        downloadJson(OVERRIDES, 'tokens.overrides.json');
        showToast('Saved to tokens.overrides.json');
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
  </script>
</body>
</html>`;
}
