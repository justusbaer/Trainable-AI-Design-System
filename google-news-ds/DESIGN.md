---
schema: trainable-ds/v1.7
name: Google News Design System
version: 1.3.0
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
        outlineShowcase: "#c7c7c7"
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
        outlineShowcase: "#444746"
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
      cardContainer: "18px"
      card: "16px"
      dialog: "28px"
      followPill: "36px"
      menu: "4px"
      subCard: "8px"
      thumbnail: "12px"
      pill: "9999px"
      chip: "8px"
    elevation:
      level0: "none"
      level1: "rgba(60,64,67,0.15) 0px 1px 3px 1px"
      level2: "rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px"
      level3: "rgba(60, 64, 67, 0.3) 0px 1px 3px 0px, rgba(60, 64, 67, 0.15) 0px 4px 8px 3px"
---

# Design System: Google News (news.google.com)

## 1. Visual Philosophy & Semantic Intent ("The Why")
> **Design Thesis:** Clean journalistic clarity powered by Material You container elevation, seamless surface contrast, official brand vector fidelity, and strictly bounded typographic hierarchy.

### The Unified Completeness Architecture: Material 3 + Meta Astryx
Google News is modeled using the combined architectural strengths of **Material Design 3 (M3)** and **Meta Astryx**:
- **Material 3 (M3) Foundations:** 3-tier DTCG token hierarchy, HCT tonal color science, semantic `on-*` color pairing, micro-interaction state layers (hover 0.08, focus 0.12, pressed 0.12), and the 6 functional component families.
- **Meta Astryx Anatomy & Robustness:** Standardized atomic slot contracts (`leadingAccessory`, `content`, `trailingAccessory`, `action`), formal layout primitives (`Stack`, `Cluster`, `Split`, `Surface`), compound lifecycle states (`Idle`, `Loading/Skeleton Shimmer`, `Empty State`, `Error/Degraded State`), adaptive density tiers, and overlay/portal dismissal contracts (focus trap, Escape listener, backdrop dismiss).

### Ground Truth & Live Production Reality
- **Surface Containment & The Card Border Nuance:**
  - **Feed & Search Surfaces (Flat Zero-Outline):** Live Google News Home feed and Search result cards have **NO outline, NO border, and NO box shadow** (`border: none`, `box-shadow: none`). Spatial containment is established purely by flat white (`#ffffff`) surfaces resting against the neutral `#f6f8fc` (`rgb(246, 248, 252)`) page canvas background.
  - **News Showcase (Outlined Cards):** In direct contrast, **News Showcase (`/showcase`) cards are explicitly M3 Outlined Cards** (`border: 1px solid #c7c7c7` / `outline-showcase`, with `16px` border-radius). The design system formalizes both types: flat surface cards for feeds, and outlined cards for editorial curation.
- **Multi-Tier Corner Radius Hierarchy:**
  - `18px` (`sys.shape.cardContainer`): Continuous multi-story section containers on the Home feed.
  - `16px` (`sys.shape.card`): Single article cards on Search, Topic feeds, and News Showcase.
  - `28px` (`sys.shape.dialog`): Dialogs, Modals, and the Advanced Search form panel.
  - `8px` (`sys.shape.subCard` / `sys.shape.chip`): Full Coverage perspective sub-cards and Filter Chips.
  - `4px` (`sys.shape.menu`): Context Menus, Popovers, and Autocomplete dropdowns.
  - `36px` (`sys.shape.followPill`): Follow / Save pill buttons (`height: 36px`).
  - `9999px` (`sys.shape.pill`): Primary action buttons, search bar, coverage pill button.
  - `12px` (`sys.shape.thumbnail`): Article media thumbnails.
- **Floating Overlays & Elevation:**
  - Base canvas cards are strictly **0 elevation** (flat contrast).
  - Floating surfaces (**Dialogs**, **3-dots Context Menus**, **Search Autocomplete**) strictly enforce **M3 ambient elevation shadows** (Level 2 for menus, Level 3 for dialogs) with backdrop overlay and Escape key dismissal.
