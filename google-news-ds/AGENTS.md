# AGENT SYSTEM DIRECTIVE: Google News Design System

> **Target Audience:** Autonomous AI Coding Agents (Claude, Cursor, Antigravity, Copilot, ChatGPT)  
> **Protocol:** Trainable AI Design System (v1.7.0)  
> **Standard:** W3C DTCG / Material Design 3 (M3)  
> **Scope:** High-Fidelity UI Generation, Feature Extension, and Maintenance

---

## 1. Persona & Operational Invariants

You are an expert Autonomous UI Engineer generating production-ready code compliant with the **Google News Design System**. You must strictly adhere to the machine constraints, design token references, and component blueprints defined in this document and its companion files ([`tokens.json`](./tokens.json), [`components.json`](./components.json), [`DESIGN.md`](./DESIGN.md)).

### 🚨 Mandatory Machine Constraints (Linter Rules)

Every piece of HTML, CSS, or TSX code you output MUST satisfy the following invariant rules:

| Rule ID | Severity | Invariant Constraint |
| :--- | :--- | :--- |
| `TDS-GHOST-BORDER-HALLUCINATION` | **CRITICAL** | **NEVER** add `border`, `border: 1px solid ...`, or `box-shadow` to surface containers, `Card`, or `StoryCard` elements unless explicitly specified by the user. Grouping is established solely by `#ffffff` surface tone on `#f6f8fc` canvas. |
| `TDS-FONT-SMOOTHING-DEGRADATION` | **HIGH** | **NEVER** apply `-webkit-font-smoothing: antialiased` or `.antialiased`. You MUST enforce `-webkit-font-smoothing: auto;` or `font-smooth: auto;` to preserve authentic subpixel font weight on macOS/WebKit. |
| `TDS-TYPOGRAPHIC-LOGO-APPROXIMATION`| **CRITICAL** | **NEVER** approximate brand wordmarks using styled HTML `<span>` elements (e.g. `<span style="color:blue">G</span>`). ALWAYS use authentic SVG vectors (`googlelogo_clr_74x24px.svg`). |
| `TDS-RAW-COLOR` | **CRITICAL** | **NO** raw hex (`#1e293b`), rgb, or hsl values in styles or classes. Use semantic CSS variables (`var(--gn-...)`) or DTCG tokens (`sys.color.*`). |
| `TDS-NON-QUANTUM-SPACING` | **HIGH** | All layout spacing (padding, margin, gap) MUST use multiples of 4px / 8px (`8px`, `12px`, `16px`, `24px`, `32px`). Never use arbitrary values (e.g. `13px`, `17px`). |
| `TDS-SPEC-FIDELITY` | **CRITICAL** | Strictly adhere to wireframes, sketches, and user requirements. Zero feature hallucination (do not invent unrequested action buttons, toggles, or floating chips). |
| `TDS-WHITESPACE-PRESERVATION` | **HIGH** | Respect whitespace in user wireframes. Never fill open space with speculative widgets. |

---

## 2. Design Token Dictionary

When generating HTML/CSS, use these CSS custom properties. When emitting Tailwind classes or TSX, map to the corresponding token.

### 2.1 Colors (`sys.color.*`)
```css
:root {
  --gn-primary: #0b57d0;              /* Main interactive blue */
  --gn-on-primary: #ffffff;           /* Text on primary */
  --gn-primary-container: #d3e3fd;    /* Active pills / subtle blue */
  --gn-on-primary-container: #041e49; /* Text on primary container */
  --gn-secondary-blue: #004a77;       /* Cluster headline titles */
  --gn-surface: #ffffff;              /* Card containers (NO outline!) */
  --gn-on-surface: #1f1f1f;           /* Primary text / titles */
  --gn-on-surface-variant: #444746;   /* Sub-story titles & secondary copy */
  --gn-surface-container-low: #f6f8fc;/* Page canvas background */
  --gn-surface-container: #f0f4f9;    /* Search bar background */
  --gn-surface-container-high: #e9eef6;/* Hover state overlays */
  --gn-outline: #747775;              /* Form borders */
  --gn-outline-variant: #e3e3e3;      /* Internal 1px card dividers */
  --gn-link: #1a73e8;                 /* Article citation links */
  --gn-coverage-bg: #f2f2f2;          /* Full coverage pill button */
  --gn-coverage-text: #444746;        /* Coverage button text */
}
```

### 2.2 Typography Scale (`sys.typescale.*`)
| Role | Family | Size | Weight | Line Height | Application Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `brandWordmark` | `'Product Sans', Arial, sans-serif` | 22px | 400 | 24px | "News" brand lockup suffix |
| `headlineMedium`| `'Google Sans', sans-serif` | 28px | 400 | 36px | Screen primary title ("Meine Auswahl") |
| `titleLarge` | `'Google Sans', sans-serif` | 22px | 400 | 28px | Cluster primary headline |
| `titleMedium` | `'Google Sans', sans-serif` | 20px | 400 | 26px | Lead story title & section headers |
| `titleSmall` | `'Google Sans', sans-serif` | 14px | 400 | 20px | Sub-story headlines |
| `labelLarge` | `'Google Sans', sans-serif` | 14px | 500 | 27px | Category nav tabs (Startseite, etc.) |
| `bodyMedium` | `'Google Sans Text', Roboto, sans-serif` | 14px | 400 | 22px | AI summary bullets, article body copy |
| `labelMedium` | `'Google Sans Text', Roboto, sans-serif` | 12px | 500 | 16px | Publisher sources (n-tv.de, ZEIT) |
| `bodySmall` | `'Google Sans Text', Roboto, sans-serif` | 12px | 400 | 16px | Publication timestamps ("Vor 46 Min.") |

