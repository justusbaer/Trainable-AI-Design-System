/**
 * Trainable DS — Deep Shadow-DOM & Computed Style Harvester
 * Crawls a page, recursively pierces shadow roots, and extracts true runtime computed styles.
 */

export interface HarvestedColor {
  hex: string;
  rgb: string;
  alpha: number;
}

export interface HarvestedTypography {
  fontFamily: string;
  primaryFont: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface HarvestedGeometry {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  height: number;
  minHeight: number;
  borderRadius: number;
  isPill: boolean;
}

export interface HarvestedMaterial {
  backgroundColor: HarvestedColor;
  color: HarvestedColor;
  borderColor?: HarvestedColor;
  boxShadow?: string;
  backdropFilter?: string;
  opacity: number;
}

export interface HarvestedElement {
  selector: string;
  tagName: string;
  isShadowRoot: boolean;
  family: "actions" | "communication" | "containment" | "navigation" | "selection" | "inputs" | "typography";
  role: string;
  geometry: HarvestedGeometry;
  typography?: HarvestedTypography;
  material: HarvestedMaterial;
  rawComputed: Record<string, string>;
}

export interface HarvestedSystemSnapshot {
  url: string;
  timestamp: number;
  title: string;
  elements: HarvestedElement[];
  brandColors: {
    primary?: HarvestedColor;
    surface?: HarvestedColor;
    canvas?: HarvestedColor;
  };
  detectedWebComponents: string[];
}

/**
 * Returns a self-contained JavaScript function as a string to be evaluated inside the target page.
 * Recursively pierces open shadow roots and returns normalized element metrics.
 */
export function getInPageHarvesterScript(): string {
  return `(function() {
    function parseRgb(colorStr) {
      if (!colorStr) return { hex: "#000000", rgb: "rgb(0, 0, 0)", alpha: 1 };
      const m = colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
      if (!m) {
        return { hex: colorStr, rgb: colorStr, alpha: 1 };
      }
      const r = parseInt(m[1], 10);
      const g = parseInt(m[2], 10);
      const b = parseInt(m[3], 10);
      const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
      const toHex = (n) => n.toString(16).padStart(2, '0');
      return {
        hex: '#' + toHex(r) + toHex(g) + toHex(b),
        rgb: colorStr,
        alpha: a
      };
    }

    function parsePx(pxStr) {
      if (!pxStr) return 0;
      const val = parseFloat(pxStr);
      return isNaN(val) ? 0 : val;
    }

    function parseBorderRadius(radiusStr, height) {
      const val = parsePx(radiusStr);
      // If radius >= 9999px or >= half height, it functions as a full pill shape
      const isPill = val >= 9999 || (height > 0 && val >= (height / 2) - 2);
      return { val, isPill };
    }

    function parsePadding(paddingStr) {
      if (!paddingStr) return { top: 0, right: 0, bottom: 0, left: 0 };
      const parts = paddingStr.split(' ').map(parsePx);
      if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
      if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
      if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
      return { top: parts[0] || 0, right: parts[1] || 0, bottom: parts[2] || 0, left: parts[3] || 0 };
    }

    function parseTypography(cs) {
      const primaryFont = cs.fontFamily ? cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim() : '';
      return {
        fontFamily: cs.fontFamily,
        primaryFont,
        fontSize: parsePx(cs.fontSize),
        fontWeight: parseInt(cs.fontWeight, 10) || 400,
        lineHeight: parsePx(cs.lineHeight),
        letterSpacing: parsePx(cs.letterSpacing)
      };
    }

    // Traverse DOM including open shadow roots
    const observedElements = [];
    const webComponents = new Set();

    function inspectElement(el, isShadow = false) {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return;

      const tagName = el.tagName.toLowerCase();
      if (tagName.includes('-')) {
        webComponents.add(tagName);
      }

      // If element has shadow root, inspect its children
      if (el.shadowRoot) {
        Array.from(el.shadowRoot.children).forEach(child => inspectElement(child, true));
      }

      // Check if candidate for DS classification
      const isButton = tagName === 'button' || el.getAttribute('role') === 'button' || tagName.endsWith('-button') || el.classList.contains('btn') || el.classList.contains('button');
      const isHeading = /^h[1-6]$/.test(tagName) || tagName.endsWith('-heading');
      const isCard = el.classList.contains('card') || tagName.endsWith('-card') || el.getAttribute('role') === 'region';
      const isInput = tagName === 'input' || tagName === 'textarea' || tagName.endsWith('-text-field');
      const isNav = tagName === 'nav' || tagName.endsWith('-navigation');

      if (isButton || isHeading || isCard || isInput || isNav) {
        const cs = window.getComputedStyle(el);
        // Ignore invisible elements
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const height = rect.height || parsePx(cs.height);
        const radiusData = parseBorderRadius(cs.borderRadius, height);

        let family = "containment";
        let role = "container";

        if (isButton) {
          family = "actions";
          // Check primary vs secondary based on background opacity / color
          const bg = parseRgb(cs.backgroundColor);
          role = (bg.alpha > 0.8 && bg.hex !== '#ffffff') ? "button.primary" : "button.secondary";
        } else if (isHeading) {
          family = "typography";
          role = "heading." + tagName;
        } else if (isCard) {
          family = "containment";
          role = "card";
        } else if (isInput) {
          family = "inputs";
          role = "text-field";
        } else if (isNav) {
          family = "navigation";
          role = "navigation-bar";
        }

        observedElements.push({
          selector: tagName + (el.className ? '.' + String(el.className).trim().replace(/\\s+/g, '.') : ''),
          tagName,
          isShadowRoot: isShadow,
          family,
          role,
          geometry: {
            padding: parsePadding(cs.padding),
            height,
            minHeight: parsePx(cs.minHeight),
            borderRadius: radiusData.val,
            isPill: radiusData.isPill
          },
          typography: parseTypography(cs),
          material: {
            backgroundColor: parseRgb(cs.backgroundColor),
            color: parseRgb(cs.color),
            borderColor: parseRgb(cs.borderColor),
            boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : undefined,
            backdropFilter: cs.backdropFilter !== 'none' ? cs.backdropFilter : undefined,
            opacity: parseFloat(cs.opacity) || 1
          },
          rawComputed: {
            backgroundColor: cs.backgroundColor,
            color: cs.color,
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            borderRadius: cs.borderRadius,
            padding: cs.padding
          }
        });
      }

      // Recurse light DOM children
      Array.from(el.children).forEach(child => inspectElement(child, isShadow));
    }

    inspectElement(document.body);

    // Extract brand canvas & surface
    const bodyCs = window.getComputedStyle(document.body);
    const canvasColor = parseRgb(bodyCs.backgroundColor);

    return {
      url: window.location.href,
      timestamp: Date.now(),
      title: document.title,
      elements: observedElements,
      brandColors: {
        canvas: canvasColor,
        surface: observedElements.find(e => e.role === 'card')?.material.backgroundColor,
        primary: observedElements.find(e => e.role === 'button.primary')?.material.backgroundColor
      },
      detectedWebComponents: Array.from(webComponents)
    };
  })();`;
}

/**
 * Normalizes raw harvester JSON data into a strongly-typed snapshot.
 */
export function normalizeHarvestedSnapshot(data: any): HarvestedSystemSnapshot {
  if (!data || typeof data !== "object") {
    return {
      url: "",
      timestamp: Date.now(),
      title: "",
      elements: [],
      brandColors: {},
      detectedWebComponents: []
    };
  }

  return {
    url: String(data.url || ""),
    timestamp: Number(data.timestamp || Date.now()),
    title: String(data.title || ""),
    elements: Array.isArray(data.elements) ? data.elements : [],
    brandColors: data.brandColors || {},
    detectedWebComponents: Array.isArray(data.detectedWebComponents) ? data.detectedWebComponents : []
  };
}
