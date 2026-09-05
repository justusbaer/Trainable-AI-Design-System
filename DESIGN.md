---
schema: trainable-ds/v1.7
name: Trained Design System
version: 1.0.0
mode: dual-scheme
framework: react-tailwind
tokens:
  system:
    color:
      light:
        primary: "#3c485c"
        onPrimary: "#ffffff"
        primaryContainer: "#d9dee7"
        onPrimaryContainer: "#020307"
        surface: "#f8f8f9"
        onSurface: "#030304"
        surfaceContainer: "#dededf"
        surfaceContainerHigh: "#bdbdc0"
        outline: "#72777f"
      dark:
        primary: "#b4becf"
        onPrimary: "#0f1622"
        primaryContainer: "#232e40"
        onPrimaryContainer: "#d9dee7"
        surface: "#030304"
        onSurface: "#dededf"
        surfaceContainer: "#030304"
        surfaceContainerHigh: "#161618"
        outline: "#8c9199"
    typescale:
      headlineMedium:
        font: Inter, sans-serif
        size: 28px
        line: 36px
        weight: 400
      bodyLarge:
        font: Inter, sans-serif
        size: 16px
        line: 24px
        weight: 400
      labelLarge:
        font: Inter, sans-serif
        size: 14px
        line: 20px
        weight: 500
    state:
      hover: 0.08
      focus:
        opacity: 0.1
        ringWidth: 3px
        ringOffset: 2px
      pressed: 0.1
      disabled:
        content: 0.38
        container: 0.12
    elevation:
      level0:
        tint: 0
      level1:
        tint: 0.05
      level2:
        tint: 0.08
      level3:
        tint: 0.11
---

# Design System: Trained Design System

## 1. Visual Philosophy & Semantic Intent ("The Why")
> **Design Thesis:** Functional clarity, high information density, and brand consistency.
- Surfaces use subtle tonal containers to organize data without visual fatigue.
- Primary action color is reserved strictly for interactive user focus.
- Strict 8px baseline grid to guarantee visual rhythm across views.

## 2. Foundations Quick-Reference
### Color Roles & Contrast Pairings
- **Primary Action:** `sys.color.primary` (#3c485c) paired with `sys.color.on-primary` (#ffffff).
- **Surface Hierarchy:** Default card container is `surface-container` (#dededf); elevated dialogs use `surface-container-high` (#bdbdc0).
- **Border Outline:** 3:1 accessible boundaries use `outline` (#72777f).

### Typography Hierarchy (Sentence Case)
- **Headline Medium:** 28px/36px (400 weight)
- **Body Large:** 16px/24px (400 weight)
- **Label Large:** 14px/20px (500 weight) — Used on buttons, chips, tabs.

### Interaction State Layers
- **Hover:** 8% overlay of paired `on-*` token.
- **Focus:** 10% overlay + 3px outline ring.
- **Disabled:** 38% text opacity, 12% container fill opacity.

## 3. Core Component Library (Certified Contracts)
*Always import and compose certified primitives. Never construct ad-hoc HTML buttons or inputs.*

### CleanCard (`./playground/CleanCard.tsx`)
- **Import:** `import { CleanCard } from "./playground/CleanCard.tsx";`
- **Family:** containment
- **Description:** Design system CleanCard component belonging to the containment family.
- **Variants:** default
```tsx
<CleanCard variant="default">
  Action text
</CleanCard>
```

### DirtyCard (`./playground/DirtyCard.tsx`)
- **Import:** `import { DirtyCard } from "./playground/DirtyCard.tsx";`
- **Family:** containment
- **Description:** Design system DirtyCard component belonging to the containment family.
- **Variants:** default
```tsx
<DirtyCard variant="default">
  Action text
</DirtyCard>
```


## 4. Executable Constraints & Anti-Patterns (Evaluated by `tds evaluate`)
> [!CAUTION]
> The following rules are enforced by the automated compliance engine. Violations will fail certification:

1. **NO RAW HEX CODES:**  All colors must resolve to semantic tokens (e.g. sys.color.primary).
2. **NO REINVENTED PRIMITIVES:**  Always import certified components (<Button>, <TextField>) instead of raw HTML.
3. **SENTENCE CASE MANDATE:**  All button, navigation, and chip labels MUST be sentence case.
4. **ON-COLOR PAIRING:**  Backgrounds using sys.color.primary MUST use text colored with sys.color.on-primary.
5. **MINIMUM TOUCH TARGET:**  All clickable elements must maintain at least 48x48px touch targets.
