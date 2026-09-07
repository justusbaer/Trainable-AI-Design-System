import React from "react";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

/**
 * Trainable Design System Certified TextField Component (Text Inputs Family)
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
        fontFamily: "var(--font-brand, 'Inter', system-ui, sans-serif)",
        width: "100%",
        ...style,
      }}
      className={`tds-textfield-wrapper ${className}`}
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
