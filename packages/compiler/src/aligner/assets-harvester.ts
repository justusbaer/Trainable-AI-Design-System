/**
 * Trainable DS — Deep Font & Icon Asset Harvester
 * Extracts @font-face rules, remote font URLs (woff2/woff), and SVG icons/shadow-root icons.
 */

export interface HarvestedFontFace {
  family: string;
  weight: string;
  style: string;
  url?: string;
  format?: string;
  display?: string;
  unicodeRange?: string;
  cssDeclaration?: string;
}

export interface HarvestedFontFamily {
  name: string;
  weights: string[];
  styles: string[];
  faces: HarvestedFontFace[];
  cssBlock: string;
}

export interface HarvestedFontManifest {
  families: Record<string, HarvestedFontFamily>;
}

export interface HarvestedSvgIcon {
  id: string;
  name: string;
  viewBox: string;
  width: number;
  height: number;
  svg: string;
  category?: string;
  occurrences: number;
}

export interface HarvestedAssets {
  fonts: HarvestedFontManifest;
  icons: HarvestedSvgIcon[];
}

/**
 * Returns a self-contained JavaScript script to be executed in the target web page.
 * Harvests loaded @font-face rules, document.fonts, and all SVG icons (including shadow-root icons).
 */
export function getAssetsHarvesterScript(): string {
  return `(function() {
    // 1. HARVEST FONTS
    const rawFonts = [];

    // Traverse stylesheets for @font-face rules
    try {
      for (const sheet of document.styleSheets) {
        try {
          if (!sheet.cssRules) continue;
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.FONT_FACE_RULE || rule.constructor.name === 'CSSFontFaceRule') {
              const style = rule.style;
              const family = (style.getPropertyValue('font-family') || '').replace(/['"]/g, '').trim();
              const src = style.getPropertyValue('src') || '';
              const weight = style.getPropertyValue('font-weight') || '400';
              const fontStyle = style.getPropertyValue('font-style') || 'normal';
              const display = style.getPropertyValue('font-display') || 'auto';
              const unicodeRange = style.getPropertyValue('unicode-range') || undefined;

              // Parse url(...) and format(...) from src
              const urlMatches = Array.from(src.matchAll(/url\\((?:['"]?)([^'")]+)(?:['"]?)\\)(?:\\s*format\\((?:['"]?)([^'")]+)(?:['"]?)\\))?/g));
              for (const m of urlMatches) {
                const fontUrl = m[1];
                const format = m[2] || (fontUrl.endsWith('.woff2') ? 'woff2' : fontUrl.endsWith('.woff') ? 'woff' : 'truetype');
                rawFonts.push({
                  family,
                  weight,
                  style: fontStyle,
                  url: fontUrl,
                  format,
                  display,
                  unicodeRange
                });
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheet access restricted; non-fatal
        }
      }
    } catch (e) {}

    // Check document.fonts API
    try {
      if (document.fonts) {
        document.fonts.forEach(face => {
          const family = (face.family || '').replace(/['"]/g, '').trim();
          if (family && !rawFonts.some(f => f.family === family && f.weight === face.weight)) {
            rawFonts.push({
              family,
              weight: face.weight || '400',
              style: face.style || 'normal',
              display: face.display || 'auto'
            });
          }
        });
      }
    } catch (e) {}

    // 2. HARVEST ICONS (SVGs, symbols, and custom element shadow roots)
    const rawIcons = [];
    const seenHashes = new Map();

    function harvestIconsFromRoot(root) {
      if (!root) return;

      // Find SVGs and custom icon elements (e.g. ds-icon, mat-icon, etc.)
      const candidates = root.querySelectorAll('svg, ds-icon, [class*="icon"], [data-icon]');
      candidates.forEach((el, idx) => {
        let svgEl = el.tagName.toLowerCase() === 'svg' ? el : null;
        let iconName = el.getAttribute('name') || el.getAttribute('data-icon') || el.getAttribute('aria-label') || '';

        // If custom element with shadow root (like <ds-icon>), check shadowRoot
        if (!svgEl && el.shadowRoot) {
          svgEl = el.shadowRoot.querySelector('svg');
        }
        if (!svgEl) {
          svgEl = el.querySelector('svg');
        }

        if (svgEl) {
          const viewBox = svgEl.getAttribute('viewBox') || '0 0 24 24';
          const width = parseFloat(svgEl.getAttribute('width') || '24') || 24;
          const height = parseFloat(svgEl.getAttribute('height') || '24') || 24;
          const innerHtml = svgEl.innerHTML.trim();

          if (innerHtml && innerHtml.length > 10) {
            const hash = viewBox + '_' + innerHtml.slice(0, 80);

            if (seenHashes.has(hash)) {
              const existing = seenHashes.get(hash);
              existing.occurrences++;
            } else {
              if (!iconName) {
                const cls = (el.className || svgEl.className || '').toString();
                const m = cls.match(/icon[-_]([a-zA-Z0-9_-]+)/);
                iconName = m ? m[1] : ('icon-' + (seenHashes.size + 1));
              }

              const cleanName = iconName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
              const iconObj = {
                id: 'icon-' + (seenHashes.size + 1),
                name: cleanName || ('icon-' + (seenHashes.size + 1)),
                viewBox,
                width,
                height,
                svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '" width="' + width + '" height="' + height + '" fill="currentColor">' + innerHtml + '</svg>',
                occurrences: 1
              };
              seenHashes.set(hash, iconObj);
              rawIcons.push(iconObj);
            }
          }
        }
      });

      // Recurse into open shadow roots of all children
      root.querySelectorAll('*').forEach(child => {
        if (child.shadowRoot) harvestIconsFromRoot(child.shadowRoot);
      });
    }

    harvestIconsFromRoot(document.body);

    return {
      baseUrl: window.location.href,
      fonts: rawFonts,
      icons: rawIcons
    };
  })();`;
}

