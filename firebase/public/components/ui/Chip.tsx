import React from "react";

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
      fontFamily: "var(--font-brand, 'Inter', system-ui, sans-serif)",
      transition: "background 0.15s ease",
      ...style,
    }}
    className={`tds-chip ${selected ? "selected" : ""} ${className}`}
    {...props}
  >
    {icon && <span>{icon}</span>}
    <span>{children}</span>
  </button>
);
