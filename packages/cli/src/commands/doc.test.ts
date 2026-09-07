import { describe, it, expect, vi } from "vitest";
import { runDoc } from "./doc.js";

describe("runDoc command", () => {
  it("outputs component contract in JSON mode", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runDoc("Button", { json: true });

    expect(logSpy).toHaveBeenCalled();
    const lastCall = logSpy.mock.calls[0][0];
    const data = JSON.parse(lastCall);
    expect(data.name).toBe("Button");
    expect(data.family).toBe("actions");
    expect(data.a11y).toBeDefined();

    logSpy.mockRestore();
  });

  it("lists all components when no component argument is passed", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runDoc(undefined, { json: true });

    expect(logSpy).toHaveBeenCalled();
    const lastCall = logSpy.mock.calls[0][0];
    const data = JSON.parse(lastCall);
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((c: any) => c.name === "Button")).toBe(true);
    expect(data.some((c: any) => c.name === "Card")).toBe(true);

    logSpy.mockRestore();
  });
});
