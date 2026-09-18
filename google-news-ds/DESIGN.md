---
schema: trainable-ds/v1.7
name: Google News Design System
version: 1.2.0
mode: dual-scheme
framework: react-tailwind
tokens:
  system:
    color:
      light:
        primary: "#0b57d0"
        onPrimary: "#ffffff"
        primaryContainer: "#d3e3fd"
        onPrimaryContainer: "#0842a0"
        secondary: "#00639b"
        onSecondary: "#ffffff"
        secondaryContainer: "#c2e7ff"
        onSecondaryContainer: "#004a77"
        tertiary: "#146c2e"
        onTertiary: "#ffffff"
        surface: "#ffffff"
        onSurface: "#1f1f1f"
        surfaceContainerLow: "#f6f8fc"
        surfaceContainer: "#f0f4f9"
        surfaceContainerHigh: "#e9eef6"
        surfaceContainerHighest: "#dde3ea"
        outline: "#747775"
        outlineVariant: "#e3e3e3"
        focus: "#0b57d0"
        link: "#1a73e8"
      dark:
        primary: "#a8c7fa"
        onPrimary: "#062e6f"
        primaryContainer: "#0842a0"
        onPrimaryContainer: "#d3e3fd"
        secondary: "#7fcfff"
        onSecondary: "#003355"
        surface: "#131314"
        onSurface: "#e3e3e3"
        surfaceContainerLow: "#1b1b1b"
        surfaceContainer: "#1e1f20"
        surfaceContainerHigh: "#282a2c"
        surfaceContainerHighest: "#333537"
        outline: "#8e918f"
        outlineVariant: "#444746"
        focus: "#a8c7fa"
        link: "#8ab4f8"
    typescale:
      displayLarge:
        font: "'Google Sans', sans-serif"
        size: 57px
        line: 64px
        weight: 400
      headlineMedium:
        font: "'Google Sans', sans-serif"
        size: 28px
        line: 36px
        weight: 400
      titleLarge:
        font: "'Google Sans', sans-serif"
        size: 22px
        line: 28px
        weight: 400
      titleMedium:
        font: "'Google Sans', sans-serif"
        size: 20px
        line: 26px
        weight: 400
      titleSmall:
        font: "'Google Sans', sans-serif"
        size: 14px
        line: 20px
        weight: 400
      labelLarge:
        font: "'Google Sans', sans-serif"
        size: 14px
        line: 27px
        weight: 500
      brandWordmark:
        font: "'Product Sans', Arial, sans-serif"
        size: 22px
        line: 24px
        weight: 400
      bodyLarge:
        font: "'Google Sans Text', Roboto, sans-serif"
        size: 16px
        line: 24px
        weight: 400
      bodyMedium:
        font: "'Google Sans Text', Roboto, sans-serif"
        size: 14px
        line: 20px
        weight: 400
      bodySmall:
        font: "'Google Sans Text', Roboto, sans-serif"
        size: 12px
        line: 16px
        weight: 400
      labelMedium:
        font: "'Google Sans Text', Roboto, sans-serif"
        size: 12px
        line: 16px
        weight: 500
    state:
      hover: 0.08
      focus:
        opacity: 0.12
        ringWidth: 3px
        ringOffset: 2px
        color: "#0b57d0"
      pressed: 0.12
      disabled:
        content: 0.38
        container: 0.12
    shape:
      card: "18px"
      pill: "9999px"
      chip: "8px"
      dialog: "28px"
---

# Design System: Google News (news.google.com)

## 1. Visual Philosophy & Semantic Intent ("The Why")
> **Design Thesis:** Clean journalistic clarity powered by Material You container elevation, seamless surface contrast, official brand vector fidelity, and strictly bounded typographic hierarchy.

- **Zero-Outline Surface Architecture:** Live Google News M3 cards have **NO outline, NO border, and NO box shadow** (`border: none`, `box-shadow: none`). Spatial containment is established purely by flat white (`#ffffff`) surfaces resting against the neutral `#f6f8fc` (`rgb(246, 248, 252)`) page canvas background with signature `18px` rounded corners.
- **Official Google Vector Brandmark & Product Sans:** The "Google" logotype in the top app bar is an authentic multi-color vector SVG (`width: 74px; height: 24px`, with paths filled with Google Blue `#4285F4`, Red `#EA4335`, Yellow `#FBBC05`, and Green `#34A853`). It MUST NEVER be simulated as colored HTML text letters, which produces thin and distorted strokes. The adjacent word "News" is rendered in `Product Sans`, 22px regular (`font-weight: 400`, color `#5f6368`).
- **Strict Font Family Boundaries:**
  1. **`Google Sans` (Editorial Authority & Structure):** Applied to screen titles (28px 400), section links (20px 400), cluster headlines (22px 400), lead story titles (20px 400), sub-story headlines (14px 400), category navigation tabs (14px 500), and date labels (14px 400).
  2. **`Product Sans` (Brand Wordmarks):** Reserved specifically for the Google News brand lockup suffix ("News" 22px 400).
  3. **`Google Sans Text` / `Roboto` (Reading & Interface Density):** Applied to publisher/source names (12px 500), publication timestamps (12px 400), search bar inputs (16px 400), full-coverage pill buttons (14px 500), and login buttons (14px 500).
