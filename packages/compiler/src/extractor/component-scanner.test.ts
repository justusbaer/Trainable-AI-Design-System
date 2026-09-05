import { describe, it, expect } from "vitest";
import { categorizeComponentFamily, extractComponentVariants, extractComponentProps } from "./component-scanner.js";

describe("Component Scanner", () => {
  it("categorizes component names into the 6 M3 functional families", () => {
    expect(categorizeComponentFamily("PrimaryButton")).toBe("actions");
    expect(categorizeComponentFamily("FAB")).toBe("actions");
    expect(categorizeComponentFamily("StatusBadge")).toBe("communication");
    expect(categorizeComponentFamily("SnackbarNotice")).toBe("communication");
    expect(categorizeComponentFamily("ProductCard")).toBe("containment");
    expect(categorizeComponentFamily("ConfirmationDialog")).toBe("containment");
    expect(categorizeComponentFamily("NavigationBar")).toBe("navigation");
    expect(categorizeComponentFamily("SideDrawer")).toBe("containment");
    expect(categorizeComponentFamily("TabsHeader")).toBe("navigation");
    expect(categorizeComponentFamily("ThemeSwitch")).toBe("selection");
    expect(categorizeComponentFamily("FilterChip")).toBe("selection");
    expect(categorizeComponentFamily("EmailTextField")).toBe("text-inputs");
    expect(categorizeComponentFamily("GlobalSearch")).toBe("text-inputs");
  });

  it("extracts component variants from TypeScript unions", () => {
    const code = `
      export interface ButtonProps {
        variant?: 'filled' | 'outlined' | 'tonal' | 'elevated';
        size?: 'sm' | 'md' | 'lg';
      }
    `;
    const variants = extractComponentVariants(code);
    expect(variants).toContain("filled");
    expect(variants).toContain("outlined");
    expect(variants).toContain("tonal");
    expect(variants).toContain("elevated");
  });

  it("extracts component props and required status", () => {
    const code = `
      export interface CardProps {
        title: string;
        description?: string;
        elevation?: number;
      }
    `;
    const props = extractComponentProps(code);
    expect(props.title).toBeDefined();
    expect(props.title.required).toBe(true);
    expect(props.description).toBeDefined();
    expect(props.description.required).toBe(false);
  });
});
