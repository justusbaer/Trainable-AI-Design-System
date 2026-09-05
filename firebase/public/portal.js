/**
 * Trainable DS Portal Client
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAgentPrompt();
  loadTokens();
  loadComponents();
  initEvaluator();
  initCopyButtons();
});

// Toast notification
function showToast(message) {
  let toast = document.getElementById("toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notice";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Theme handling
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("tds-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("tds-theme", next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  }
}

// One-Prompt Agent Connect Box
function initAgentPrompt() {
  const codeEl = document.getElementById("agent-prompt-code");
  const copyBtn = document.getElementById("copy-agent-prompt");

  const origin = window.location.origin;
  const promptText = `Connect to Trainable DS from ${origin} and follow /DESIGN.md for all UI generation.`;

  if (codeEl) {
    codeEl.textContent = promptText;
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(promptText);
      showToast("Agent prompt copied to clipboard!");
    });
  }
}

// Load and render Tokens
async function loadTokens() {
  try {
    const res = await fetch("/tokens.json");
    if (!res.ok) return;
    const tokens = await res.json();

    renderTonalSpectrum(tokens);
    renderColorRoles(tokens);
  } catch (err) {
    console.warn("Could not load /tokens.json, using defaults", err);
  }
}

function renderTonalSpectrum(tokens) {
  const container = document.getElementById("tonal-spectrum");
  if (!container) return;

  const palette = tokens.ref?.palette?.primary || {};
  const toneKeys = ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "95", "98", "99", "100"];

  container.innerHTML = "";
  toneKeys.forEach((tone) => {
    const hex = palette[tone]?.$value || "#3c485c";
    const isDark = parseInt(tone, 10) < 50;

    const swatch = document.createElement("div");
    swatch.className = "tone-swatch";
    swatch.style.backgroundColor = hex;
    swatch.style.color = isDark ? "#ffffff" : "#000000";
    swatch.innerHTML = `<span>${tone}</span><span style="font-size:0.65rem; opacity:0.8">${hex}</span>`;
    swatch.title = `Primary Tone ${tone}: ${hex} (Click to copy)`;

    swatch.addEventListener("click", () => {
      navigator.clipboard.writeText(hex);
      showToast(`Copied ${hex} (Tone ${tone})`);
    });

    container.appendChild(swatch);
  });
}

function renderColorRoles(tokens) {
  const container = document.getElementById("color-roles-grid");
  if (!container) return;

  const lightRoles = tokens.sys?.color?.light || {};
  const darkRoles = tokens.sys?.color?.dark || {};

  container.innerHTML = "";

  const roleEntries = Object.entries(lightRoles);
  if (roleEntries.length === 0) return;

  roleEntries.forEach(([roleName, def]) => {
    const lightHex = def.$value;
    const darkHex = darkRoles[roleName]?.$value || lightHex;

    const card = document.createElement("div");
    card.className = "role-card";
    card.style.backgroundColor = lightHex;

    // Check luminance for text contrast
    const isDark = isColorDark(lightHex);
    card.style.color = isDark ? "#ffffff" : "#000000";

    card.innerHTML = `
      <div class="role-name">${roleName}</div>
      <div class="role-hex">
        <span>Light: ${lightHex}</span>
        <br/><span style="opacity:0.8">Dark: ${darkHex}</span>
      </div>
    `;

    card.title = `Click to copy token name: sys.color.${roleName}`;
    card.addEventListener("click", () => {
      navigator.clipboard.writeText(`sys.color.${roleName}`);
      showToast(`Copied sys.color.${roleName}`);
    });

    container.appendChild(card);
  });
}

function isColorDark(hex) {
  const c = hex.replace("#", "");
  const num = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 130;
}

// Load and render Components
let allComponents = [];

async function loadComponents() {
  try {
    const res = await fetch("/components.json");
    if (!res.ok) return;
    const data = await res.json();
    allComponents = Object.values(data.components || {});

    renderComponents("all");
    initComponentFilters();
  } catch (err) {
    console.warn("Could not load /components.json", err);
  }
}

function initComponentFilters() {
  const filterChips = document.querySelectorAll(".filter-chip");
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const family = chip.getAttribute("data-family") || "all";
      renderComponents(family);
    });
  });
}

function renderComponents(filterFamily) {
  const grid = document.getElementById("components-grid");
  if (!grid) return;

  const filtered =
    filterFamily === "all"
      ? allComponents
      : allComponents.filter((c) => c.family === filterFamily);

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color:var(--md-sys-color-on-surface-variant); font-size:0.9rem;">No components found in family "${filterFamily}".</p>`;
    return;
  }

  filtered.forEach((comp) => {
    const card = document.createElement("div");
    card.className = "comp-card";

    const variantsList = Object.keys(comp.variants || {}).join(", ") || "default";
    const minTarget = comp.anatomy?.container?.minTouchTarget || "48x48px";
    const exampleSnippet = comp.examples?.[0] || `<${comp.name} />`;

    card.innerHTML = `
      <div class="comp-card-header">
        <span class="comp-name">&lt;${comp.name}&gt;</span>
        <span class="badge">${comp.family}</span>
      </div>
      <div class="comp-meta">
        <div><strong>Touch Target:</strong> ${minTarget}</div>
        <div><strong>Variants:</strong> ${variantsList}</div>
        <div><strong>Import:</strong> <code>import { ${comp.name} } from '${comp.path}';</code></div>
      </div>
      <div class="code-box">${escapeHtml(exampleSnippet)}</div>
      <button type="button" class="btn-secondary copy-snippet-btn" data-snippet="${escapeAttr(exampleSnippet)}">
        📋 Copy Usage Snippet
      </button>
    `;

    grid.appendChild(card);
  });

  document.querySelectorAll(".copy-snippet-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const snip = btn.getAttribute("data-snippet");
      if (snip) {
        navigator.clipboard.writeText(snip);
        showToast("Snippet copied!");
      }
    });
  });
}

// Closed-Loop Evaluator Playground
const SAMPLE_DIRTY = `export const UserCard = () => (
  <div style={{ backgroundColor: "#1e293b" }} className="p-[13px] ml-4">
    <h2 className="text-white text-lg">Account Profile</h2>
    <button style={{ color: "#2563eb" }} className="w-8 h-8">
      Save Changes
    </button>
  </div>
);`;

const SAMPLE_CLEAN = `import React from 'react';
import { Button } from '@/components/ui/button';

export const UserCard = () => (
  <div className="bg-surface-container-low text-on-surface p-6 rounded-2xl ms-4 border border-outline-variant/30 flex flex-col gap-4">
    <h2 className="text-title-medium font-semibold text-on-surface">Account profile</h2>
    <div className="flex justify-end">
      <Button variant="filled" className="min-h-[48px] min-w-[48px]">
        Save changes
      </Button>
    </div>
  </div>
);`;

function initEvaluator() {
  const textarea = document.getElementById("eval-code-input");
  const evalBtn = document.getElementById("btn-run-evaluate");
  const loadDirtyBtn = document.getElementById("btn-load-dirty");
  const loadCleanBtn = document.getElementById("btn-load-clean");

  if (!textarea || !evalBtn) return;

  textarea.value = SAMPLE_DIRTY;

  loadDirtyBtn?.addEventListener("click", () => {
    textarea.value = SAMPLE_DIRTY;
    runEvaluation(SAMPLE_DIRTY);
  });

  loadCleanBtn?.addEventListener("click", () => {
    textarea.value = SAMPLE_CLEAN;
    runEvaluation(SAMPLE_CLEAN);
  });

  evalBtn.addEventListener("click", () => {
    runEvaluation(textarea.value);
  });

  // Initial audit
  runEvaluation(SAMPLE_DIRTY);
}

async function runEvaluation(code) {
  const scoreCircle = document.getElementById("score-circle");
  const scoreSummary = document.getElementById("score-summary");
  const diagList = document.getElementById("diagnostics-list");

  if (!scoreCircle || !scoreSummary || !diagList) return;

  scoreCircle.textContent = "...";
  scoreSummary.textContent = "Auditing against Material Design 3 and Trainable DS constraints...";
  diagList.innerHTML = "";

  try {
    const res = await fetch("/api/v1/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      const result = await res.json();
      renderEvaluationResult(result);
      return;
    }
  } catch {
    // fallback to client-side evaluation
  }

  // Fallback client-side linter
  const fallbackResult = clientSideEvaluate(code);
  renderEvaluationResult(fallbackResult);
}

function renderEvaluationResult(result) {
  const scoreCircle = document.getElementById("score-circle");
  const scoreSummary = document.getElementById("score-summary");
  const diagList = document.getElementById("diagnostics-list");

  scoreCircle.textContent = result.score;
  scoreCircle.className = `score-circle ${result.certified ? "certified" : "failed"}`;

  if (result.certified) {
    scoreSummary.innerHTML = `<strong>CERTIFIED COMPLIANT (100/100)</strong><br/><span style="color:var(--md-sys-color-on-surface-variant); font-size:0.85rem">Zero violations detected. Ready for production deployment.</span>`;
  } else {
    scoreSummary.innerHTML = `<strong>FAILED AUDIT (${result.score}/100)</strong><br/><span style="color:var(--md-sys-color-error); font-size:0.85rem">${result.diagnostics.length} violation(s) must be remediated.</span>`;
  }

  diagList.innerHTML = "";
  if (result.diagnostics.length === 0) {
    diagList.innerHTML = `<div style="padding:1rem; text-align:center; color:#10b981; font-weight:600">✔ All design system contracts satisfied!</div>`;
  } else {
    result.diagnostics.forEach((d) => {
      const item = document.createElement("div");
      item.className = "diagnostic-item";
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge" style="background:#fee2e2; color:#b91c1c;">${d.code}</span>
          <span style="font-size:0.75rem; color:var(--md-sys-color-on-surface-variant)">Line ${d.line || 1}</span>
        </div>
        <div style="font-weight:600; color:var(--md-sys-color-on-surface)">${escapeHtml(d.message)}</div>
        <div style="font-size:0.8rem; color:var(--md-sys-color-on-surface-variant)">💡 <strong>Fix:</strong> ${escapeHtml(d.remediation)}</div>
      `;
      diagList.appendChild(item);
    });
  }
}

// Client-side fallback linter
function clientSideEvaluate(code) {
  const diagnostics = [];
  const lines = code.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    if (/#([0-9a-fA-F]{3,6})\b/.test(line)) {
      diagnostics.push({
        code: "TDS-RAW-COLOR",
        line: lineNum,
        message: "Raw hex color detected in code.",
        remediation: "Map to semantic token (e.g. bg-primary or bg-surface-container-low).",
      });
    }
    if (/\[\d+px\]/.test(line)) {
      diagnostics.push({
        code: "TDS-NON-QUANTUM-SPACING",
        line: lineNum,
        message: "Arbitrary pixel spacing used.",
        remediation: "Use 4px/8px quantum grid (p-2, p-4, p-6, gap-4).",
      });
    }
    if (/<button\b/.test(line)) {
      diagnostics.push({
        code: "TDS-REINVENTED-COMPONENT",
        line: lineNum,
        message: "Raw <button> used where <Button> should be imported.",
        remediation: "Import { Button } from '@/components/ui/button'.",
      });
    }
    if (/(?:w-[1-7]\b|h-[1-7]\b|w-8\b|h-8\b)/.test(line)) {
      diagnostics.push({
        code: "TDS-TOUCH-TARGET-TOO-SMALL",
        line: lineNum,
        message: "Interactive target smaller than minimum 48x48px.",
        remediation: "Enforce min-h-[48px] min-w-[48px] or h-12.",
      });
    }
    if (/(?:ml-|mr-|pl-|pr-)/.test(line)) {
      diagnostics.push({
        code: "TDS-RTL-NON-LOGICAL",
        line: lineNum,
        message: "Physical directional property used (breaks RTL).",
        remediation: "Replace with logical properties (ms-*, me-*, ps-*, pe-*).",
      });
    }
    if (/>[A-Z][a-z]+\s+[A-Z][a-z]+</.test(line)) {
      diagnostics.push({
        code: "TDS-CAPITALIZATION-NOT-SENTENCE-CASE",
        line: lineNum,
        message: "Title-case text detected in label.",
        remediation: "Use sentence case ('Save changes' not 'Save Changes').",
      });
    }
  });

  const deductions = diagnostics.length * 20;
  const score = Math.max(0, 100 - deductions);

  return {
    certified: diagnostics.length === 0,
    score,
    diagnostics,
    summary: `${diagnostics.length} violation(s) found. Score: ${score}/100.`,
  };
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy");
      if (text) {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!");
      }
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;");
}
