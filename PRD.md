# Product Requirements Document (PRD)
# Project: Trainable DS — Agent-Native Design System Extractor & Compliance Engine

**Status:** Approved Specification  
**Author:** AI Pair Programmer & System Architect  
**Version:** 1.7.0 (Firebase Cloud Architecture Edition: Real-Time Sync, Hosting, Cloud Functions & MCP)  
**Target Date:** Q3-Q4 2026  
**Reference Implementations:** Google Firebase (Firestore, Hosting, Functions, Vertex AI), Google Material Design 3 (`m3.material.io`), Meta Astryx (`astryx.atmeta.com`), Google Stitch `DESIGN.md` (`google-labs-code/design.md`), W3C DTCG, Model Context Protocol (MCP).

---

## 1. Executive Summary & Vision

### 1.1 The Problem
1. **Manual Configuration Hell:** Humans have to look up package names, install multiple CLI tools, edit hidden JSON configuration files (e.g., `claude_desktop_config.json`, `.cursor/mcp.json`, Antigravity settings), and paste thousands of lines of style tokens into prompts.
2. **AI UI Drift:** Without automated context, models (Claude, Antigravity, Cursor) invent ad-hoc hex colors, create non-existent component props, bypass state layers, and fail brand compliance.
3. **The "Too Little Specific" vs. "Bloated JSON" Dilemma:** 
   - Naive text guides like standard Stitch `DESIGN.md` are accessible to LLMs but **too little specific** for enterprise use—lacking 3-tier token hierarchies, component prop interfaces, and verifiable state layers.
   - Conversely, raw DTCG JSON trees or 50,000-line Storybooks overwhelm model context windows, resulting in truncation and hallucinations.
4. **Decentralized Silos:** In multi-developer or enterprise environments, design systems drift across repositories because there is no live cloud backbone to synchronize tokens between code repositories, AI agents, and Figma canvases.

### 1.2 The Solution
**Trainable DS** is an end-to-end platform and cloud toolkit that enables teams to **"train"** (extract and derive) an enterprise-grade design system from heterogeneous inputs (existing web codebases, CSS/Tailwind configs, brand books, and written guidelines) and distribute it globally via **Google Firebase**.

Key Innovations:
1. **Firebase Cloud Backbone:**
   - **Cloud Firestore:** Real-time single source of truth for 3-tier M3 tokens, component manifests, lock states (`tds:locked`), and version history.
   - **Firebase Hosting:** Global edge CDN serving the **Agent Developer Portal (`/llms.txt`)**, root `DESIGN.md`, and the Human Visual Inspector Web UI.
   - **Cloud Functions (2nd Gen) & Cloud Run:** Serverless compute running the **Headless Evaluation API (`POST /api/v1/evaluate`)**, remote **MCP Server** (over SSE/HTTP), and Gemini-powered extraction.
2. **Astryx-Style "Agent-First Developer Portal" Onboarding:**
   A user does not need to read documentation or configure tools. The user simply tells their AI assistant:
   > **"Use Trainable DS in this project"** *(or "Connect this project to our Acme Design System at https://acme-ds.web.app")*
3. **Enhanced `DESIGN.md` Facade (Stitch Paradigm):** Automatically compiles a clean, human-readable, root-level `DESIGN.md` pairing semantic YAML frontmatter with design philosophy ("The Why") and executable constraints.
4. **Material Design 3 (M3) Fidelity:** Inferred systems capture the complete dimensional depth of M3: 3-tier tokens (Reference $\to$ System $\to$ Component), HCT color space tonal palettes (0–100), 36+ semantic color roles, interaction state layers, 15-tier typescales, elevation surface tinting, 6 component functional families, canonical layouts, and RTL bidirectionality.
5. **Universal Closed-Loop Self-Correction:** An AI agent (Antigravity, Claude, Cursor) ingests the artifact, generates a candidate prototype, submits it to the Trainable DS Compliance Engine, receives structured critique/diagnostics, and self-patches the code until it reaches **100% design system compliance**.

---

## 2. Core Tenets & Guiding Principles

