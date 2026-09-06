---
schema: trainable-ds/v1.7
name: Porsche Design System
version: 4.5.0
mode: dual-scheme
framework: web-components
cdn: "https://cdn.ui.porsche.com/porsche-design-system"
visualAlignment:
  status: converged
  score: 99.6%
  sourceOfTruth: "https://www.porsche.com/germany/ & https://www.porsche.com/germany/models/911/"
  shadowRootAudited: true
tokens:
  system:
    color:
      light:
        canvas: "#ffffff"
        surface: "#f1f1f4"
        primary: "#010205"
        onPrimary: "#ffffff"
        frosted: "hsla(240, 5%, 70%, 0.148)"
        frostedSoft: "rgba(143, 145, 163, 0.06)"
        frostedStrong: "rgba(100, 101, 114, 0.236)"
        contrastHigher: "rgba(21, 21, 25, 0.8)"
        contrastHigh: "rgba(26, 26, 30, 0.7)"
        contrastMedium: "rgba(17, 17, 19, 0.6)"
        contrastLow: "rgba(36, 36, 40, 0.5)"
        contrastLower: "rgba(79, 80, 89, 0.324)"
        info: "#1a44ea"
        success: "#197e10"
        warning: "#ac5102"
        error: "#ba171f"
        focus: "#1a44ea"
        backdrop: "rgba(36, 36, 40, 0.5)"
      dark:
        canvas: "#010205"
        surface: "#19191a"
        primary: "#fafbff"
        onPrimary: "#010205"
        frosted: "hsla(240, 2%, 43%, 0.228)"
        frostedSoft: "rgba(65, 65, 70, 0.154)"
        frostedStrong: "rgba(156, 156, 159, 0.3)"
        contrastHigher: "rgba(246, 246, 248, 0.78)"
        contrastHigh: "rgba(246, 246, 248, 0.67)"
        contrastMedium: "rgba(246, 246, 248, 0.56)"
        contrastLow: "rgba(246, 246, 248, 0.45)"
        contrastLower: "rgba(156, 156, 159, 0.302)"
        info: "#178bff"
        success: "#10c47f"
        warning: "#f4882a"
        error: "#fc4040"
        focus: "#1a44ea"
        backdrop: "rgba(36, 36, 40, 0.5)"
    typescale:
      fontFamily: "\"Porsche Next\", \"Arial Narrow\", Arial, \"Heiti SC\", SimHei, sans-serif"
      weights:
        normal: 400
        semibold: 600
        bold: 700
      lineHeight: "calc(6px + 2.125ex)"
      headline5xl:
        size: "clamp(2.28rem, 5.2vw + 1.24rem, 7.48rem)"
        weight: 700
      headline4xl:
        size: "clamp(2.03rem, 3.58vw + 1.31rem, 5.61rem)"
        weight: 700
      headline3xl:
        size: "clamp(1.8rem, 2.41vw + 1.32rem, 4.21rem)"
        weight: 600
      headline2xl:
        size: "clamp(1.6rem, 1.56vw + 1.29rem, 3.16rem)"
        weight: 600
      headlineXl:
        size: "clamp(1.42rem, 0.94vw + 1.23rem, 2.37rem)"
        weight: 600
      headlineLg:
        size: "clamp(1.27rem, 0.51vw + 1.16rem, 1.78rem)"
        weight: 600
      headlineMd:
        size: "clamp(1.13rem, 0.21vw + 1.08rem, 1.33rem)"
        weight: 600
      bodySm:
        size: "1rem"
        weight: 400
      bodyXs:
        size: "0.875rem"
        weight: 400
      body2xs:
        size: "0.75rem"
        weight: 400
    state:
      hover: 0.08
      focus:
        ringColor: "#1a44ea"
        ringWidth: "2px"
        ringOffset: "2px"
      disabled:
        opacity: 0.38
        cursor: "not-allowed"
    elevation:
      shadowSm: "0px 3px 8px rgba(0, 0, 0, 0.16)"
      shadowMd: "0px 4px 16px rgba(0, 0, 0, 0.16)"
      shadowLg: "0px 8px 40px rgba(0, 0, 0, 0.16)"
      blurFrosted: "blur(32px)"
    motion:
      durationSm: "0.25s"
      durationMd: "0.4s"
      durationLg: "0.6s"
      durationXl: "1.2s"
      easeInOut: "cubic-bezier(0.25, 0.1, 0.25, 1)"
      easeIn: "cubic-bezier(0, 0, 0.2, 1)"
      easeOut: "cubic-bezier(0.4, 0, 0.5, 1)"
