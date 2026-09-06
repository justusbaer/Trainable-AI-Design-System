/**
 * Trainable DS — Sitemap & Sub-Page Discovery Engine
 * Discovers subpages from sitemap.xml, navigation links, and categorizes them by archetype.
 */

export type PageArchetype = "home" | "listing" | "detail" | "form" | "content";

export interface DiscoveredPage {
  url: string;
  title?: string;
  label?: string;
  archetype: PageArchetype;
  recommended: boolean;
  priorityScore: number;
}

export function classifyPageArchetype(urlStr: string, title = "", label = ""): PageArchetype {
  const lower = (urlStr + " " + title + " " + label).toLowerCase();

  // Form / Tool / Configurator / Finder
  if (
    lower.includes("finder") ||
    lower.includes("configurator") ||
    lower.includes("login") ||
    lower.includes("contact") ||
    lower.includes("checkout") ||
    lower.includes("search") ||
    lower.includes("filter")
  ) {
    return "form";
  }

  // Listing / Catalog
  if (
    lower.includes("models") && !/\b(911|taycan|panamera|macan|cayenne|718)\b/.test(lower) ||
    lower.includes("category") ||
    lower.includes("products") ||
    lower.includes("catalog") ||
    lower.includes("services") ||
    lower.includes("overview")
  ) {
    return "listing";
  }

  // Detail / Model page
  if (
    /\b(911|taycan|panamera|macan|cayenne|718)\b/.test(lower) ||
    lower.includes("/product/") ||
    lower.includes("/item/") ||
    lower.includes("/detail")
  ) {
    return "detail";
  }

  // Content / Experience / News
  if (
    lower.includes("experience") ||
    lower.includes("news") ||
    lower.includes("about") ||
    lower.includes("press") ||
    lower.includes("stories")
  ) {
    return "content";
  }

  // Root or language root
  const url = new URL(urlStr, "https://example.com");
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return "home";
  }

  return "content";
}

/**
 * In-page script that runs inside a page to extract internal navigation links and menu anchors.
 */
export function getLinkDiscoveryScript(): string {
  return `(function() {
    const origin = window.location.origin;
    const currentPath = window.location.pathname;
    const links = [];
    const seen = new Set();

    // Prioritize links inside navigation, header, and primary menus
    const navAnchors = Array.from(document.querySelectorAll('nav a, header a, [role="navigation"] a, [class*="nav"] a, [class*="menu"] a, main a'));

    for (const a of navAnchors) {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

      let absUrl;
      try {
        absUrl = new URL(href, window.location.href).href;
      } catch {
        continue;
      }

      // Keep only same origin
      if (!absUrl.startsWith(origin)) continue;

      // Clean query parameters and fragments
      const cleanUrl = absUrl.split('?')[0].split('#')[0];
      if (seen.has(cleanUrl)) continue;
      seen.add(cleanUrl);

      const label = (a.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
      links.push({
        url: cleanUrl,
        label,
        inNav: !!a.closest('nav, header, [role="navigation"]')
      });
    }

    return {
      currentUrl: window.location.href,
      title: document.title,
      discoveredLinks: links
    };
  })();`;
}

/**
 * Selects a balanced set of representative pages across different archetypes for multi-page extraction.
 */
export function selectRepresentativePages(pages: DiscoveredPage[], maxCount = 4): DiscoveredPage[] {
  if (pages.length <= maxCount) return pages;

  const archetypes: PageArchetype[] = ["home", "listing", "detail", "form", "content"];
  const selected: DiscoveredPage[] = [];
  const pickedUrls = new Set<string>();

  // 1. Pick top page for each archetype
  for (const arch of archetypes) {
    const match = pages.find(p => p.archetype === arch && !pickedUrls.has(p.url));
    if (match) {
      selected.push({ ...match, recommended: true });
      pickedUrls.add(match.url);
      if (selected.length >= maxCount) break;
    }
  }

  // 2. Fill remaining slots with highest priority scores
  if (selected.length < maxCount) {
    const remaining = pages
      .filter(p => !pickedUrls.has(p.url))
      .sort((a, b) => b.priorityScore - a.priorityScore);

    for (const p of remaining) {
      selected.push({ ...p, recommended: true });
      pickedUrls.add(p.url);
      if (selected.length >= maxCount) break;
    }
  }

  return selected;
}

/**
 * Parses in-page link discovery results into categorized DiscoveredPage items.
 */
export function parseDiscoveredLinks(data: any, rootUrl: string): DiscoveredPage[] {
  if (!data || typeof data !== "object") return [];

  const rawLinks: any[] = Array.isArray(data.discoveredLinks) ? data.discoveredLinks : [];
  const pages: DiscoveredPage[] = [];
  const seen = new Set<string>();

  // Include root page first
  const rootArch = classifyPageArchetype(rootUrl, data.title || "");
  pages.push({
    url: rootUrl,
    title: data.title || "Home",
    label: "Home",
    archetype: rootArch,
    recommended: true,
    priorityScore: 100
  });
  seen.add(rootUrl.replace(/\/+$/, ""));

  for (const link of rawLinks) {
    const url = String(link.url || "");
    const clean = url.replace(/\/+$/, "");
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);

    const label = String(link.label || "");
    const archetype = classifyPageArchetype(url, "", label);

    // Prioritize links from navigation and high-value archetypes
    let priority = link.inNav ? 50 : 20;
    if (archetype === "detail" || archetype === "form") priority += 30;
    if (archetype === "listing") priority += 25;

    pages.push({
      url,
      title: label,
      label,
      archetype,
      recommended: false,
      priorityScore: priority
    });
  }

  return pages;
}