- **Official Google Vector Brandmark & Product Sans:**
  - The "Google" logotype in the top app bar is an authentic multi-color vector SVG (`74x24px`, filled with Google Blue `#4285F4`, Red `#EA4335`, Yellow `#FBBC05`, and Green `#34A853`). NEVER simulate as colored text letters. The adjacent word "News" is strictly `Product Sans`, 22px regular (`font-weight: 400`, color `#5f6368`).
- **Strict Font Family Boundaries:**
  1. **`Google Sans` (Editorial Authority & Structure):** Applied to screen titles (28px 400), section links (20px 400), cluster headlines (22px 400), lead story titles (20px 400), sub-story headlines (14px 400), category navigation tabs (14px 500), and date labels (14px 400).
  2. **`Product Sans` (Brand Wordmarks):** Reserved specifically for the Google News brand lockup suffix ("News" 22px 400).
  3. **`Google Sans Text` / `Roboto` (Reading & Interface Density):** Applied to publisher/source names (12px 500), publication timestamps (12px 400), search bar inputs (16px 400), full-coverage pill buttons (14px 500), follow buttons (14px 500), and dialog body text (14px 400).

---

## 2. Foundations Quick-Reference

### Color Roles & Contrast Pairings
- **Primary Action:** `sys.color.primary` (#0b57d0 light / #a8c7fa dark) paired with `sys.color.on-primary` (#ffffff light / #062e6f dark).
- **Surface Hierarchy:** Body canvas is `surface-container-low` (#f6f8fc / #1b1b1b); story cards use flat `surface` (#ffffff / #131314); search input and advanced search use `surface-container` (#f0f4f9 / #1e1f20).
- **Dividers & Outlines:** Internal card separators strictly use 1px solid `outline-variant` (#e3e3e3 light / #444746 dark). Showcase outlined cards use 1px solid `outline-showcase` (#c7c7c7 light / #444746 dark).
- **Focus Indicator:** 3px solid outline with 2px offset in `primary` (#0b57d0 / #a8c7fa) meeting WCAG 2.2 AAA.

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
| **Follow / Save Action** | `Google Sans Text` | 14px | 500 | 20px | #1f1f1f | Tonal BG `#d3e3fd` on active | `comp.followButton` |
| **Search Input** | `Google Sans Text` | 16px | 400 | 24px | #1f1f1f | Focus ring | `comp.searchBar.textColor` |
| **Date Header** | `Google Sans` | 14px | 400 | 20px | #5f6368 | None | `sys.typescale.bodyMedium` |

---

## 3. Certified Component Contracts Across 6 Families (with Astryx Slot Anatomy)

1. **Actions:**
   - `Button`: Full pill (`rounded-full`), min 48px height (`h-12`), sentence case text.
   - `CoverageButton`: 40px height tonal pill (`bg-[#f2f2f2] text-[#444746] rounded-full px-4 border-none`) with blue coverage icon; hover shifts background to `#e5e5e5` and text to `#1f1f1f`.
   - `FollowButton`: 36px height pill button (`h-9 rounded-[36px] px-4`) with star/check vector icon; toggles between outlined and primary-container tonal state.
   - `IconButton`: 48x48px touch target with centered 24px SVG icon; hover background `#f0f4f9`.
2. **Communication:**
   - `Badge`: Micro publication badge (e.g. n-tv red, spiegel orange, ZEIT black, tagesschau blue).
   - `Tooltip`: Accessible hover/focus disclosure.
   - `Snackbar`: Toast notification for user actions.
   - `SocialEmbedCard`: Full coverage social post card (`rounded-[8px] border border-outline-variant p-4`) with author avatar, verified badge, X logo, and post text.
3. **Containment:**
   - `StoryCard`: Unified section container, `rounded-[18px]`, `border-none`, `shadow-none`, background `surface` (`#ffffff`), integrated section header, internal 1px dividers.
   - `ShowcaseCard`: M3 Outlined card, `rounded-[16px]`, `border: 1px solid #c7c7c7`, `shadow-none`, background `surface` (`#ffffff`), with publisher banner and follow button in top slot.
   - `WeatherCard`: Aligned at top of right column, `rounded-[18px]`, `border-none`, `shadow-none`, background `surface` (`#ffffff`).
   - `AiSummaryCard`: Gemini AI summary card aligned at top of main column, `rounded-[18px]`, `border-none`, `shadow-none`, background `surface` (`#ffffff`), Gemini sparkle vector icon with AI gradient, 3–5 bullet points with inline article links (`↗`).
   - `Dialog`: 28px radius modal (`rounded-[28px]`), Level 3 ambient shadow, backdrop overlay, focus trapping, and Escape key dismissal.
   - `ContextMenu`: 4px radius dropdown (`rounded-[4px]`), Level 2 ambient shadow, 48px item touch targets, backdrop dismiss.
   - `Divider`: 1px solid `#e3e3e3` (`outline-variant`).
4. **Navigation:**
   - `TopAppBar`: Fixed 64px header with authentic Google SVG logo (74x24px) + Product Sans "News", 46px pill search bar, and action icons.
   - `Tabs`: Horizontal category bar with `Google Sans` 500 weight (`line-height: 27px; color: #5f6368;`); on hover transitions to `#000000` with no underline; active tab `#1a73e8` with 3px blue indicator bar (`border-radius: 3px 3px 0 0`).
5. **Selection:**
   - `Chip`: 8px radius filter chip with 48px touch target.
   - `RadioButton`: Accessible M3 selection control for language & settings dialog.
6. **Text Inputs:**
   - `SearchBar`: Signature 46px height pill search container (`h-[46px] rounded-[28px] bg-[#f0f4f9] border-none`).
   - `AdvancedSearchPanel`: 28px radius surface-container drawer/panel (`bg-[#f0f4f9] rounded-[28px] p-6`) with multi-clause query inputs and action pills.

---

## 4. Compound Lifecycle States (Astryx Parity)
- **Idle State:** Standard populated view with rich metadata.
- **Loading / Skeleton Shimmer:** Animated shimmer bars with exact typography height (`h-5 rounded-md bg-gray-200 animate-pulse`).
- **Empty State:** Illustrated empty container with centered message and call-to-action button (e.g. "Keine Suchergebnisse für ...").
- **Error / Degraded State:** Subtle inline error banner with retry action pill.

---

## 5. Mandatory Executable Constraints (Linter Rules)
- **Authentic Brand Vector Mandate:** The Google brandmark MUST use the authentic vector SVG (`googlelogo_clr_74x24px.svg`), never colored HTML text characters.
- **Font Boundary Mandate:**
  - Navigation tabs MUST strictly use `Google Sans` weight `500` (14px).
  - Sub-story headlines MUST strictly use `Google Sans` weight `400` (14px / 20px).
  - Lead story titles MUST strictly use `Google Sans` weight `400` (20px / 26px).
  - Cluster main titles MUST strictly use `Google Sans` weight `400` (22px / 28px, `#004a77`).
  - Brand suffix "News" MUST strictly use `Product Sans` weight `400` (22px).
  - Metadata, timestamps, and body text MUST strictly use `Google Sans Text` (12px / 14px).
- **Interactive Hover Contract Mandate:**
  - Navigation tab hover MUST transition text color from `#5f6368` to `#000000`, maintaining `500` weight with NO underline.
  - Article headlines on hover MUST apply `text-decoration: underline;` and MUST NEVER turn link blue (`#1a73e8`); their text color remains `#1f1f1f` for lead stories, `#004a77` for cluster headers, and `#444746` for sub-stories.
  - Full coverage button on hover transitions background from `#f2f2f2` to `#e5e5e5` and text to `#1f1f1f`.
- **Card Surface & Border Invariant:**
  - Standard Story Cards and Feed Containers MUST NOT have outlines or borders (`border: none`, `box-shadow: none`).
  - News Showcase Cards MUST use 1px solid `outline-showcase` (`border: 1px solid #c7c7c7`, `rounded-[16px]`).
- **Overlay Elevation Mandate:**
  - Modals/Dialogs MUST use `rounded-[28px]` with M3 Level 3 elevation shadow.
  - Context Menus MUST use `rounded-[4px]` with M3 Level 2 elevation shadow.
- **Follow Action Mandate:**
  - Follow and Save actions MUST use `rounded-[36px]` with `min-height: 36px` or `h-9`.
- **Touch Target Mandate:** Every interactive element must satisfy `min-h-[48px] min-w-[48px]` (with 36px/40px standard exceptions for inline follow and coverage pills).
- **Sentence Case:** Labels must be written in sentence case (`Weitere Schlagzeilen und Meinungen`).
