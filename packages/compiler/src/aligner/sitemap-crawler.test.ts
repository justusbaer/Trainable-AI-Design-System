import { describe, it, expect } from "vitest";
import { classifyPageArchetype, parseDiscoveredLinks, selectRepresentativePages } from "./sitemap-crawler.js";

describe("sitemap-crawler", () => {
  it("correctly classifies URLs into page archetypes", () => {
    expect(classifyPageArchetype("https://brand.example.com/")).toBe("home");
    expect(classifyPageArchetype("https://brand.example.com/models/")).toBe("listing");
    expect(classifyPageArchetype("https://brand.example.com/models/product-detail/")).toBe("detail");
    expect(classifyPageArchetype("https://brand.example.com/finder/")).toBe("form");
    expect(classifyPageArchetype("https://brand.example.com/experience/")).toBe("content");
  });

  it("parses discovered links and ranks priorities", () => {
    const rawData = {
      title: "Enterprise Portal",
      discoveredLinks: [
        { url: "https://brand.example.com/models/", label: "Products", inNav: true },
        { url: "https://brand.example.com/models/product-detail/", label: "Detail", inNav: true },
        { url: "https://brand.example.com/finder/", label: "Search", inNav: true },
        { url: "https://brand.example.com/privacy/", label: "Privacy", inNav: false }
      ]
    };

    const pages = parseDiscoveredLinks(rawData, "https://brand.example.com/");
    expect(pages.length).toBe(5); // Root + 4 links
    expect(pages[0].archetype).toBe("home");

    const detailPage = pages.find(p => p.url.includes("product-detail"));
    expect(detailPage).toBeDefined();
    expect(detailPage?.archetype).toBe("detail");
    expect(detailPage?.priorityScore).toBeGreaterThan(50);
  });

  it("selects representative balanced set of diverse archetypes", () => {
    const rawData = {
      title: "Enterprise Portal",
      discoveredLinks: [
        { url: "https://brand.example.com/models/", label: "Products", inNav: true },
        { url: "https://brand.example.com/models/product-item/", label: "Item", inNav: true },
        { url: "https://brand.example.com/models/product-detail/", label: "Detail", inNav: true },
        { url: "https://brand.example.com/finder/", label: "Finder", inNav: true },
        { url: "https://brand.example.com/experience/", label: "Experience", inNav: true }
      ]
    };

    const allPages = parseDiscoveredLinks(rawData, "https://brand.example.com/");
    const selected = selectRepresentativePages(allPages, 4);

    expect(selected.length).toBe(4);
    const archetypes = selected.map(p => p.archetype);
    expect(archetypes).toContain("home");
    expect(archetypes).toContain("listing");
    expect(archetypes).toContain("detail");
    expect(archetypes).toContain("form");
  });
});
