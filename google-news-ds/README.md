# Google News Design System (Standalone Package)

> **Extracted, Trained, and Certified via the Trainable AI Design System Protocol**  
> *Compliant with W3C Design Tokens Community Group (DTCG) & Material Design 3 (M3)*

This directory contains a complete, self-contained design system extracted directly from [news.google.com](https://news.google.com/home?hl=de&gl=DE&ceid=DE:de). It encompasses authoritative design tokens, certified component contracts, typography scales, vector assets, an interactive Reviewer Portal, and a pixel-accurate prototype demonstrating both standard Google News and an AI-augmented Gemini Summary feature.

---

## ⚡ Quick Start (1-Minute Setup)

Spin up the local review server to explore the portal and prototype immediately:

```bash
# Navigate to the design system package
cd google-news-ds

# Start the zero-dependency local server
npm start
# or: node server.js
```

Once started, open:
- 📊 **Reviewer Portal:** [http://localhost:5000/overview.html](http://localhost:5000/overview.html) (or `5002` if port 5000 is occupied)
- 📰 **Interactive Prototype:** [http://localhost:5000/prototype.html](http://localhost:5000/prototype.html)
  - Press <kbd>A</kbd> to toggle **✦ AI Zusammenfassung**
  - Press <kbd>O</kbd> to toggle **Originalzustand**

---

## 📂 File Manifest & Package Contents

| File | Type | Purpose & Description |
| :--- | :--- | :--- |
| [`README.md`](./README.md) | Markdown | **This document**: Human-readable architecture guide, component manifest, and usage instructions. |
| [`AGENTS.md`](./AGENTS.md) | Markdown | **Agent-only guide**: Machine-executable system instructions, token dictionaries, and invariant linter rules for AI coding agents (Claude, Cursor, Antigravity). |
| [`DESIGN.md`](./DESIGN.md) | Markdown | Authoritative design system specification covering semantic philosophy, color contrast pairings, 15-tier typography matrix, and executable rules. |
| [`tokens.json`](./tokens.json) | JSON (DTCG) | Full 3-tier Design Token graph (Light & Dark color palettes, typography scales, shape tokens, elevation, and disk-locked values). |
| [`components.json`](./components.json) | JSON Schema | Machine-readable component library catalog defining anatomies, visual variants, props, and accessibility contracts. |
| [`fonts.json`](./fonts.json) | JSON | Typography catalog with verified Google Fonts multi-weight CDN endpoints and local `@font-face` WOFF2 fallback configurations. |
| [`icons.json`](./icons.json) | JSON | Vector SVG asset dictionary containing the official Google multi-color brandmark, Gemini sparkle, weather glyphs, and source badges. |
| [`overview.html`](./overview.html) | HTML/CSS/JS | Standalone **Trainable DS Reviewer Portal**: Interactive token inspector, WCAG contrast auditor, component showcase, and token-locking interface. |
| [`prototype.html`](./prototype.html) | HTML/CSS/JS | Production-grade prototype featuring zero-outline containment, custom mosquito lead illustration, and a floating dual-mode switcher. |
| [`server.js`](./server.js) | Node.js | Lightweight HTTP server with automatic port-conflict resolution (5000 -> 5002) and token-locking REST API endpoint (`POST /api/v1/update-tokens`). |
| [`package.json`](./package.json) | NPM Config | Standalone package configuration with scripts (`npm start`, `npm run serve`). |

---

## 🎨 Core Visual Philosophy ("The Why")

Google News is defined by calm, journalistic clarity powered by Material You container elevation, seamless surface contrast, and strict typographic hierarchy:

```
+-------------------------------------------------------------------------+
| [Google News]           [ Search Bar ]             [Actions]  [Anmelden]|
+-------------------------------------------------------------------------+
| Startseite | Für mich | Folge ich | Deutschland | Welt | Lokales ...    |
+-------------------------------------------------------------------------+
| Meine Auswahl                                                           |
| Donnerstag, 17. September                                               |
|                                                                         |
| +------------------------------------+  +-----------------------------+ |
| | ✦ Zusammenfassung                  |  | Weather Card (21 °C)        | |
| | - Bullet 1 .................. n-tv |  +-----------------------------+ |
| | - Bullet 2 .................. ZEIT |  +-----------------------------+ |
| +------------------------------------+  | Lokale Nachrichten          | |
|                                         | - Story 1 ........... gea.de| |
| +------------------------------------+  | - Story 2 ........... swp.de| |
| | Top-Meldungen                      |  +-----------------------------+ |
| | Lead Story (Mosquito) + Sub-stories|                                  |
| +------------------------------------+                                  |
+-------------------------------------------------------------------------+
```

### 1. Zero-Outline Surface Architecture
Live Google News cards have **no outline, no border, and no drop shadow** (`border: none; box-shadow: none;`). Spatial containment is achieved solely through pure white (`#ffffff` / `sys.color.surface`) container fills resting against the subtle grey-blue `#f6f8fc` (`sys.color.surface-container-low`) page canvas background, bounded by signature `18px` rounded corners (`--gn-radius-card`).

### 2. Authentic Vector Brand Sanctity
The "Google" logo in the top navigation bar is an authentic 4-color vector SVG (`width: 74px; height: 24px`). It must **never** be simulated as styled HTML `<span>` tags, which corrupts stroke weight. The adjacent "News" suffix is set strictly in `Product Sans` 22px regular (`#5f6368`).

### 3. Subpixel Text Rendering Contract
`-webkit-font-smoothing` must remain `auto` (or default subpixel rendering), matching live Google properties. Forcing `-webkit-font-smoothing: antialiased` degrades font weight by 100–150 units on macOS and WebKit, causing headline typography to appear artificially thin and washed out.

### 4. Strict Typographic Boundaries
- **`Google Sans` (Editorial Hierarchy):** Reserved for screen titles (28px 400), section links (20px 400), cluster headlines (22px 400), and lead story titles (20px 400).
- **`Google Sans Text` / `Roboto` (Reading Density & Metadata):** Reserved for publisher names (12px 500), timestamps (12px 400), search bar input (16px 400), and full coverage buttons (14px 500).
- **`Product Sans` (Brand Identity):** Exclusively reserved for brand wordmarks.

### 5. Integrated Continuous Section Containers
Major editorial sections (e.g. "Top-Meldungen", "Lokale Nachrichten") are unified continuous card containers. Section headers reside **inside** the card container at the top, followed by an immediate 1px divider (`border-bottom: 1px solid #e3e3e3`). Individual stories inside the cluster are delineated by subtle 1px dividers (`border-top: 1px solid #e3e3e3`), preserving cohesive grouping without multiplying card boundaries.

---

## 🧩 Certified Component Families

| Family | Component | Description & Key Specs |
| :--- | :--- | :--- |
| **Actions** | `Button` | 48px touch target, full-pill (`rounded-full`), sentence-case text (`sys.color.primary`). |
| | `CoverageButton` | 40px tonal pill (`#f2f2f2` -> `#e5e5e5` on hover) with blue coverage icon. |
| | `IconButton` | 48x48px touch target with centered 24px SVG icon; hover background `#f0f4f9`. |
| **Containment** | `StoryCard` | Zero-outline container, 18px radius, white surface, internal 1px dividers. |
| | `WeatherCard` | Compact weather widget with location, temperature (22px 500), and weather condition icon. |
| | `AiSummaryCard` | **New Feature**: Gemini AI summary card with 4-point sparkle vector, 3–5 bullets, and trailing article links (`↗`). |
| **Navigation** | `TopAppBar` | Fixed 64px header with authentic Google SVG + Product Sans "News", search bar, and actions. |
| | `Tabs` / `NavTab` | 48px touch target; hover transitions text to `#000000` (500 weight, no underline); active tab `#1a73e8` with 3px blue bottom pill. |
| **Selection** | `Chip` | 8px radius filter chip with 48px touch bounding box. |
| **Text Inputs** | `SearchBar` | 46px pill search container (`rounded-[28px]`, `#f0f4f9` fill, focus ring in primary blue). |

---

## 🔄 Using with the Trainable AI Design System

The Trainable AI Design System enables continuous, closed-loop extraction, alignment, and evaluation of user interfaces. Here is how to use this package within that workflow:

### 1. Token Inspection & Locking
Open `overview.html` in your browser. Any token modified in the visual editor can be committed with `tds:locked: true`. Once locked, subsequent automated runs of the Trainable DS aligner will **never overwrite** your custom values:
```json
"surface": {
  "$value": "#ffffff",
  "$type": "color",
  "$extensions": {
    "tds:locked": true
  }
}
```

### 2. Validating Code with the Linter / Evaluator Engine
Candidate TSX or HTML code generated by AI models can be evaluated against the 5-tier rules engine:
```bash
# Run the Trainable DS evaluator against your prototype
npx vitest run packages/evaluator
```

The evaluator enforces:
- **`TDS-GHOST-BORDER-HALLUCINATION`**: Flags artificial borders or shadows on flat cards.
- **`TDS-FONT-SMOOTHING-DEGRADATION`**: Blocks `-webkit-font-smoothing: antialiased`.
- **`TDS-TYPOGRAPHIC-LOGO-APPROXIMATION`**: Blocks text span approximations of brand logos.
- **`TDS-RAW-COLOR`**: Blocks hardcoded hex values; enforces tokens.

### 3. Agent Integration
When pairing with AI coding agents (Claude, Cursor, Copilot, Antigravity), supply [`AGENTS.md`](./AGENTS.md) as the system prompt or project rule file. It gives the agent machine-readable token dictionaries and unambiguous execution constraints.