/**
 * Normalizes raw in-page harvested fonts and icons data.
 */
export function normalizeHarvestedAssets(raw: any, baseUrl = ""): HarvestedAssets {
  if (!raw || typeof raw !== "object") {
    return { fonts: { families: {} }, icons: [] };
  }

  const effectiveBaseUrl = raw.baseUrl || baseUrl || "https://example.com";
  const rawFonts: any[] = Array.isArray(raw.fonts) ? raw.fonts : [];
  const rawIcons: any[] = Array.isArray(raw.icons) ? raw.icons : [];

  // 1. Process Fonts
  const families: Record<string, HarvestedFontFamily> = {};

  for (const f of rawFonts) {
    if (!f.family) continue;
    const famName = f.family;
    if (!families[famName]) {
      families[famName] = {
        name: famName,
        weights: [],
        styles: [],
        faces: [],
        cssBlock: ""
      };
    }

    const fam = families[famName];
    const weight = String(f.weight || "400");
    const style = String(f.style || "normal");

    if (!fam.weights.includes(weight)) fam.weights.push(weight);
    if (!fam.styles.includes(style)) fam.styles.push(style);

    let absUrl = f.url;
    if (absUrl && !absUrl.startsWith("http://") && !absUrl.startsWith("https://") && !absUrl.startsWith("data:")) {
      try {
        absUrl = new URL(absUrl, effectiveBaseUrl).href;
      } catch {
        // Keep original if invalid
      }
    }

    let cssDecl = "";
    if (absUrl) {
      cssDecl = `@font-face {\n  font-family: '${famName}';\n  src: url('${absUrl}') format('${f.format || "woff2"}');\n  font-weight: ${weight};\n  font-style: ${style};\n  font-display: ${f.display || "swap"};\n}`;
    }

    fam.faces.push({
      family: famName,
      weight,
      style,
      url: absUrl,
      format: f.format || "woff2",
      display: f.display || "swap",
      unicodeRange: f.unicodeRange,
      cssDeclaration: cssDecl
    });
  }

  // Generate combined cssBlock for each family
  for (const fam of Object.values(families)) {
    fam.cssBlock = fam.faces
      .filter(face => face.cssDeclaration)
      .map(face => face.cssDeclaration)
      .join("\n\n");
  }

  // 2. Process Icons
  const icons: HarvestedSvgIcon[] = rawIcons.map((ic: any, index: number) => ({
    id: ic.id || `icon-${index + 1}`,
    name: ic.name || `icon-${index + 1}`,
    viewBox: ic.viewBox || "0 0 24 24",
    width: Number(ic.width) || 24,
    height: Number(ic.height) || 24,
    svg: ic.svg || "",
    category: inferIconCategory(ic.name || ""),
    occurrences: Number(ic.occurrences) || 1
  }));

  // Sort icons by occurrences descending
  icons.sort((a, b) => b.occurrences - a.occurrences);

  return {
    fonts: { families },
    icons
  };
}

function inferIconCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("arrow") || lower.includes("chevron") || lower.includes("back") || lower.includes("forward")) {
    return "navigation";
  }
  if (lower.includes("check") || lower.includes("close") || lower.includes("plus") || lower.includes("minus") || lower.includes("edit") || lower.includes("delete")) {
    return "action";
  }
  if (lower.includes("user") || lower.includes("profile") || lower.includes("account")) {
    return "social";
  }
  if (lower.includes("car") || lower.includes("vehicle") || lower.includes("battery") || lower.includes("speed")) {
    return "brand";
  }
  return "general";
}
