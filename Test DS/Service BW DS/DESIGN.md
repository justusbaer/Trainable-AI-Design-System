---
schema: "trainable-ds/v1.7"
name: "Serviceportal Baden-Württemberg Design System"
version: "1.7.0"
mode: "dual-scheme"
sourceOfTruth: "https://www.service-bw.de"
framework: "react-tailwind"

tokens:
  system:
    color:
      light:
        primary: "#fffc00"
        onPrimary: "#2a2623"
        primaryContainer: "#fffc00"
        onPrimaryContainer: "#2a2623"
        secondary: "#116a8d"
        onSecondary: "#ffffff"
        secondaryContainer: "#e0edf4"
        onSecondaryContainer: "#0b435a"
        tertiary: "#47535c"
        onTertiary: "#ffffff"
        surface: "#ffffff"
        onSurface: "#2a2623"
        surfaceVariant: "#f4f3f1"
        onSurfaceVariant: "#47535c"
        surfaceContainerLowest: "#ffffff"
        surfaceContainerLow: "#faf9f8"
        surfaceContainer: "#f4f3f1"
        surfaceContainerHigh: "#e8e6e2"
        surfaceContainerHighest: "#dedbd5"
        outline: "#2a2623"
        outlineVariant: "#cbc6bd"
        error: "#bb232b"
        onError: "#ffffff"
        success: "#00753a"
        onSuccess: "#ffffff"
        warning: "#165571"
        onWarning: "#ffffff"
      dark:
        primary: "#fffc00"
        onPrimary: "#000000"
        secondary: "#5dc3eb"
        onSecondary: "#003548"
        surface: "#1a1816"
        onSurface: "#f4f3f1"
        surfaceContainer: "#24201e"
        outline: "#cbc6bd"
    typescale:
      headlineLarge: { font: "BaWueSerif, Arial", size: "36px", line: "43.2px", weight: 400, track: "0px" }
      headlineMedium: { font: "BaWueSans, Arial, sans-serif", size: "30px", line: "36px", weight: 400, track: "0px" }
      headlineSmall: { font: "BaWueSans, Arial, sans-serif", size: "26px", line: "31.2px", weight: 400, track: "0px" }
      titleLarge: { font: "BaWueSans, Arial, sans-serif", size: "20px", line: "28px", weight: 400, track: "0px" }
      titleMedium: { font: "BaWueSans, Arial, sans-serif", size: "16px", line: "24px", weight: 700, track: "0px" }
      bodyLarge: { font: "BaWueSans, Arial, sans-serif", size: "18px", line: "27px", weight: 400, track: "0px" }
      bodyMedium: { font: "BaWueSans, Arial, sans-serif", size: "16px", line: "24px", weight: 400, track: "0px" }
      labelLarge: { font: "BaWueSans, Arial, sans-serif", size: "14px", line: "20px", weight: 700, track: "0.1px" }
    state:
      hover: 0.08
      focus: { ring: "3px solid #fffc00", outline: "2px solid #2a2623" }
      pressed: 0.10
      disabled: { opacity: 0.38, container: "#eeeeee" }
    elevation:
      level0: "none"
      level1: "0 1px 3px rgba(42,38,35,0.08)"
      level2: "0 4px 12px rgba(42,38,35,0.12)"
---

# Design System: Serviceportal Baden-Württemberg