1. **Firebase-Powered Real-Time Distribution:** The design system is a live cloud entity. Changes made by design system leads in the web dashboard propagate instantly via Firestore real-time listeners to connected agent IDEs, local CLI daemons, and Figma plugins.
2. **Autonomous Zero-Friction Onboarding (Astryx Parity):** If a user tells their AI *"Use Trainable DS"*, the agent discovers instructions via `https://<app>.web.app/llms.txt`, installs dependencies, auto-configures its own MCP connection, and wires up workspace rules autonomously.
3. **Derive at Full Material Design 3 (M3) Fidelity:** Inferred design systems must capture the complete dimensional depth of M3: 3-tier tokens, HCT tonal palettes, 36+ semantic roles, 5 state layers, 15-tier typescale, elevation surface tinting, 6 component families, 5 window size classes, and $\ge 48\times 48\text{dp}$ touch targets.
4. **The "Enhanced `DESIGN.md`" Facade (Stitch Paradigm):** The system auto-compiles a single, human-readable, root-level `DESIGN.md` file pairing YAML frontmatter tokens with natural language design rationale ("the why").
5. **Omni-Surface AI Interoperability:** Support Agentic IDEs (Antigravity, Claude Code, Cursor), chat web builders (ChatGPT, v0, Lovable), visual design tools (Figma AI), and CI/CD pipelines (GitHub Actions).
6. **Closed-Loop Self-Correction:** Generation is only step one. Multi-tier evaluation (static AST linting, token strictness, accessibility checks, semantic LLM critique, and visual canvas inspection) accessible via CLI, MCP, REST, or Figma plugin.

---

## 3. Firebase Cloud Architecture & System Topology

```mermaid
flowchart TD
    subgraph HumanUI["1. Human Governance & Web Inspector"]
        DSLead["Design System Owner / Lead"]
        WebPortal["Web Inspector & Token Matrix\n(Hosted on Firebase Hosting)"]
        Auth["Firebase Authentication\n(RBAC: Owners, Reviewers, Agent API Keys)"]
    end

    subgraph DataStore["2. Real-Time Cloud Storage & Versioning"]
        Firestore["Cloud Firestore\n- 3-Tier M3 Tokens (Ref, Sys, Comp)\n- Component Manifests\n- Human Lock States (tds:locked)\n- Version History (v1.0, v1.1)"]
        Storage["Cloud Storage for Firebase\n- Compact Bundles (agent-context.compact.md)\n- Raw Source Code & Brand PDFs\n- Figma Token Exports"]
    end

    subgraph Compute["3. AI Extraction & Compliance Engine"]
        CloudRun["Cloud Functions (2nd Gen) / Cloud Run\n- Semantic Extraction Engine (Vertex AI / Gemini)\n- Headless Evaluation API (POST /api/v1/evaluate)\n- Remote MCP Server (SSE / HTTP Transport)\n- Figma Sync Webhook"]
    end

    subgraph AgentPortal["4. Agent Discovery & Ingestion"]
        LLMsTxt["Firebase Hosting Edge CDN\n- https://your-ds.web.app/llms.txt\n- https://your-ds.web.app/DESIGN.md"]
    end

    subgraph Surfaces["5. Connected Generation Surfaces"]
        Agent["AI Coding Agents\n(Antigravity, Claude, Cursor)"]
        Figma["Figma AI / Figma Plugin"]
        CI["GitHub Actions (CI/CD)"]
    end

    DSLead <--> Auth
    Auth <--> WebPortal
    WebPortal <--> Firestore

    Compute <--> Firestore
    Compute <--> Storage

    Firestore --> LLMsTxt
    LLMsTxt --> Agent
    CloudRun <--> Agent
    CloudRun <--> Figma
    CloudRun <--> CI
```

---

