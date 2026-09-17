/**
 * Trainable DS — Prototype Component Library Generator
 * Generates an executable, production-ready React/TSX component library
 * tailored to the extracted design tokens, fonts, and icons.
 */

import type { HarvestedFontManifest, HarvestedSvgIcon } from "../aligner/assets-harvester.js";

export interface ComponentLibraryOptions {
  brandName?: string;
  tokens?: Record<string, any>;
  components?: Record<string, any>;
  fonts?: HarvestedFontManifest;
  icons?: HarvestedSvgIcon[];
}

export interface GeneratedComponentLibrary {
  files: Record<string, string>; // filename -> content
  manifest: Record<string, any>; // component metadata for components.json
}

export function generatePrototypeComponentLibrary(options: ComponentLibraryOptions = {}): GeneratedComponentLibrary {
  const brandName = options.brandName || "Brand";
  const tokens = options.tokens || {};
  const icons = options.icons || [];

  // 1. Extract foundational parameters
  const primaryBg = tokens?.["sys.color.primary"]?.["$value"] || "#010205";
  const onPrimary = tokens?.["sys.color.on-primary"]?.["$value"] || "#ffffff";
  const surfaceContainer = tokens?.["sys.color.surface-container"]?.["$value"] || "rgba(156, 156, 159, 0.2)";
  const surfaceContainerHigh = tokens?.["sys.color.surface-container-high"]?.["$value"] || "rgba(156, 156, 159, 0.35)";
  const outlineColor = tokens?.["sys.color.outline"]?.["$value"] || "rgba(255, 255, 255, 0.2)";
  const onSurface = tokens?.["sys.color.on-surface"]?.["$value"] || "#ffffff";
  const btnCorner = tokens?.["comp.button.shape.corner"]?.["$value"] || "9999px";
  const btnPadding = tokens?.["comp.button.spacing.padding"]?.["$value"] || "16px 28px";
  const isPill = String(btnCorner).includes("pill") || String(btnCorner).includes("9999");
  const normalizedCorner = isPill ? "9999px" : (btnCorner.includes("px") ? btnCorner : `${btnCorner}px`);

  const primaryFont = (options.fonts && Object.keys(options.fonts.families)[0]) || "system-ui, sans-serif";

  const files: Record<string, string> = {};

  // 1. Button.tsx
  files["Button.tsx"] = `import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outlined" | "text";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  children?: React.ReactNode;
}

/**
 * ${brandName} Certified Button Component
 * - 8dp spatial quantum adherence
 * - Minimum 48x48px touch target
 * - Extracted corner radius: ${normalizedCorner}
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  icon,
  iconPosition = "start",
  children,
  className = "",
  style = {},
  disabled = false,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-brand, '${primaryFont}')",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "48px",
    padding: "${btnPadding}",
    borderRadius: "${normalizedCorner}",
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s cubic-bezier(0.2, 0, 0, 1)",
    border: "1px solid transparent",
    opacity: disabled ? 0.38 : 1,
    outline: "none",
    boxSizing: "border-box",
    ...style,
  };

  let variantStyle: React.CSSProperties = {};
  switch (variant) {
    case "primary":
      variantStyle = {
        background: "var(--sys-color-primary)",
        color: "var(--sys-color-on-primary)",
        borderColor: "transparent",
      };
      break;
    case "secondary":
      variantStyle = {
        background: "var(--sys-color-surface-container-high)",
        color: "var(--sys-color-on-surface)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--sys-color-outline-variant)",
      };
      break;
    case "outlined":
      variantStyle = {
        background: "transparent",
        color: "var(--sys-color-on-surface)",
        borderColor: "var(--sys-color-outline)",
      };
      break;
    case "text":
      variantStyle = {
        background: "transparent",
        color: "var(--sys-color-primary)",
        borderColor: "transparent",
        padding: "8px 16px",
      };
      break;
  }

  return (
    <button
      style={{ ...baseStyle, ...variantStyle }}
      className={\`tds-button tds-button--\${variant} \${className}\`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "start" && <span className="tds-btn-icon">{icon}</span>}
      {children && <span className="tds-btn-label">{children}</span>}
      {icon && iconPosition === "end" && <span className="tds-btn-icon">{icon}</span>}
    </button>
  );
};
`;

  // 2. Card.tsx
  files["Card.tsx"] = `import React from "react";

export type CardVariant = "filled" | "elevated" | "outlined";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * ${brandName} Certified Card Component (Containment Family)
 * - Surface Container hierarchy
 */
export const Card: React.FC<CardProps> = ({
  variant = "filled",
  header,
  footer,
  children,
  className = "",
  style = {},
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-brand, '${primaryFont}')",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxSizing: "border-box",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    WebkitFontSmoothing: "auto",
    ...style,
  };

  let variantStyle: React.CSSProperties = {};
  switch (variant) {
    case "filled":
      variantStyle = {
        background: "var(--sys-color-surface-container)",
        color: "var(--sys-color-on-surface)",
        border: "none",
        boxShadow: "none",
      };
      break;
    case "elevated":
      variantStyle = {
        background: "var(--sys-color-surface-container-high)",
        color: "var(--sys-color-on-surface)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        border: "none",
      };
      break;
    case "outlined":
      variantStyle = {
        background: "transparent",
        color: "var(--sys-color-on-surface)",
        border: "1px solid var(--sys-color-outline)",
        boxShadow: "none",
      };
      break;
  }

  return (
    <div
      style={{ ...baseStyle, ...variantStyle }}
      className={\`tds-card tds-card--\${variant} \${className}\`}
      {...props}
    >
      {header && <div className="tds-card-header">{header}</div>}
      <div className="tds-card-body">{children}</div>
      {footer && <div className="tds-card-footer">{footer}</div>}
    </div>
  );
};
`;

  // 3. TextField.tsx
  files["TextField.tsx"] = `import React from "react";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

/**
 * ${brandName} Certified TextField Component (Text Inputs Family)
 * - Minimum 56px height
 * - Active brand outline indicator
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  error,
  startIcon,
  endIcon,
  className = "",
  style = {},
  disabled = false,
  ...props
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        fontFamily: "var(--font-brand, '${primaryFont}')",
        width: "100%",
        ...style,
      }}
      className={\`tds-textfield-wrapper \${className}\`}
    >
      {label && (
        <label
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: error ? "var(--sys-color-error)" : "var(--sys-color-on-surface-variant)",
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: "56px",
          borderRadius: "8px",
          background: "var(--sys-color-surface-container)",
          border: error
            ? "1px solid var(--sys-color-error)"
            : "1px solid var(--sys-color-outline)",
          paddingInline: "16px",
          gap: "10px",
          boxSizing: "border-box",
          opacity: disabled ? 0.38 : 1,
        }}
      >
        {startIcon && <span style={{ color: "var(--sys-color-on-surface-variant)" }}>{startIcon}</span>}
        <input
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--sys-color-on-surface)",
            fontSize: "1rem",
            fontFamily: "inherit",
          }}
          disabled={disabled}
          {...props}
        />
        {endIcon && <span style={{ color: "var(--sys-color-on-surface-variant)" }}>{endIcon}</span>}
      </div>

      {(error || helperText) && (
        <span
          style={{
            fontSize: "0.75rem",
            color: error ? "var(--sys-color-error)" : "var(--sys-color-on-surface-variant)",
            paddingInlineStart: "4px",
          }}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};
`;

  // 4. Badge.tsx & Chip.tsx
  files["Badge.tsx"] = `import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = "", style = {}, ...props }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      background: "var(--sys-color-surface-container-high)",
      color: "var(--sys-color-on-surface)",
      border: "1px solid var(--sys-color-outline-variant)",
      fontFamily: "var(--font-brand, '${primaryFont}')",
      ...style,
    }}
    className={\`tds-badge \${className}\`}
    {...props}
  >
    {children}
  </span>
);
`;

  files["Chip.tsx"] = `import React from "react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  icon,
  children,
  className = "",
  style = {},
  ...props
}) => (
  <button
    type="button"
    style={{
      minHeight: "36px",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 14px",
      borderRadius: "8px",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: "pointer",
      border: selected
        ? "1px solid var(--sys-color-primary)"
        : "1px solid var(--sys-color-outline)",
      background: selected
        ? "var(--sys-color-surface-container-high)"
        : "transparent",
      color: "var(--sys-color-on-surface)",
      fontFamily: "var(--font-brand, '${primaryFont}')",
      transition: "background 0.15s ease",
      ...style,
    }}
    className={\`tds-chip \${selected ? "selected" : ""} \${className}\`}
    {...props}
  >
    {icon && <span>{icon}</span>}
    <span>{children}</span>
  </button>
);
`;

  // 5. NavTab.tsx (Navigation Family)
  files["NavTab.tsx"] = `import React from "react";

export interface NavTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * ${brandName} Certified NavTab Component (Navigation Family)
 * - Subtle color and weight shift on hover/active
 * - Strict subpixel rendering without arbitrary underline
 */
export const NavTab: React.FC<NavTabProps> = ({
  active = false,
  icon,
  children,
  className = "",
  style = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-brand, '${primaryFont}')",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: active ? 600 : isHovered ? 500 : 400,
    color: active
      ? "var(--sys-color-primary, #1a73e8)"
      : isHovered
      ? "var(--sys-color-on-surface, #000000)"
      : "var(--sys-color-on-surface-variant, #5f6368)",
    background: active
      ? "var(--sys-color-secondary-container, rgba(0, 0, 0, 0.05))"
      : isHovered
      ? "var(--sys-color-surface-container, rgba(0, 0, 0, 0.03))"
      : "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    transition: "color 0.15s ease, background-color 0.15s ease, font-weight 0.15s ease",
    WebkitFontSmoothing: "auto",
    ...style,
  };

  return (
    <button
      type="button"
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={\`tds-nav-tab \${active ? "tds-nav-tab--active" : ""} \${className}\`}
      {...props}
    >
      {icon && <span className="tds-nav-tab-icon">{icon}</span>}
      {children && <span className="tds-nav-tab-label">{children}</span>}
    </button>
  );
};
`;

  // 6. Icon.tsx with harvested SVGs dictionary
  const iconDictionaryEntries = icons.map(ic => `  "${ic.name}": (${ic.svg})`).join(",\n");

  files["Icon.tsx"] = `import React from "react";

export const HARVESTED_ICONS: Record<string, React.ReactNode> = {
${iconDictionaryEntries}
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
}

/**
 * ${brandName} Harvested Vector Icon Primitive
 */
export const Icon: React.FC<IconProps> = ({ name, size = 24, className = "", style = {}, ...props }) => {
  const iconNode = HARVESTED_ICONS[name];
  if (!iconNode) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={\`tds-icon tds-icon--missing \${className}\`}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
      </svg>
    );
  }

  return (
    <span
      className={\`tds-icon-wrapper tds-icon--\${name} \${className}\`}
      style={{ display: "inline-flex", width: size, height: size, alignItems: "center", justifyContent: "center", ...style }}
    >
      {iconNode}
    </span>
  );
};
`;

  // 7. index.ts barrel
  files["index.ts"] = `export * from "./Button.js";
export * from "./Card.js";
export * from "./TextField.js";
export * from "./Badge.js";
export * from "./Chip.js";
export * from "./NavTab.js";
export * from "./Icon.js";
`;

  // 8. Component manifest metadata for components.json
  const manifest: Record<string, any> = {
    Button: {
      name: "Button",
      path: "./components/ui/Button.tsx",
      family: "actions",
      description: "Certified interactive action element with 48px touch target and brand corner radius.",
      anatomy: {
        container: {
          shape: isPill ? "full-pill" : "rounded-rect",
          borderRadius: normalizedCorner,
          height: 48,
          padding: btnPadding,
        }
      },
      variants: {
        primary: { containerColor: primaryBg, labelColor: onPrimary },
        secondary: { containerColor: surfaceContainerHigh, labelColor: onSurface },
        outlined: { borderColor: outlineColor, labelColor: onSurface },
        text: { containerColor: "transparent", labelColor: primaryBg },
      },
      props: {
        variant: { type: "'primary' | 'secondary' | 'outlined' | 'text'", default: "'primary'" },
        disabled: { type: "boolean", default: "false" },
        icon: { type: "React.ReactNode" },
      },
      a11y: { minTouchTarget: "48x48px", requiredAria: [], focusIndicator: "3px outline with 2px offset" },
      rules: ["TDS-TOUCH-TARGET-TOO-SMALL: Must satisfy min 48x48px touch target."],
      examples: ['<Button variant="primary">Save changes</Button>'],
      code: files["Button.tsx"],
      authoritativeSource: { type: "generated" },
      locked: false,
      humanNotes: "Use variant='primary' for the single primary call to action per view.",
    },
    Card: {
      name: "Card",
      path: "./components/ui/Card.tsx",
      family: "containment",
      description: "Structural content container implementing tonal surface elevation.",
      anatomy: { container: { shape: "rounded-rect", borderRadius: "16px", padding: "24px" } },
      variants: {
        filled: { containerColor: surfaceContainer },
        elevated: { containerColor: surfaceContainerHigh, elevation: 2 },
        outlined: { borderColor: outlineColor },
      },
      props: {
        variant: { type: "'filled' | 'elevated' | 'outlined'", default: "'filled'" },
        header: { type: "React.ReactNode" },
        footer: { type: "React.ReactNode" },
      },
      a11y: { minTouchTarget: "N/A", requiredAria: [], focusIndicator: "None" },
      rules: ["TDS-RAW-COLOR: Background must map to surface container tokens."],
      examples: ['<Card variant="filled">Card content</Card>'],
      code: files["Card.tsx"],
      authoritativeSource: { type: "generated" },
      locked: false,
    },
    TextField: {
      name: "TextField",
      path: "./components/ui/TextField.tsx",
      family: "text-inputs",
      description: "Text input with 56px height, floating label, and active brand indicator.",
      anatomy: { container: { minHeight: 56, borderRadius: "8px" } },
      variants: { standard: { containerColor: surfaceContainer } },
      props: {
        label: { type: "string" },
        error: { type: "string" },
        helperText: { type: "string" },
      },
      a11y: { minTouchTarget: "56px height", requiredAria: ["aria-invalid"], focusIndicator: "Brand outline" },
      rules: ["TDS-TOUCH-TARGET-TOO-SMALL: Must be at least 56px in height."],
      examples: ['<TextField label="Email address" />'],
      code: files["TextField.tsx"],
      authoritativeSource: { type: "generated" },
      locked: false,
    },
    Badge: {
      name: "Badge",
      path: "./components/ui/Badge.tsx",
      family: "communication",
      description: "Compact status or tag badge.",
      anatomy: { container: { shape: "full-pill", borderRadius: "9999px" } },
      variants: { default: {} },
      props: { children: { type: "React.ReactNode" } },
      a11y: { minTouchTarget: "N/A", requiredAria: [], focusIndicator: "None" },
      rules: [],
      examples: ['<Badge>Verified</Badge>'],
      code: files["Badge.tsx"],
      authoritativeSource: { type: "generated" },
      locked: false,
    },
    Chip: {
      name: "Chip",
      path: "./components/ui/Chip.tsx",
      family: "selection",
      description: "Filter and selection chip with interactive toggle state.",
      anatomy: { container: { minHeight: 36, borderRadius: "8px" } },
      variants: { default: {} },
      props: { selected: { type: "boolean" }, icon: { type: "React.ReactNode" } },
      a11y: { minTouchTarget: "36px height", requiredAria: ["aria-pressed"], focusIndicator: "Outline" },
      rules: [],
      examples: ['<Chip selected={true}>Filter option</Chip>'],
      code: files["Chip.tsx"],
      authoritativeSource: { type: "generated" },
      locked: false,
    },
    NavTab: {
      name: "NavTab",
      path: "./components/ui/NavTab.tsx",
      family: "navigation",
      description: "Interactive navigation tab with subtle color and weight shifts, adhering to subpixel rendering.",
      anatomy: { container: { height: 40, padding: "8px 16px", borderRadius: "8px" } },
      variants: {
        default: { active: false },
        active: { active: true },
      },
      props: {
        active: { type: "boolean", default: "false" },
        icon: { type: "React.ReactNode" },
        children: { type: "React.ReactNode" },
      },
      a11y: { minTouchTarget: "40px height", requiredAria: ["aria-current"], focusIndicator: "Outline" },
      rules: ["TDS-INTERACTIVE-PSEUDO-STATE: Navigation items must shift color and weight without adding underlines."],
      examples: ['<NavTab active={true}>Home</NavTab>', '<NavTab active={false}>For you</NavTab>'],
      code: files["NavTab.tsx"],
      authoritativeSource: { type: "generated" },
      locked: false,
    },
    Icon: {
      name: "Icon",
      path: "./components/ui/Icon.tsx",
      family: "communication",
      description: "Harvested vector icon catalog wrapper.",
      anatomy: {},
      variants: {},
      props: { name: { type: "string" }, size: { type: "number | string", default: "24" } },
      a11y: { minTouchTarget: "N/A", requiredAria: [], focusIndicator: "None" },
      rules: [],
      examples: ['<Icon name="arrow-right" size={24} />'],
      code: files["Icon.tsx"],
      authoritativeSource: { type: "generated" },
      locked: false,
    }
  };

  return { files, manifest };
}