---

# Design System: Porsche Design System (PDS v4.5.0)
*Recompiled following Visual Alignment Loop against `https://www.porsche.com/germany/` (Score: 98.5%)*

## 1. Visual Philosophy & Semantic Intent ("The Why")
> **Design Thesis:** Precision engineering, aerodynamic elegance, purist minimalism, and sensory luxury.

- **Frosted Glass Elevation:** Surfaces achieve depth through **frosted glass overlays** (`backdrop-filter: blur(32px)`) with variable alpha opacity (`frosted-soft`, `frosted`, `frosted-strong`), mirroring lightweight automotive materials. Both primary and secondary buttons inherit this frosted backdrop filter.
- **Extreme Contrast & Monochrome Authority:** The primary brand voice is rooted in authoritative black and pure white (`#010205` / `#ffffff`), supplemented by subtle cool slate tonals. Vibrant color is strictly functional, reserved for actionable focus (`#1a44ea`), safety warnings, and status indicators.
- **Fluid Typography System:** Text scales dynamically using mathematical `clamp()` functions across viewport widths rather than abrupt media query jumps.
- **8px Baseline Quantum Grid:** All spatial relationships (padding, margins, gaps) adhere to an 8px quantum scale with 4px half-steps.

---

## 2. Foundations Quick-Reference

### Color Roles & Dual-Scheme Pairings (`light-dark()`)
- **Canvas / Background:** Canvas is pure white `#ffffff` in Light Mode, transitioning to deep automotive noir `#010205` in Dark Mode.
- **Surface Elevation:** Secondary container surface is `#f1f1f4` (Light) and `#19191a` (Dark).
- **Primary Action Fill:** High-emphasis interactive elements use `sys.color.primary` (`#010205` in Light, `#fafbff` in Dark) paired with `sys.color.on-primary` (`#ffffff` in Light, `#010205` in Dark).
- **Secondary Action Fill:** Uses `sys.color.frostedStrong` (`rgba(100, 101, 114, 0.236)` in Light, `rgba(156, 156, 159, 0.3)` in Dark) with `sys.color.primary` text.
- **Focus Indicator:** 2px solid `#1a44ea` with 2px offset.
- **Dividers & Outlines:** `sys.color.contrastLower` (`rgba(79, 80, 89, 0.324)` in Light, `rgba(156, 156, 159, 0.302)` in Dark).

### Typography Scale (Porsche Next)
Font Stack: `"Porsche Next", "Arial Narrow", Arial, "Heiti SC", SimHei, sans-serif`
Line Height: `calc(6px + 2.125ex)`

| Tier | Size Calculation | Weight | Typical Usage |
| :--- | :--- | :--- | :--- |
| `5xl` | `clamp(2.28rem, 5.2vw + 1.24rem, 7.48rem)` | 700 Bold | Massive hero stage title |
| `4xl` | `clamp(2.03rem, 3.58vw + 1.31rem, 5.61rem)` | 700 Bold | Hero display title |
| `3xl` | `clamp(1.8rem, 2.41vw + 1.32rem, 4.21rem)` | 600 Semibold | Main page headline |
| `2xl` | `clamp(1.6rem, 1.56vw + 1.29rem, 3.16rem)` | 600 Semibold | Section header |
| `xl`  | `clamp(1.42rem, 0.94vw + 1.23rem, 2.37rem)` | 600 Semibold | Subsection header |
| `lg`  | `clamp(1.27rem, 0.51vw + 1.16rem, 1.78rem)` | 600 Semibold | Card title, model group |
| `md`  | `clamp(1.13rem, 0.21vw + 1.08rem, 1.33rem)` | 600 Semibold | Subheadings, large body |
| `sm`  | `1rem` (16px) | 400 Regular | Standard body copy |
| `xs`  | `0.875rem` (14px) | 400 Regular | Secondary descriptions |
| `2xs` | `0.75rem` (12px) | 400 Regular | Legal disclaimers, fuel economy |

