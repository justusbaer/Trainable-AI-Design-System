import React from "react";

export const HARVESTED_ICONS: Record<string, React.ReactNode> = {
  "arrow-right": (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>),
  "chevron-down": (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>),
  "filter": (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h18v2l-7 8v6l-4 2v-8L3 6V4z"/></svg>),
  "heart": (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  "user": (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>),
  "search": (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>)
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
}

/**
 * Trainable Design System Harvested Vector Icon Primitive
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
        className={`tds-icon tds-icon--missing ${className}`}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
      </svg>
    );
  }

  return (
    <span
      className={`tds-icon-wrapper tds-icon--${name} ${className}`}
      style={{ display: "inline-flex", width: size, height: size, alignItems: "center", justifyContent: "center", ...style }}
    >
      {iconNode}
    </span>
  );
};
