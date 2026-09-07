import React from "react";

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
      fontFamily: "var(--font-brand, 'Inter', system-ui, sans-serif)",
      ...style,
    }}
    className={`tds-badge ${className}`}
    {...props}
  >
    {children}
  </span>
);
