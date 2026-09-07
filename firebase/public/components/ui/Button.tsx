import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outlined" | "text";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  children?: React.ReactNode;
}

/**
 * Trainable Design System Certified Button Component
 * - 8dp spatial quantum adherence
 * - Minimum 48x48px touch target
 * - Extracted corner radius: 9999px
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
    fontFamily: "var(--font-brand, 'Inter', system-ui, sans-serif)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "48px",
    padding: "16px 28px",
    borderRadius: "9999px",
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
      className={`tds-button tds-button--${variant} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "start" && <span className="tds-btn-icon">{icon}</span>}
      {children && <span className="tds-btn-label">{children}</span>}
      {icon && iconPosition === "end" && <span className="tds-btn-icon">{icon}</span>}
    </button>
  );
};