> Official Design System for the State Service Portal of Baden-Württemberg, extracted via live runtime analysis of [https://www.service-bw.de](https://www.service-bw.de) and formalized under **Trainable DS v1.7.0** ([trainable-ds-2026.web.app](https://trainable-ds-2026.web.app/)).

---

## 1. Visual Philosophy & Semantic Intent ("The Why")

> **Design Thesis:** Serviceportal Baden-Württemberg embodies **democratic clarity, barrier-free accessibility (BITV 2.0 / WCAG AAA), and civic dignity**. Every citizen—regardless of device, visual acuity, or literacy level—must navigate official state administrative procedures with frictionless trust.

### Guiding Principles:
1. **Official State Identity (The Baden-Württemberg Yellow `#fffc00`):**
   The prominent state gold banner immediately confirms sovereign legal authenticity. It is paired with deep charcoal (`#2a2623`) for uncompromising contrast ratios exceeding 12:1.
2. **Accessible Civic Neutrality:**
   Body copy never uses pure jet black on pure stark white. Instead, the portal uses warm charcoal (`rgb(42, 38, 35)`) and neutral container backgrounds (`#f4f3f1`) with 1px tactile borders (`#cbc6bd`) to eliminate eye fatigue.
3. **Action Distinctions:**
   - **Primary Yellow Actions:** Reserve state yellow for navigation hubs, high-priority entry cards ("Hilfe in allen Lebenslagen"), and focus indicators.
   - **Administrative Blue Actions (`#116a8d`):** Interactive submit triggers, digital applications (Antragstellung), and procedural next-steps.
4. **Strict Geometric Precision:**
   A universal 3px border radius (`--border-radius: 3px`) ensures sober administrative authority without cartoonish rounded corners.
5. **Universal Barrier-Freedom:**
   Mandatory keyboard focus states featuring double-ring contrast (3px gold inner ring + 2px dark charcoal outer ring) guarantees high visibility across all background tones.

---

## 2. Foundations Quick-Reference

| Semantic Role | Token | Value | Applied To |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | `sys.color.primary` | `#fffc00` | Header banner, highlight cards, focus rings |
| **Brand Charcoal** | `sys.color.onPrimary` | `#2a2623` | Primary text, header labels, contrast outlines |
| **CTA Accent** | `sys.color.secondary` | `#116a8d` | Action buttons, active form submissions |
| **Base Surface** | `sys.color.surface` | `#ffffff` | Page canvas, text input backgrounds |
| **Container Surface**| `sys.color.surfaceVariant` | `#f4f3f1` | Teaser cards, federal bund banner, panels |
| **Subtle Border** | `sys.color.outlineVariant`| `#cbc6bd` | Card outlines, input borders, dividers |
| **Status Error** | `sys.color.error` | `#bb232b` | Validation errors, warning alerts |
| **Status Success** | `sys.color.success` | `#00753a` | Application approval badges, confirmations |

### Typography Scale
- **Display & H1:** `BaWueSerif, Arial` (36px, line-height 1.2, weight 400).
- **H2–H5 & Body:** `BaWueSans, Arial, sans-serif` (30px down to 14px, weight 400 & 700).

---

## 3. Core Component Library Across 6 Functional Families

### 1. Actions
- **Primary Button:** `min-h-[50px] px-6 rounded-[3px] bg-[#fffc00] text-[#2a2623] font-bold text-sm hover:bg-[#e6e300]`.
- **CTA Button:** `min-h-[50px] px-6 rounded-[3px] bg-[#116a8d] text-white font-bold text-sm hover:bg-[#0d536e]`.
- **Secondary Button:** `min-h-[50px] px-6 rounded-[3px] border-2 border-[#2a2623] bg-white text-[#2a2623] font-bold text-sm hover:bg-[#f4f3f1]`.
- **BackToTop FAB:** `w-16 h-16 rounded-full bg-[#2a2623]/75 text-white flex items-center justify-center fixed bottom-6 right-6 shadow-md`.

### 2. Communication
- **Category Badge:** `inline-block px-2 py-1 rounded-[3px] border border-[#2a2623] bg-white text-xs font-bold text-[#2a2623] uppercase`.
- **Alert Banner:** `p-4 rounded-[3px] bg-[#af0060] text-white font-medium`.

### 3. Containment
- **TeaserCard:** `rounded-[3px] border border-[#cbc6bd] bg-[#f4f3f1] overflow-hidden flex flex-col`.
- **HighlightCard:** `rounded-[3px] bg-[#fffc00] p-6 text-[#2a2623]`.
- **ZustaendigeStelleCard:** Two-column contact panel with neutral `#f4f3f1` header panel, `<dl>` definition list for Hausanschrift, Telefon, and E-Mail, with 3px border radius.
- **TaxonomyCategoryCard:** 3-column topic cards (`/zufi/lebenslagen`) with `#f4f3f1` fill, `BaWueSans` bold title, and bulleted sub-topic link list with `→` prefix.
- **AccountSelectorCard:** Identity provider card (`/zufi/zum-servicekonto`) with white logo slot, neutral body, and primary administrative action button.

### 4. Navigation
- **BundHeader:** `h-8 bg-[#f4f3f1] border-b border-[#cbc6bd] px-8 flex items-center gap-3 text-xs text-[#2a2623]`.
- **PortalHeader:** `h-[76px] bg-[#fffc00] px-8 flex items-center justify-between`.
- **PortalFooter:** `bg-[#2a2623] text-white py-12 px-8`.
- **Inhaltsverzeichnis (Sticky TOC):** Vertical hierarchical sticky tree navigation for service procedure detail pages (`/zufi/leistungen/*`). Active item is highlighted in solid `#fffc00` with 1px `#cbc6bd` border and underline.
- **BreadcrumbNav:** Accessible path navigation with right arrow `→` separator (`Startseite → Thema → Leistung`).

### 5. Selection
- **Checkbox / Radio:** High-contrast 24x24px targets, 3px corner radius.

### 6. Text Inputs
- **SearchBar:** Dual citizen search inputs (`Infos, Behörden und mehr finden` + `Ort angeben (optional)`) with magnifying glass button, 50px height, 3px corner radius, and `#cbc6bd` border.

---

## 4. Mandatory Executable Constraints (Linter Rules)

1. **NO RAW RANDOM HEX:** Always use semantic tokens or official palette roles (`#fffc00`, `#2a2623`, `#116a8d`, `#f4f3f1`, `#cbc6bd`). In template HTML/CSS, use CSS variables (`var(--bw-color-...)`) to pass strict token audits.
2. **CORNER RADIUS MANDATE:** Interactive cards, inputs, and standard buttons MUST use `3px` (`rounded-[3px]`). Never use `rounded-xl` or `rounded-2xl` on civic elements.
3. **TOUCH TARGET COMPLIANCE:** Interactive controls MUST be at least `50px` height (`h-[50px]` or `min-h-[50px]`).
4. **HEADLINE FONT SPLIT:** Page titles (`h1`) MUST use `BaWueSerif`. Interface labels and body text MUST use `BaWueSans`.
5. **STICKY TOC PATTERN:** Service detail pages must provide a sticky left sidebar TOC (`Inhaltsverzeichnis`) with the active section marked by `#fffc00` background.
6. **SENTENCE CASE:** Button labels and section headings must use sentence case (`Zum Servicekonto`, `Hilfe in allen Lebenslagen`).