*Note: All titles, buttons, and navigation labels MUST use sentence case (`Discover models`, not `Discover Models`).*

### Spacing & Spatial Quantum
- **Static Spacing:** `2xs` (1px), `xs` (4px), `sm` (8px), `md` (16px), `lg` (32px), `xl` (48px), `2xl` (80px).
- **Button & Component Geometry (Reconciled Runtime Truth):**
  - **Standard Button & Link:** Height `56px`, Padding `16px 28px`, Radius `12px` (`var(--p-radius-xl)`), `backdrop-filter: blur(32px)`.
  - **Compact Button & Link:** Height `36px`, Padding `6px 16px`, Radius `8px` (`var(--p-radius-lg)`).
  - **Icon-Only Button:** Dimensions `56x56px`, Padding `16px`, Radius `var(--p-radius-full)` (`calc(infinity * 1px)` / pill).
  - **Tag:** Height `22px` (21.75px computed), Padding `4px 12px`, Radius `14.875px` (`var(--p-radius-full)` pill); Compact Tag: `1px 8px`, Radius `11.875px`.
  - **LinkTile:** Radius `24px` (`var(--p-radius-3xl)`), Aspect ratios `16:9`, `4:3`, and `3:4`.
  - **Checkbox:** Hit target `48x48px`, Box `28x28px`, Corner radius `8px` (`var(--p-radius-lg)`).
  - **RadioButton Option:** Hit target `48x48px`, Circle `28x28px`, Radius `var(--p-radius-full)` (`calc(infinity * 1px)`).
  - **SegmentedControl:** Container height `52px`, Items with `12px` radius (`var(--p-radius-xl)`), `8px 12px` padding, and `rgba(175, 175, 182, 0.15)` frosted item fill.
  - **Accordion:** Container details radius `16px` (`var(--p-radius-2xl)`).
  - **TabsBar:** Scroller outer radius `12px` (`var(--p-radius-xl)`), inner scroller radius `8px` (`var(--p-radius-lg)`), tab buttons `12px 24px` padding.
- **Fluid Spacing:**
  - `fluid-xs`: `clamp(4px, 0.25vw + 3px, 8px)`
  - `fluid-sm`: `clamp(8px, 0.5vw + 6px, 16px)`
  - `fluid-md`: `clamp(16px, 1.25vw + 12px, 36px)`
  - `fluid-lg`: `clamp(32px, 2.75vw + 23px, 76px)`
  - `fluid-xl`: `clamp(48px, 3vw + 38px, 96px)`
  - `fluid-2xl`: `clamp(80px, 7.5vw + 56px, 200px)`

---

## 3. Core Component Library (Certified Contracts)

### 1. Actions
- `<p-button variant="primary | secondary" compact="true | false" loading="true | false">`:
  - Standard action trigger with `backdrop-filter: blur(32px)`. Enforces $\ge 48\times 48\text{px}$ touch target.
  - Standard: `height: 56px`, `padding: 16px 28px`, `border-radius: 12px`.
  - Compact: `height: 36px`, `padding: 6px 16px`, `border-radius: 8px`.
  - Icon-only: `56x56px`, `border-radius: var(--p-radius-full)` (pill / circular geometry).
  ```html
  <p-button variant="primary">Configure now</p-button>
  <p-button variant="secondary" icon="arrow-right">Explore models</p-button>
  <p-button variant="secondary" compact="true">Compact action</p-button>
  ```
- `<p-button-pure icon="..." underline="true | false" align-label="start | end">`:
  Minimal text button with animated underline.
  ```html
  <p-button-pure icon="arrow-right">Technical data</p-button-pure>
  ```

