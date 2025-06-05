/**
 * Returns the HTML string for the Tailwind color chart.
 * @param {Object} params
 * @param {string} params.colorJson - JSON string of the merged color object.
 * @param {string} params.colorList - JSON string of the flattened color list.
 * @returns {string} HTML content
 */
export function htmlTemplate({ colorJson, colorList }) {
  return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tailwind Color Chart</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 0;
      background: #808080; /* optical neutral grey 50 */
      color: #222;
    }
    .layout {
      display: flex;
      min-height: 100vh;
      max-width: 1600px;
      margin: 0 auto;
    }
    .container {
      flex: 2 1 0%;
      padding: 2rem 1rem 2rem 2rem;
      overflow-y: auto;
      min-width: 0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }
    .swatch {
      border-radius: 8px;
      box-shadow: 0 1px 4px #0001;
      cursor: pointer;
      overflow: hidden;
      border: 2px solid transparent;
      transition: border 0.2s;
      background: #fff;
    }
    .swatch.selected { border: 2px solid #0ea5e9; }
    .color-box { height: 48px; }
    .swatch-label { padding: 0.5em; font-size: 0.95em; }
    .aside-details {
      flex: 1 0 340px;
      max-width: 420px;
      min-width: 320px;
      background: #f3f4f6; /* neutral-100 */
      border-left: 1px solid #e5e7eb;
      padding: 2rem 1.5rem;
      box-sizing: border-box;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      transition: box-shadow 0.2s;
      box-shadow: -2px 0 8px #0001;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .aside-details[hidden] { display: none; }
    .details { padding: 0; margin: 0; background: none; box-shadow: none; border-radius: 0; }
    .class-preview { display: flex; gap: 1rem; align-items: center; margin: 0.5rem 0; }
    .preview-box { width: 48px; height: 32px; border-radius: 6px; border: 1px solid #ddd; display: inline-block; margin-right: 0.5em; position:relative; }
    .related-over { position:absolute;top:4px;left:4px;right:4px;display:flex;gap:6px;justify-content:center;z-index:2; }
    .related-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px #0002;
      display: inline-block;
      cursor: help;
    }
    .snippet { background: #f1f5f9; padding: 0.5em 1em; border-radius: 6px; font-family: monospace; display: inline-block; margin-right: 0.5em; }
    button.copy-btn { margin-left: 0.5em; padding: 0.2em 0.7em; border: none; border-radius: 4px; background: #0ea5e9; color: #fff; cursor: pointer; font-size: 0.95em; }
    .related { display: flex; gap: 1.5rem; margin-top: 1.5rem; flex-wrap: wrap; }
    .related .swatch { min-width: 120px; }
    @media (max-width: 900px) {
      .layout { flex-direction: column; }
      .aside-details {
        position: static;
        max-width: 100vw;
        min-width: 0;
        height: auto;
        border-left: none;
        border-top: 1px solid #e5e7eb;
        box-shadow: none;
        padding: 1.5rem 0.5rem;
      }
      .container { padding: 1rem 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <div class="container">
      <h1>Tailwind Color Chart</h1>
      <div class="grid" id="colorGrid"></div>
    </div>
    <aside class="aside-details" id="colorDetails" hidden></aside>
  </div>
  <script>
    const colors = ${colorJson};
    const flatColors = ${colorList};

    function getTailwindClasses(name) {
      const parts = name.split(".");
      if (parts.length === 2) {
        return [
          { class: "bg-" + parts.join("-"), type: "Background" },
          { class: "text-" + parts.join("-"), type: "Text" }
        ];
      }
      return [];
    }

    function getColorValue(keys) {
      return keys.reduce((obj, k) => obj && obj[k], colors);
    }

    // Convert a CSS color string to RGB array
    function cssToRgb(str) {
      // For hex
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str)) {
        let hex = str.replace("#", "");
        if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
        const num = parseInt(hex, 16);
        return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
      }
      // For oklch, use browser to parse
      if (str.startsWith("oklch(")) {
        const d = document.createElement("div");
        d.style.color = str;
        document.body.appendChild(d);
        const rgb = getComputedStyle(d).color.match(/\\d+/g).map(Number);
        document.body.removeChild(d);
        return rgb.length === 3 ? rgb : [200,200,200];
      }
      // For rgb/rgba
      const rgbMatch = str.match(/^rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/i);
      if (rgbMatch) return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
      return [200,200,200];
    }

    // Euclidean distance in RGB
    function colorDist(a, b) {
      return Math.sqrt(
        Math.pow(a[0]-b[0],2) +
        Math.pow(a[1]-b[1],2) +
        Math.pow(a[2]-b[2],2)
      );
    }

    // Find closest Tailwind color value in flatColors
    function findClosestTailwindColor(target) {
      const targetRgb = cssToRgb(target);
      let minDist = Infinity, closest = null, closestName = "";
      flatColors.forEach(c => {
        const rgb = cssToRgb(c.value);
        const dist = colorDist(targetRgb, rgb);
        if (dist < minDist) {
          minDist = dist;
          closest = c.value;
          closestName = c.name;
        }
      });
      return { value: closest, name: closestName };
    }

    function parseToRgb(val) {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        let hex = val.replace("#", "");
        if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
        const num = parseInt(hex, 16);
        return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
      }
      return [200, 200, 200];
    }

    function getRelatedColors(val) {
      let related = [];
      // HEX
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        const [r, g, b] = parseToRgb(val);
        const comp = "#" + [255-r, 255-g, 255-b].map(x => x.toString(16).padStart(2,"0")).join("");
        const triad1 = "#" + [g, b, r].map(x => x.toString(16).padStart(2,"0")).join("");
        const triad2 = "#" + [b, r, g].map(x => x.toString(16).padStart(2,"0")).join("");
        const ana1 = "#" + [Math.max(0, r-30), g, b].map(x => x.toString(16).padStart(2,"0")).join("");
        const ana2 = "#" + [r, Math.max(0, g-30), b].map(x => x.toString(16).padStart(2,"0")).join("");
        related = [
          { label: "Complementary", value: comp },
          { label: "Triadic 1", value: triad1 },
          { label: "Triadic 2", value: triad2 },
          { label: "Analogous 1", value: ana1 },
          { label: "Analogous 2", value: ana2 }
        ];
      }
      // OKLCH
      const oklchMatch = val.match(/^oklch\\(\\s*([0-9\\.]+)\\s+([0-9\\.]+)\\s+([0-9\\.]+)\\s*\\)$/i);
      if (oklchMatch) {
        const l = oklchMatch[1];
        const c = oklchMatch[2];
        const h = parseFloat(oklchMatch[3]);
        const mod = d => (((h + d) % 360) + 360) % 360;
        related = [
          { label: "Complementary", value: \`oklch(\${l} \${c} \${mod(180)})\` },
          { label: "Triadic 1", value: \`oklch(\${l} \${c} \${mod(120)})\` },
          { label: "Triadic 2", value: \`oklch(\${l} \${c} \${mod(240)})\` },
          { label: "Analogous 1", value: \`oklch(\${l} \${c} \${mod(30)})\` },
          { label: "Analogous 2", value: \`oklch(\${l} \${c} \${mod(-30)})\` }
        ];
      }
      // Attach closest Tailwind color
      return related.map(r => {
        const closest = findClosestTailwindColor(r.value);

        console.log("Finding closest for:", r.value, "found:", closest);
        return { ...r, twValue: closest.value, twName: closest.name };
      });
    }

    function getSnippet(keys) {
      return 'colors' + keys.map(k => '["' + k + '"]').join("");
    }

    const grid = document.getElementById("colorGrid");
    flatColors.forEach(({ name, value }, idx) => {
      const swatch = document.createElement("div");
      swatch.className = "swatch";
      swatch.tabIndex = 0;
      swatch.innerHTML = \`
        <div class="color-box" style="background:\${value};"></div>
        <div class="swatch-label">
          <div style="font-weight:500">\${name}</div>
          <div style="font-size:0.92em">\${value}</div>
        </div>
      \`;
      swatch.onclick = () => showDetails(idx);
      grid.appendChild(swatch);
    });

    let selectedIdx = null;
    function showDetails(idx) {
      selectedIdx = idx;
      document.querySelectorAll(".swatch").forEach((el, i) =>
        el.classList.toggle("selected", i === idx)
      );
      const { name, value, keys } = flatColors[idx];
      const classes = getTailwindClasses(name);
      const related = getRelatedColors(value);
      const snippet = getSnippet(keys);
      console.log("Showing details for:", name, "value:", value, "keys:", keys, "snippet:", snippet);

      let html = \`
        <h2 style="margin-top:0">\${name}</h2>
        <div style="margin-bottom:1.5em;">
          <div style="position:relative;width:100%;max-width:320px;height:80px;margin:0 auto 0.5em auto;">
            <div style="background:\${value};border-radius:12px;height:100%;width:100%;box-shadow:0 2px 8px #0002;border:1px solid #ddd;"></div>
            <div style="position:absolute;top:10px;left:0;right:0;display:flex;justify-content:center;gap:18px;z-index:2;">
              \${
                related.length
                  ? related.map(r =>
                      \`<div class="related-dot" title="\${r.label}: \${r.twName} (\${r.twValue})\\nActual: \${r.value}" style="background:\${r.twValue};border:2px solid #fff;box-shadow:0 1px 3px #0002;position:relative;">
                        <span style="display:none;">\${r.value}</span>
                      </div>\`
                    ).join("")
                  : ""
              }
            </div>
          </div>
          <div style="text-align:center;font-family:monospace;font-size:1.1em;">\${value}</div>
        </div>
        <div style="margin:1em 0 0.5em 0;font-weight:500">Tailwind Classes:</div>
        <div>\${
          classes.length
            ? classes.map(c =>
                \`<div class="class-preview">
                  <div class="preview-box" style="\${c.type==='Background' ? 'background:'+value : 'background:#fff;color:'+value+';border:1px solid #ddd;'}"></div>
                  <span class="snippet">\${c.class}</span>
                  <span style="font-size:0.95em;color:#888">\${c.type}</span>
                </div>\`
              ).join("")
            : "<em>No Tailwind class</em>"
        }</div>
        <div style="margin:1em 0 0.5em 0;font-weight:500">JS Snippet:</div>
        <div>
          <span class="snippet" id="snippet">\${snippet}</span>
          <button class="copy-btn" id="copySnippetBtn">Copy</button>
        </div>
      \`;
      const details = document.getElementById("colorDetails");
      details.innerHTML = html;
      details.hidden = false;
      // Fix copy button event
      const copyBtn = document.getElementById("copySnippetBtn");
      if (copyBtn) {
        copyBtn.onclick = () => {
          const snippetText = document.getElementById("snippet").textContent;
          navigator.clipboard.writeText(snippetText);
        };
      }
      if (window.innerWidth < 900) details.scrollIntoView({ behavior: "smooth" });
    }
  </script>
</body>
</html>
`
}