### 2.3 Shapes & Radii (`sys.shape.*`)
- `--gn-radius-card: 18px;` (Story cards, AI Summary card, Weather card)
- `--gn-radius-pill: 9999px;` (Buttons, search bar, coverage pill)
- `--gn-radius-img: 12px;` (Lead story thumbnails)
- `--gn-radius-chip: 8px;` (Selection chips)

---

## 3. Production Component Blueprints

### 3.1 AI Summary Card (`AiSummaryCard`)
Used for Gemini AI-synthesized news digests above Top-Meldungen:
```html
<article class="ai-summary-card" style="
  background-color: var(--gn-surface);
  border: none;
  border-radius: var(--gn-radius-card);
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: none;
">
  <div style="
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--gn-outline-variant);
    padding-bottom: 12px;
    margin-bottom: 16px;
  ">
    <div style="display: inline-flex; align-items: center; gap: 8px;">
      <!-- Gemini Sparkle Vector with AI Gradient -->
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="geminiGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#1a73e8"/>
            <stop offset="50%" stop-color="#7c4dff"/>
            <stop offset="100%" stop-color="#d04b82"/>
          </linearGradient>
        </defs>
        <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="url(#geminiGrad)"/>
      </svg>
      <h2 style="font-family: 'Google Sans', sans-serif; font-size: 20px; font-weight: 400; color: var(--gn-on-surface); margin: 0;">
        Zusammenfassung
      </h2>
    </div>
    <span style="font-family: 'Google Sans Text', Roboto, sans-serif; font-size: 11px; font-weight: 500; color: #5f6368;">
      Vor 10 Min. aktualisiert
    </span>
  </div>

  <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px;">
    <li style="display: flex; align-items: flex-start; gap: 12px; font-family: 'Google Sans Text', sans-serif; font-size: 14px; line-height: 22px; color: var(--gn-on-surface);">
      <span style="width: 6px; height: 6px; border-radius: 50%; background: linear-gradient(135deg, #1a73e8, #7c4dff); margin-top: 8px; flex-shrink: 0;"></span>
      <div style="flex: 1;">
        <strong>Titel der Zusammenfassung:</strong> Beschreibung des aktuellen Sachverhalts in präzisen Worten.
        <a href="#" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; color: var(--gn-link); text-decoration: none; margin-left: 6px;">
          n-tv.de
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/></svg>
        </a>
      </div>
    </li>
  </ul>
</article>
```

### 3.2 Weather Card (`WeatherCard`)
Aligned with the right column:
```html
<div class="weather-card" style="
  background-color: var(--gn-surface);
  border: none;
  border-radius: var(--gn-radius-card);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: none;
  margin-bottom: 24px;
">
  <div style="display: flex; align-items: center; gap: 12px;">
    <svg width="38" height="38" viewBox="0 0 40 40">
      <circle cx="20" cy="18" r="12" fill="#FBBC04"/>
      <path d="M16 28h16a5 5 0 0 0 0-10 4.9 4.9 0 0 0-2.8.9A6.5 6.5 0 0 0 17 19.5a5 5 0 0 0-1 8.5z" fill="#ffffff" fill-opacity="0.95"/>
    </svg>
    <div>
      <div style="font-size: 11px; color: #5f6368;">Tübingen</div>
      <div style="font-family: 'Google Sans', sans-serif; font-size: 22px; font-weight: 500; color: var(--gn-on-surface); line-height: 1.15;">
        21 °C
      </div>
    </div>
  </div>
  <a href="#" style="font-size: 11px; font-weight: 500; color: var(--gn-link); text-decoration: none;">Google Wetter</a>
</div>
```

---

## 4. Trainable DS Agent Execution Protocol

When an agent is tasked with adding a new screen, component, or layout:

1. **Step 1: Read Authority Tokens**  
   Read [`tokens.json`](./tokens.json). Identify values tagged with `"tds:locked": true`. These tokens represent human-verified contracts that MUST NOT be altered or deviated from.
2. **Step 2: Read Component Contracts**  
   Read [`components.json`](./components.json) for the target family (Actions, Containment, Navigation, etc.). Match properties, minimum touch bounding boxes (>= 48x48px), and variant styling.
3. **Step 3: Generate Clean Markup**  
   Ensure all surface containers omit borders and box-shadows. Ensure `-webkit-font-smoothing: auto;` is present.
4. **Step 4: Verify via Evaluator**  
   Run or simulate the 5-tier evaluator engine. Verify zero `TDS-*` rule violations.
