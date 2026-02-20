import { copyToClipboard } from '../main.js';

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function renderColorConverter() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>/</span> <span>Color Converter</span>
      </div>
      <h1>Color Converter</h1>
      <p>Convert colors between HEX, RGB, and HSL formats with a live preview.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Color Input</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="color-random">🎲 Random</button>
          </div>
        </div>
        <div class="pane-body">
          <div class="color-preview" id="color-preview" style="background: #6366f1;"></div>
          <div class="color-inputs">
            <div class="color-input-group">
              <label>HEX</label>
              <input type="text" id="color-hex" value="#6366f1" />
              <button class="btn-icon" data-copy="hex" title="Copy">📋</button>
            </div>
            <div class="color-input-group">
              <label>RGB</label>
              <input type="text" id="color-rgb" value="rgb(99, 102, 241)" />
              <button class="btn-icon" data-copy="rgb" title="Copy">📋</button>
            </div>
            <div class="color-input-group">
              <label>HSL</label>
              <input type="text" id="color-hsl" value="hsl(239, 84%, 67%)" />
              <button class="btn-icon" data-copy="hsl" title="Copy">📋</button>
            </div>
          </div>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Color Palette</span>
        </div>
        <div class="pane-body" id="color-palette"></div>
      </div>
    </div>
  `;

    setTimeout(() => {
        const preview = document.getElementById('color-preview');
        const hexInput = document.getElementById('color-hex');
        const rgbInput = document.getElementById('color-rgb');
        const hslInput = document.getElementById('color-hsl');
        const palette = document.getElementById('color-palette');

        function updateFromHex(hex) {
            try {
                const rgb = hexToRgb(hex);
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                hexInput.value = hex.startsWith('#') ? hex : '#' + hex;
                rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                preview.style.background = hexInput.value;
                generatePalette(hsl.h, hsl.s);
            } catch (e) { }
        }

        function generatePalette(h, s) {
            palette.innerHTML = '';
            const shades = [95, 85, 75, 65, 55, 45, 35, 25, 15, 5];
            shades.forEach(l => {
                const rgb = hslToRgb(h, s, l);
                const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                const swatch = document.createElement('div');
                swatch.style.cssText = `display:flex; align-items:center; gap:1rem; padding:0.5rem 0.75rem; cursor:pointer; border-radius:6px; transition: background 0.15s;`;
                swatch.innerHTML = `
          <div style="width:40px;height:40px;border-radius:8px;background:${hex};border:1px solid var(--color-border);flex-shrink:0;"></div>
          <div>
            <div style="font-family:var(--font-mono);font-size:0.8rem;color:var(--color-heading);">${hex}</div>
            <div style="font-size:0.7rem;color:var(--color-text-dim);">L: ${l}%</div>
          </div>
        `;
                swatch.addEventListener('click', () => {
                    updateFromHex(hex);
                    copyToClipboard(hex);
                });
                swatch.addEventListener('mouseenter', () => swatch.style.background = 'var(--color-surface)');
                swatch.addEventListener('mouseleave', () => swatch.style.background = 'transparent');
                palette.appendChild(swatch);
            });
        }

        hexInput.addEventListener('input', () => updateFromHex(hexInput.value));

        rgbInput.addEventListener('input', () => {
            const match = rgbInput.value.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
            if (match) updateFromHex(rgbToHex(+match[1], +match[2], +match[3]));
        });

        hslInput.addEventListener('input', () => {
            const match = hslInput.value.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
            if (match) {
                const rgb = hslToRgb(+match[1], +match[2], +match[3]);
                updateFromHex(rgbToHex(rgb.r, rgb.g, rgb.b));
            }
        });

        document.querySelectorAll('[data-copy]').forEach(btn => {
            btn.addEventListener('click', () => {
                const field = btn.dataset.copy;
                const value = document.getElementById(`color-${field}`).value;
                copyToClipboard(value);
            });
        });

        document.getElementById('color-random').addEventListener('click', () => {
            const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            updateFromHex(hex);
        });

        updateFromHex('#6366f1');
    }, 0);

    return page;
}
