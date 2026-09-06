import { describe, it, expect } from "vitest";
import { classifyPageArchetype, parseDiscoveredLinks, selectRepresentativePages } from "./sitemap-crawler.js";

describe("sitemap-crawler", () => {
  it("correctly classifies URLs into page archetypes", () => {
    expect(classifyPageArchetype("https://porsche.com/germany/")).toBe("home");
    expect(classifyPageArchetype("https://porsche.com/germany/models/")).toBe("listing");
    expect(classifyPageArchetype("https://porsche.com/germany/models/911/")).toBe("detail");
    expect(classifyPageArchetype("https://porsche.com/germany/finder/")).toBe("form");
    expect(classifyPageArchetype("https://porsche.com/germany/experience/")).toBe("content");
  });

  it("parses discovered links and ranks priorities", () => {
    const rawData = {
      title: "Porsche Deutschland",
      discoveredLinks: [
        { url: "https://porsche.com/germany/models/", label: "Modelle", inNav: true },
        { url: "https://porsche.com/germany/models/911/", label: "911", inNav: true },
        { url: "https://porsche.com/germany/finder/", label: "Fahrzeugsuche", inNav: true },
        { url: "https://porsche.com/germany/privacy/", label: "Datenschutz", inNav: false }
      ]
    };

    const pages = parseDiscoveredLinks(rawData, "https://porsche.com/germany/");
    expect(pages.length).toBe(5); // Root + 4 links
    expect(pages[0].archetype).toBe("home");

    const detailPage = pages.find(p => p.url.includes("911"));
    expect(detailPage).toBeDefined();
    expect(detailPage?.archetype).toBe("detail");
    expect(detailPage?.priorityScore).toBeGreaterThan(50);
  });

  it("selects representative balanced set of diverse archetypes", () => {
    const rawData = {
      title: "Porsche Deutschland",
      discoveredLinks: [
        { url: "https://porsche.com/germany/models/", label: "Modelle", inNav: true },
        { url: "https://porsche.com/germany/models/taycan/", label: "Taycan", inNav: true },
        { url: "https://porsche.com/germany/models/911/", label: "911", inNav: true },
        { url: "https://porsche.com/germany/finder/", label: "Finder", inNav: true },
        { url: "https://porsche.com/germany/experience/", label: "Experience", inNav: true }
      ]
    };

    const allPages = parseDiscoveredLinks(rawData, "https://porsche.com/germany/");
    const selected = selectRepresentativePages(allPages, 4);

    expect(selected.length).toBe(4);
    const archetypes = selected.map(p => p.archetype);
    expect(archetypes).toContain("home");
    expect(archetypes).toContain("listing");
    expect(archetypes).toContain("detail");
    expect(archetypes).toContain("form");
  });
});
