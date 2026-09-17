import { describe, it, expect } from "vitest";
import { evaluateCode, isSentenceCase } from "./engine.js";

describe("Trainable DS Compliance Evaluator", () => {
  it("passes clean code with 100% compliance", () => {
    const cleanCode = `
      import { Button } from "@/components/ui/button";
      export function ActionPanel() {
        return (
          <div className="p-4 bg-surface text-on-surface">
            <Button variant="filled" className="bg-brand-primary text-on-primary">
              Save changes
            </Button>
          </div>
        );
      }
    `;

    const result = evaluateCode(cleanCode);
    expect(result.certified).toBe(true);
    expect(result.score).toBe(100);
    expect(result.diagnostics).toHaveLength(0);
  });

  it("detects raw hex colors and reinvented HTML buttons", () => {
    const dirtyCode = `
      export function ActionPanel() {
        return (
          <div style={{ backgroundColor: "#3b82f6" }}>
            <button className="bg-[#2563eb] text-white p-[13px]">
              Click me
            </button>
          </div>
        );
      }
    `;

    const result = evaluateCode(dirtyCode);
    expect(result.certified).toBe(false);
    expect(result.score).toBeLessThan(100);

    const codes = result.diagnostics.map(d => d.code);
    expect(codes).toContain("TDS-RAW-COLOR");
    expect(codes).toContain("TDS-NON-QUANTUM-SPACING");
    expect(codes).toContain("TDS-REINVENTED-COMPONENT");
  });

  it("detects Title Case violations on buttons", () => {
    expect(isSentenceCase("Save changes")).toBe(true);
    expect(isSentenceCase("Save Changes")).toBe(false);

    const titleCaseCode = `
      import { Button } from "@/components/ui/button";
      export function SubmitBtn() {
        return <Button variant="filled">Submit Your Application</Button>;
      }
    `;

    const result = evaluateCode(titleCaseCode);
    const codes = result.diagnostics.map(d => d.code);
    expect(codes).toContain("TDS-CAPITALIZATION-NOT-SENTENCE-CASE");
    expect(result.diagnostics[0].remediation).toContain("Submit your application");
  });

  it("detects M3 on-color contrast mismatches", () => {
    const mismatchCode = `
      export function BadCard() {
        return (
          <div className="bg-brand-primary text-gray-900">
            <span>Critical alert</span>
          </div>
        );
      }
    `;

    const result = evaluateCode(mismatchCode);
    const codes = result.diagnostics.map(d => d.code);
    expect(codes).toContain("TDS-M3-ON-COLOR-MISMATCH");
  });

  it("detects ghost border hallucination on flat card surfaces", () => {
    const ghostBorderCode = `
      export function FlatCard() {
        return (
          <div className="bg-surface-container border border-outline p-4">
            <span>Content</span>
          </div>
        );
      }
    `;

    const result = evaluateCode(ghostBorderCode);
    const codes = result.diagnostics.map(d => d.code);
    expect(codes).toContain("TDS-GHOST-BORDER-HALLUCINATION");
  });

  it("detects grayscale font-smoothing degradation", () => {
    const smoothedCode = `
      export function RootLayout() {
        return (
          <div className="antialiased font-sans text-on-surface">
            <h1>Header</h1>
          </div>
        );
      }
    `;

    const result = evaluateCode(smoothedCode);
    const codes = result.diagnostics.map(d => d.code);
    expect(codes).toContain("TDS-FONT-SMOOTHING-DEGRADATION");
  });

  it("detects typographic logo approximation instead of vector SVG", () => {
    const fauxLogoCode = `
      export function BrandHeader() {
        return (
          <div>
            <span style={{ color: "#4285f4" }}>G</span><span style={{ color: "#ea4335" }}>o</span>
          </div>
        );
      }
    `;

    const result = evaluateCode(fauxLogoCode);
    const codes = result.diagnostics.map(d => d.code);
    expect(codes).toContain("TDS-TYPOGRAPHIC-LOGO-APPROXIMATION");
  });
});
