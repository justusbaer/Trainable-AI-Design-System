/**
 * Trainable DS Portal Client for Serviceportal Baden-Württemberg
 */

document.addEventListener("DOMContentLoaded", () => {
  initCopyPrompt();
  initEvaluator();
});

function initCopyPrompt() {
  const copyBtn = document.getElementById("btn-copy-prompt");
  const codeEl = document.getElementById("agent-prompt-code");

  if (copyBtn && codeEl) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(codeEl.textContent.trim()).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "✔ Kopiert!";
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      });
    });
  }
}

// Interactive Closed-Loop Compliance Evaluator
function initEvaluator() {
  const runBtn = document.getElementById("btn-run-audit");
  const inputEl = document.getElementById("eval-code-input");
  const scoreCircle = document.getElementById("eval-score-circle");
  const scoreSummary = document.getElementById("eval-score-summary");
  const diagList = document.getElementById("eval-diagnostics-list");

  if (!runBtn || !inputEl) return;

  runBtn.addEventListener("click", () => {
    const code = inputEl.value;
    const diagnostics = [];

    // Constraint 1: Strict Hex Disallowed (must use tokens or approved palette)
    const rawHexMatches = code.match(/#(?:[0-9a-fA-F]{3,8})\b/g) || [];
    const approvedHex = ["#fffc00", "#2a2623", "#116a8d", "#ffffff", "#000000", "#cbc6bd", "#f4f3f1", "#bb232b", "#00753a", "#165571", "#af0060"];
    for (const hex of rawHexMatches) {
      if (!approvedHex.includes(hex.toLowerCase())) {
        diagnostics.push({
          rule: "TDS-RAW-COLOR",
          severity: "CRITICAL",
          message: `Uncertified raw color detected: ${hex}. Use official Service BW tokens or CSS variables.`
        });
      }
    }

    // Constraint 2: Non-3px border radius on administrative components
    if (code.includes("rounded-xl") || code.includes("rounded-2xl") || code.includes("rounded-3xl") || code.includes("border-radius: 12px") || code.includes("border-radius: 16px") || code.includes("border-radius: 24px")) {
      diagnostics.push({
        rule: "TDS-NON-CIVIC-RADIUS",
        severity: "HIGH",
        message: "Prohibited curved border radius. Serviceportal Baden-Württemberg enforces 3px radius (`rounded-[3px]`)."
      });
    }

    // Constraint 3: Touch target too small (<50px)
    if (code.includes("h-8") || code.includes("h-9") || code.includes("height: 32px") || code.includes("height: 36px")) {
      diagnostics.push({
        rule: "TDS-TOUCH-TARGET-TOO-SMALL",
        severity: "HIGH",
        message: "Interactive control height is under 50px. Service BW requires minimum 50px touch targets (`h-[50px]`)."
      });
    }

    // Constraint 4: Button missing sentence case
    const buttonTextMatches = code.match(/<button[^>]*>([^<]+)<\/button>/gi) || [];
    for (const m of buttonTextMatches) {
      const text = m.replace(/<[^>]+>/g, "").trim();
      const words = text.split(/\s+/);
      if (words.length > 1 && words.slice(1).some(w => /^[A-Z]/.test(w) && !["Baden-Württemberg", "Servicekonto", "Deutschland"].includes(w))) {
        diagnostics.push({
          rule: "TDS-CAPITALIZATION-NOT-SENTENCE-CASE",
          severity: "MEDIUM",
          message: `Button label "${text}" should use sentence case.`
        });
      }
    }

    // Render results
    const certified = diagnostics.length === 0;
    const score = certified ? 100 : Math.max(20, 100 - diagnostics.length * 25);

    if (scoreCircle) {
      scoreCircle.textContent = score;
      scoreCircle.style.background = certified ? "#00753a" : "#bb232b";
    }

    if (scoreSummary) {
      scoreSummary.innerHTML = certified
        ? `<strong style="color:#00753a">CERTIFIED COMPLIANT</strong><br/><span style="font-size:0.85rem">100% Service BW Design System compliance</span>`
        : `<strong style="color:#bb232b">AUDIT FAILED</strong><br/><span style="font-size:0.85rem">${diagnostics.length} violation(s) detected</span>`;
    }

    if (diagList) {
      diagList.innerHTML = "";
      if (certified) {
        diagList.innerHTML = `<div style="padding:1rem; background:#f4f3f1; border-radius:3px; color:#00753a; font-size:0.9rem;">✔ No violations found. Component strictly adheres to Serviceportal Baden-Württemberg standards.</div>`;
      } else {
        diagnostics.forEach(d => {
          const item = document.createElement("div");
          item.style.padding = "0.75rem";
          item.style.marginBottom = "0.5rem";
          item.style.background = "#fff4f4";
          item.style.borderLeft = "4px solid #bb232b";
          item.style.borderRadius = "3px";
          item.innerHTML = `<div style="font-weight:700; font-size:0.85rem; color:#bb232b;">[${d.severity}] ${d.rule}</div><div style="font-size:0.85rem; color:#2a2623; margin-top:2px;">${d.message}</div>`;
          diagList.appendChild(item);
        });
      }
    }
  });

  // Load samples
  const btnClean = document.getElementById("btn-load-clean");
  const btnDirty = document.getElementById("btn-load-dirty");

  if (btnClean) {
    btnClean.addEventListener("click", () => {
      inputEl.value = `<button className="h-[50px] px-6 rounded-[3px] bg-[#fffc00] text-[#2a2623] font-bold text-sm hover:bg-[#e6e300] inline-flex items-center gap-2">
  Zum Servicekonto anmelden
</button>`;
      runBtn.click();
    });
  }

  if (btnDirty) {
    btnDirty.addEventListener("click", () => {
      inputEl.value = `<button style={{ background: '#7c3aed', borderRadius: '16px', height: '36px', color: '#fff' }}>
  Submit Application Now
</button>`;
      runBtn.click();
    });
  }
}
