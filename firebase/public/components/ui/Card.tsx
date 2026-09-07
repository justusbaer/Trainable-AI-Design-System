import React from "react";

export type CardVariant = "filled" | "elevated" | "outlined";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Trainable Design System Certified Card Component (Containment Family)
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
    fontFamily: "var(--font-brand, 'Inter', system-ui, sans-serif)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxSizing: "border-box",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    ...style,
  };

  let variantStyle: React.CSSProperties = {};
  switch (variant) {
    case "filled":
      variantStyle = {
        background: "var(--sys-color-surface-container)",
        color: "var(--sys-color-on-surface)",
        border: "1px solid var(--sys-color-outline-variant)",
      };
      break;
    case "elevated":
      variantStyle = {
        background: "var(--sys-color-surface-container-high)",
        color: "var(--sys-color-on-surface)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
        border: "1px solid var(--sys-color-outline-variant)",
      };
      break;
    case "outlined":
      variantStyle = {
        background: "transparent",
        color: "var(--sys-color-on-surface)",
        border: "1px solid var(--sys-color-outline)",
      };
      break;
  }

  return (
    <div
      style={{ ...baseStyle, ...variantStyle }}
      className={`tds-card tds-card--${variant} ${className}`}
      {...props}
    >
      {header && <div className="tds-card-header">{header}</div>}
      <div className="tds-card-body">{children}</div>
      {footer && <div className="tds-card-footer">{footer}</div>}
    </div>
  );
};