## 4. The 1-Prompt Autonomous Onboarding Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Agent as AI Coding Agent (Antigravity / Claude / Cursor)
    participant Portal as Firebase Hosting CDN (https://ds-app.web.app/llms.txt)
    participant CLI as Trainable DS CLI (npx tds)
    participant Project as User Codebase

    User->>Agent: "Use Trainable DS from https://ds-app.web.app"
    Agent->>Portal: Fetches `/llms.txt`
    Portal-->>Agent: Returns machine instructions & remote MCP config
    Agent->>CLI: Executes `npx @trainable-ds/cli init --remote https://ds-app.web.app`
    CLI->>Project: Detects framework (React, Tailwind, Next.js)
    CLI->>Agent: Auto-configures MCP server pointing to remote SSE endpoint
    CLI->>Project: Pulls certified `DESIGN.md`, `.cursorrules`, and tokens
    CLI-->>Agent: Setup complete. Remote MCP live.
    Agent-->>User: "Trainable DS is initialized and connected to Firebase Cloud. Ready to build compliant UI!"
```

---

## 5. Storage Format & Dual-Layer Artifact Specification

All derived data is structured locally in `.design-system/` and mirrored in Cloud Firestore:

```
.design-system/
├── tds.config.yaml             # Master configuration, framework targets, lock states
├── tokens.json                 # W3C DTCG compliant 3-tier tokens (Reference, System, Component)
├── components.manifest.json    # Machine-readable M3 component anatomy, props, and variant specs
├── rules.md                    # Human-readable & LLM-friendly composition rules & anti-patterns
└── dist/
    ├── agent-context.compact.md  # Token-budgeted context bundle (<6k tokens)
    └── linter-rules.json        # Compiled AST / ESLint rules for static compliance checking
```

### 5.1 Firestore Document Schema
- `design_systems/{dsId}`: Master document with brand metadata and locked status.
- `design_systems/{dsId}/tokens/reference`: HCT tonal palettes (tones 0–100), spatial units, typefaces.
- `design_systems/{dsId}/tokens/system`: 36+ semantic color roles (light/dark), 15-tier typescale, state opacities, elevation tint percentages.
- `design_systems/{dsId}/tokens/component`: Scoped component tokens (e.g. `filled-button`, `card`).
- `design_systems/{dsId}/components/{componentName}`: Anatomical slots, TypeScript props, variant enums, touch target assertions.
- `design_systems/{dsId}/rules/general`: Rationale ("The Why"), sentence-case mandate, executable constraints.

---

## 6. The Enhanced `DESIGN.md` Specification

The auto-compiled root `DESIGN.md` acts as the portable bridge for all file-based AI agents:

```markdown
---
schema: "trainable-ds/v1.7"
name: "Acme Enterprise Design System"
version: "1.7.0"
mode: "dual-scheme"
framework: "react-tailwind"

tokens:
  reference:
    palette:
      primary: { 40: "#00639b", 80: "#97cbff", 90: "#cde5ff" }
      neutral: { 10: "#1a1c1e", 90: "#e2e2e6" }
  system:
    color:
      light:
        primary: "{reference.palette.primary.40}"
        on-primary: "#ffffff"
        primary-container: "{reference.palette.primary.90}"
        on-primary-container: "#001d32"
        surface: "#fdfcff"
        surface-container: "#f0f0f4"
        surface-container-high: "#eaeaf0"
        outline: "#72777f"
      dark:
        primary: "{reference.palette.primary.80}"
        on-primary: "#003353"
        primary-container: "#004a74"
        on-primary-container: "{reference.palette.primary.90}"
        surface: "#1a1c1e"
        surface-container: "#202326"
    typescale:
      headline-medium: { font: "Inter", size: "28px", line: "36px", weight: 600, track: "0px" }
      body-large: { font: "Inter", size: "16px", line: "24px", weight: 400, track: "0.5px" }
      label-large: { font: "Inter", size: "14px", line: "20px", weight: 500, track: "0.1px" }
    state:
      hover: 0.08
      focus: { opacity: 0.10, ring: "3px", offset: "2px" }
      pressed: 0.10
      dragged: 0.16
      disabled: { content: 0.38, container: 0.12 }
    elevation:
      level-0: { shadow: "none", tint: "0%" }
      level-1: { shadow: "0 1px 2px rgba(0,0,0,0.15)", tint: "5%" }
      level-2: { shadow: "0 2px 4px rgba(0,0,0,0.20)", tint: "8%" }
      level-3: { shadow: "0 4px 8px rgba(0,0,0,0.20)", tint: "11%" }
---

# Design System: Acme Design System

## 1. Visual Philosophy & Semantic Intent ("The Why")
> **Design Thesis:** Acme UI embodies **functional clarity and calm density**. Our software powers high-throughput operational analysts.
> - **Visual Calm:** We avoid saturated background fills; surfaces use subtle tonal containers (`surface-container-low` through `high`) to organize information without visual fatigue.
> - **Intentional Color:** Primary action color is reserved strictly for interactive user focus. Never use the primary color for non-interactive decorative elements.
> - **Spatial Discipline:** Strict 8px baseline grid to guarantee visual cadence across complex data tables.

## 2. Foundations Quick-Reference
### Color Roles & Contrast Pairings
- **Primary Action:** `sys.color.primary` paired with `sys.color.on-primary`.
- **Containers:** Use `sys.color.surface-container` for resting cards, `surface-container-high` for elevated dialogs.
- **Fixed Roles:** `primary-fixed` retains luminance across light/dark modes for media and highlight chips.

### Typography Hierarchy (Sentence Case)
- Headers: `headline-medium` (28/36, 600) — Always sentence case.
- Content: `body-large` (16/24, 400) for prose; `body-medium` (14/20, 400) for metadata.
- Interactive Labels: `label-large` (14/20, 500) — Enforce sentence case on all buttons and chips.

### State Layers & Elevation Tinting
- Hover: 8% overlay of `on-*` color.
- Focus: 10% overlay + 3px outline with 2px offset.
- Disabled: 38% opacity on text/icons, 12% on container fills.
- Dark mode elevation relies on primary surface tint overlay (0% to 14%).

## 3. Core Component Library (Contracts & Import Signatures)
*Always import and compose existing primitives. Never build ad-hoc HTML buttons or inputs.*

### Button (`@/components/ui/button`)
- **Import:** `import { Button } from "@/components/ui/button";`
- **Variants:** `filled` (default primary), `elevated`, `tonal`, `outlined`, `text`.
- **Sizes:** `sm`, `md`, `lg` (all guarantee $\ge 48\times 48\text{px}$ touch target on mobile).
- **Example:**
```tsx
<Button variant="filled" size="md" leftIcon={<IconSave />}>
  Save changes
</Button>
```

## 4. Executable Constraints & Anti-Patterns (Evaluated by `tds evaluate`)
1. **NO RAW HEX CODES:** Do not use `#...` or `rgb(...)` in inline styles or Tailwind classes. Map all colors to `sys.color.*`.
2. **NO AD-HOC REINVENTIONS:** Do not write `<button className="...">` or `<input className="...">`. Always import `<Button>` or `<TextField>`.
3. **SENTENCE CASE MANDATE:** Button and menu labels MUST be sentence case (e.g., "Submit application", NOT "Submit Application").
4. **ON-COLOR PAIRING:** Elements with `bg-primary` MUST use text colored with `text-on-primary`.
5. **MINIMUM TOUCH TARGET:** All clickable elements must have an active target of at least 48x48px on compact viewports.
6. **SURFACE CONTAINMENT OVER GHOST OUTLINES:** Never apply arbitrary 1px borders or drop-shadows to cards or content surfaces. Modern flat container architectures establish visual hierarchy strictly through tonal surface contrast (`surface-container-lowest` through `highest`).
7. **SUBPIXEL RENDERING CONTRACT:** Never inject `-webkit-font-smoothing: antialiased;` across stylesheets, as this causes grayscale rasterization and erodes 100–150 weight units from typography on macOS/WebKit. Enforce `-webkit-font-smoothing: auto;`.
8. **ASSET VECTOR SANCTITY:** Always render brand marks and logos as authentic SVG vectors from `icons.json` rather than approximating them with styled HTML text spans.
```

---

## 7. The Autonomous Multi-Tier Compliance Engine

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Surface as ANY AI Surface (Claude, Antigravity, Figma AI)
    participant Evaluator as Trainable DS Compliance Engine (CLI / Firebase REST / MCP)
    participant Sandbox as Execution / DOM Sandbox

    User->>Surface: "Generate user account billing screen"
    Surface->>Surface: Read root `DESIGN.md` or query MCP
    Surface->>Surface: Generate Candidate UI
    
    loop Compliance Verification Loop (Max 5 Iterations)
        Surface->>Evaluator: `tds evaluate BillingScreen.tsx` (or POST to Firebase)
        Evaluator->>Evaluator: Tier 1: Static AST Token Audit (0 raw hex, valid scales)
        Evaluator->>Evaluator: Tier 2: Component Reuse & On-Color Pair Audit
        Evaluator->>Sandbox: Tier 3: Render, A11y (axe-core), 48dp Touch Target & RTL Audit
        Evaluator->>Evaluator: Tier 4: Semantic LLM Rubric against `DESIGN.md` Constraints
        alt Violations Found (Score < 100)
            Evaluator-->>Surface: Machine-Actionable Diagnostics (Errors, lines, remediation)
            Surface->>Surface: Apply self-correction patch
        else Fully Compliant (Score = 100)
            Evaluator-->>Surface: Certification Passed (Zero Violations)
        end
    end
    Surface->>User: Deliver certified, 100% compliant prototype
```

---

## 8. Phased Implementation Roadmap

```mermaid
gantt
    title Trainable DS Implementation Milestones (Firebase Edition)
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Schemas & CLI
    Core Schema Engine (M3 DTCG 3-Tier)  :2026-09-10, 15d
    Component Manifest & Rationale Spec  :2026-09-20, 15d
    Enhanced `DESIGN.md` Compiler        :2026-09-30, 10d
    CLI Core (`tds init`, `evaluate`)    :2026-10-10, 15d
    section Phase 2: Ingestion & Extraction
    Babel/PostCSS Ingestion Engine       :2026-10-20, 15d
    HCT Color Space & Role Synthesizer   :2026-11-05, 15d
    15-tier Typescale & State Layer      :2026-11-15, 12d
    section Phase 3: Firebase Cloud Hub
    Firebase Project & Firestore Rules   :2026-11-25, 10d
    Hosting Agent Portal (`llms.txt`)    :2026-12-05, 10d
    Cloud Functions Evaluation REST API  :2026-12-15, 12d
    Remote MCP Server (SSE on Cloud Run) :2026-12-25, 12d
    section Phase 4: Compliance Engine & Figma
    4-Tier Evaluation Engine             :2027-01-05, 18d
    Figma Variables Sync Engine          :2027-01-20, 15d
    GitHub Action Gatekeeper             :2027-02-05, 12d
```

---

## 9. Success Metrics & KPIs

1. **Autonomous Setup Success Rate:** ≥ 95% of AI agents (Antigravity, Claude, Cursor) successfully self-install dependencies, configure MCP, and wire `DESIGN.md` from the single prompt *"Use Trainable DS"*.
2. **Cloud Synchronization Latency:** Token changes published in Firestore propagate to connected IDEs and Figma in **< 1.5 seconds**.
3. **M3 Taxonomy Coverage:** 100% of inferred systems generate the 3-tier token structure, 36+ semantic color roles, 15 typescale tiers, and 5 state layer definitions.
4. **AI Compliance Improvement:** Rate of ad-hoc hex codes, unmapped spacing, and off-brand font sizes drops to **0%** after running through the Trainable DS evaluation loop.
5. **Touch Target Adherence:** 100% of interactive elements meet the M3 $\ge 48\times 48\text{px}$ touch target mandate.
6. **Sentence-Case Enforcement:** 100% compliance with sentence-case typography on button labels, chip texts, and headers.
7. **Time-to-Certified-Prototype:** Under 90 seconds from initial user prompt to certified, 100% compliant multi-component screen.