- **Integrated Section Containers:** Major editorial sections (e.g. "Top-Meldungen", "Lokale Nachrichten") are unified continuous card containers. Section headers ("Top-Meldungen >") reside **inside** the card container at the top, followed by an immediate 1px divider (`border-bottom: 1px solid #e3e3e3`).
- **Internal 1px Divider Separation:** Sub-stories and subsequent article entries within the continuous section card are delineated by subtle 1px dividers (`border-top: 1px solid #e3e3e3`), preserving cohesive grouping without multiplying card boundaries.

## 2. Foundations Quick-Reference
### Color Roles & Contrast Pairings
- **Primary Action:** `sys.color.primary` (#0b57d0 light / #a8c7fa dark) paired with `sys.color.on-primary` (#ffffff light / #062e6f dark).
- **Surface Hierarchy:** Body canvas is `surface-container-low` (#f6f8fc / #1b1b1b); story and weather cards use flat `surface` (#ffffff / #131314) with **zero outline and zero shadow**; search input uses `surface-container` (#f0f4f9 / #1e1f20).
- **Focus Indicator:** 3px solid outline with 2px offset in `primary` (#0b57d0 / #a8c7fa) meeting WCAG 2.2 AAA.
- **Dividers:** Internal card separators and tab borders strictly use 1px solid `outline-variant` (#e3e3e3 light / #444746 dark).

### Typography Hierarchy & Application Matrix
| UI Element | Font Family | Size | Weight | Line Height | Color | Hover Behavior | Semantic Token |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand Logo Suffix** | `Product Sans` | 22px | 400 | 24px | #5f6368 | None | `comp.topAppBar.brandSuffix` |
| **Navigation Tabs** | `Google Sans` | 14px | 500 | 27px | #5f6368 (act: #1a73e8) | `#000000` (500 weight, no underline) | `comp.navTabs` |
| **Screen Title (H1)** | `Google Sans` | 28px | 400 | 36px | #1f1f1f | None | `sys.typescale.headlineMedium` |
| **Section Link Header** | `Google Sans` | 20px | 400 | 26px | #1867dc | Underline (keeps #1867dc) | `comp.articleCard.sectionHeader` |
| **Cluster Main Headline** | `Google Sans` | 22px | 400 | 28px | #004a77 | Underline (keeps #004a77) | `comp.articleCard.clusterTitle` |
| **Lead Story Headline** | `Google Sans` | 20px | 400 | 26px | #1f1f1f | Underline (keeps #1f1f1f) | `comp.articleCard.leadTitle` |
| **Sub-Story Headlines** | `Google Sans` | 14px | 400 | 20px | #444746 | Underline (keeps #444746) | `comp.articleCard.subStoryTitle` |
| **Source / Publication** | `Google Sans Text` | 12px | 500 | 16px | #1f1f1f | Underline | `comp.articleCard.source` |
| **Timestamp Metadata** | `Google Sans Text` | 12px | 400 | 16px | #444746 | None | `comp.articleCard.timestamp` |
| **Full Coverage Action** | `Google Sans Text` | 14px | 500 | 20px | #444746 | BG `#e5e5e5`, Text `#1f1f1f` | `comp.coverageButton` |
| **Search Input** | `Google Sans Text` | 16px | 400 | 24px | #1f1f1f | Focus ring | `comp.searchBar.textColor` |
| **Date Header** | `Google Sans` | 14px | 400 | 20px | #5f6368 | None | `sys.typescale.bodyMedium` |

## 3. Certified Component Contracts Across 6 Families
1. **Actions:**
   - `Button`: Full pill (`rounded-full`), min 48px height (`h-12`), sentence case text.
   - `CoverageButton`: 40px height tonal pill (`bg-[#f2f2f2] text-[#444746] rounded-full px-4 border-none`) with blue coverage icon; hover shifts background to `#e5e5e5` and text to `#1f1f1f`.
   - `IconButton`: 48x48px touch target with centered 24px SVG icon; hover background `#f0f4f9`.
2. **Communication:**
   - `Badge`: Micro publication badge (e.g. n-tv red, spiegel orange, ZEIT black, tagesschau blue).
   - `Tooltip`: Accessible hover/focus disclosure.
   - `Snackbar`: Toast notification for user actions.
3. **Containment:**
   - `StoryCard`: Unified section container, `rounded-[18px]`, `border-none`, `shadow-none`, background `surface` (`#ffffff`), integrated section header, internal 1px dividers.
   - `WeatherCard`: Aligned at top of right column, `rounded-[18px]`, `border-none`, `shadow-none`, background `surface` (`#ffffff`).
   - `AiSummaryCard`: Gemini AI summary card aligned at top of main column, `rounded-[18px]`, `border-none`, `shadow-none`, background `surface` (`#ffffff`), Gemini sparkle vector icon with AI gradient, 3–5 bullet points with inline article links (`↗`).
   - `Dialog`: 28px radius modal for advanced settings.
   - `Divider`: 1px solid `#e3e3e3` (`outline-variant`).
4. **Navigation:**
   - `TopAppBar`: Fixed 64px header with authentic Google SVG logo (74x24px) + Product Sans "News", 46px pill search bar, and action icons.
   - `Tabs`: Horizontal category bar with `Google Sans` 500 weight (`line-height: 27px; color: #5f6368;`); on hover transitions to `#000000` with no underline; active tab `#1a73e8` with 3px blue indicator bar (`border-radius: 3px 3px 0 0`).
5. **Selection:**
   - `Chip`: 8px radius filter chip with 48px touch target.
6. **Text Inputs:**
   - `SearchBar`: Signature 46px height pill search container (`h-[46px] rounded-[28px] bg-[#f0f4f9] border-none`).

## 4. Mandatory Executable Constraints (Linter Rules)
- **Authentic Brand Vector Mandate:** The Google brandmark MUST use the authentic vector SVG (`googlelogo_clr_74x24px.svg`), never colored HTML text characters.
- **Font Boundary Mandate:**
  - Navigation tabs MUST strictly use `Google Sans` weight `500` (14px).
  - Sub-story headlines MUST strictly use `Google Sans` weight `400` (14px / 20px).
  - Lead story titles MUST strictly use `Google Sans` weight `400` (20px / 26px).
  - Cluster main titles MUST strictly use `Google Sans` weight `400` (22px / 28px, `#004a77`).
  - Brand suffix "News" MUST strictly use `Product Sans` weight `400` (22px).
  - Metadata and timestamps MUST strictly use `Google Sans Text` (12px).
- **Interactive Hover Contract Mandate:**
  - Navigation tab hover MUST transition text color from `#5f6368` to `#000000` (`rgb(0, 0, 0)`), maintaining `500` weight with NO underline.
  - Article headlines on hover MUST apply `text-decoration: underline;` and MUST NEVER turn link blue (`#1a73e8`); their text color remains `#1f1f1f` for lead stories, `#004a77` for cluster headers, and `#444746` for sub-stories.
  - Publisher sources on hover apply `text-decoration: underline;`.
  - Full coverage button on hover transitions background from `#f2f2f2` to `#e5e5e5` and text to `#1f1f1f`.
- **Subpixel Antialiasing & Font-Smoothing Mandate:**
  - `-webkit-font-smoothing` MUST remain `auto` (or default subpixel rendering), matching live Google News (`news.google.com`). Setting `-webkit-font-smoothing: antialiased` turns off subpixel antialiasing on macOS/WebKit, artificially thinning letter strokes and degrading typography fidelity.
- **Webfont Endpoint Mandate:**
  - Webfonts must load both via Google Fonts CDN stylesheet and verified local `@font-face` WOFF2 endpoints (`Google Sans 400/500/700` v62, `Google Sans Text 400/500/700` v29, `Product Sans 400` v9) to ensure zero network error fallbacks.
- **Zero-Outline Mandate:** Cards and surface containers MUST NOT have outlines or borders (`border: none`, `box-shadow: none`). Boundary separation is achieved solely by the `#ffffff` surface card on `#f6f8fc` canvas.
- **Integrated Section Header:** Section titles ("Top-Meldungen >", "Lokale Nachrichten >") MUST be placed inside the 18px card with an immediate 1px `#e3e3e3` divider underneath.
- **Continuous Multi-Story Container:** Subsequent stories in a section MUST be placed in the same 18px card container, separated by 1px `#e3e3e3` dividers.
- **Zero Raw Values:** Use semantic tokens or CSS variables.
- **Touch Target Mandate:** Every interactive element must satisfy `min-h-[48px] min-w-[48px]` or `h-12` (with standard 40px exception for inline coverage pills).
- **Sentence Case:** Labels must be written in sentence case (`Weitere Schlagzeilen und Meinungen`).
- **Zero Feature Hallucination:** Generate only what was present in the live design system.