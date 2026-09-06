import { describe, it, expect } from "vitest";
import { getAssetsHarvesterScript, normalizeHarvestedAssets } from "./assets-harvester.js";

describe("assets-harvester", () => {
  it("generates in-page harvester script with font and icon crawlers", () => {
    const script = getAssetsHarvesterScript();
    expect(script).toContain("FONT_FACE_RULE");
    expect(script).toContain("document.fonts");
    expect(script).toContain("harvestIconsFromRoot");
    expect(script).toContain("shadowRoot");
    expect(script).toContain("viewBox");
  });

  it("normalizes fonts and generates @font-face css blocks", () => {
    const raw = {
      baseUrl: "https://cdn.ui.porsche.com/porsche-design-system/",
      fonts: [
        {
          family: "Porsche Next",
          weight: "400",
          style: "normal",
          url: "fonts/porsche-next-w-regular.woff2",
          format: "woff2",
          display: "swap"
        },
        {
          family: "Porsche Next",
          weight: "700",
          style: "normal",
          url: "fonts/porsche-next-w-bold.woff2",
          format: "woff2",
          display: "swap"
        }
      ],
      icons: []
    };

    const assets = normalizeHarvestedAssets(raw);
    const porscheFam = assets.fonts.families["Porsche Next"];
    expect(porscheFam).toBeDefined();
    expect(porscheFam.weights).toContain("400");
    expect(porscheFam.weights).toContain("700");
    expect(porscheFam.faces[0].url).toBe("https://cdn.ui.porsche.com/porsche-design-system/fonts/porsche-next-w-regular.woff2");
    expect(porscheFam.cssBlock).toContain("@font-face");
    expect(porscheFam.cssBlock).toContain("https://cdn.ui.porsche.com/porsche-design-system/fonts/porsche-next-w-regular.woff2");
  });

  it("normalizes and categorizes extracted SVG icons", () => {
    const raw = {
      baseUrl: "https://porsche.com",
      fonts: [],
      icons: [
        {
          name: "arrow-right",
          viewBox: "0 0 24 24",
          width: 24,
          height: 24,
          svg: "<svg viewBox=\"0 0 24 24\"><path d=\"M5 12h14\"/></svg>",
          occurrences: 5
        },
        {
          name: "user-profile",
          viewBox: "0 0 24 24",
          width: 24,
          height: 24,
          svg: "<svg viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"8\" r=\"4\"/></svg>",
          occurrences: 2
        }
      ]
    };

    const assets = normalizeHarvestedAssets(raw);
    expect(assets.icons.length).toBe(2);
    expect(assets.icons[0].name).toBe("arrow-right");
    expect(assets.icons[0].category).toBe("navigation");
    expect(assets.icons[1].category).toBe("social");
    expect(assets.icons[0].occurrences).toBe(5);
  });
});