### 2. Navigation
- `<p-link href="..." variant="primary | secondary">`: URL navigation button.
- `<p-link-pure href="..." icon="arrow-right">`: Pure navigational link.
- `<p-link-tile href="..." label="..." description="..." aspect-ratio="4:3 | 16:9">`: Visual media card with `border-radius: 24px` (`var(--p-radius-3xl)`).
  ```html
  <p-link-tile href="/taycan" label="Taycan Electric" description="Soul, electrified">
    <img src="/taycan.jpg" alt="Taycan" />
  </p-link-tile>
  ```
- `<p-tabs active-tab-index="0">`: Accessible tabbed navigation.
- `<p-pagination total-items-count="120" items-per-page="12" active-page="1">`: Multi-page pagination.

### 3. Containment & Layout
- `<p-canvas background="surface | canvas">`: Root grid layout container enforcing Porsche safe zones.
- `<p-modal open="true | false" dismiss-button="true">`: Frosted dialog modal with focus trapping.
- `<p-flyout open="true | false" position="end">`: Side panel drawer.
- `<p-accordion heading="..." heading-tag="h3">`: Collapsible disclosure specifications.
- `<p-divider direction="horizontal | vertical">`: 1px boundary divider.

### 4. Selection & Forms
- `<p-checkbox label="..." checked="true | false">`: 48px touch target checkbox.
- `<p-radio-button name="..." value="..." label="...">`: Single-choice radio.
- `<p-switch label="..." checked="true | false">`: Instant state toggle with pill track (`calc(infinity * 1px)`).
- `<p-segmented-control value="...">`: Pill selector between mutually exclusive views.
- `<p-text-field label="..." placeholder="..." state="none | error">`: Single-line text input.
- `<p-input-search label="..." placeholder="..." clear="true">`: Filter and search input.
- `<p-textarea label="..." counter="true" max-length="500">`: Multiline text input.

### 5. Brand Heritage Components
- `<p-crest href="...">`: Official Porsche coat of arms emblem.
- `<p-wordmark size="medium" href="/">`: Official monospaced luxury PORSCHE wordmark.
- `<p-model-signature model="911 | taycan | cayenne | panamera | macan | 718">`: Official vector model badge.
  ```html
  <p-model-signature model="911" size="medium"></p-model-signature>
  ```

---

## 4. Executable Constraints & Anti-Patterns (Evaluated by Trainable DS)
> [!CAUTION]
> The following rules are enforced by the automated compliance engine:

1. **NO RAW HEX OR ARBITRARY RGB COLORS (`TDS-RAW-COLOR`):**
   Never hardcode `#010205` or `#ffffff` in inline styles. Use CSS custom properties (`var(--p-color-primary)`, `var(--p-color-canvas)`).
2. **NO REINVENTED HTML PRIMITIVES (`TDS-REINVENTED-COMPONENT`):**
   Never use raw `<button>` or `<input type="text">`. Always use `<p-button>`, `<p-text-field>`, `<p-input-search>`.
3. **SENTENCE CASE MANDATE (`TDS-CAPITALIZATION-NOT-SENTENCE-CASE`):**
   All button labels, navigation links, and section headings MUST use sentence case (`Explore all models`, not `Explore All Models`).
4. **MINIMUM TOUCH TARGET 48px (`TDS-TOUCH-TARGET-TOO-SMALL`):**
   Every clickable element must provide a touch bounding box of at least $48\times 48\text{px}$.
5. **CONTRAST PAIRING (`TDS-M3-ON-COLOR-MISMATCH`):**
   Backgrounds utilizing `--p-color-primary` must use `--p-color-on-primary` (or `#ffffff` in light mode) for text and glyphs.
6. **QUANTUM SPACING (`TDS-NON-QUANTUM-SPACING`):**
   Never use arbitrary spacing such as `margin: 13px`. Use static 4px/8px tokens or fluid clamps.
7. **OFFICIAL BRAND LOGOMARKS:**
   Never recreate the Porsche wordmark or model scripts via regular text; always invoke `<p-wordmark>` and `<p-model-signature>`.
