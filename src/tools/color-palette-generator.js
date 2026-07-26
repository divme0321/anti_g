import { copyToClipboard, showToast } from '../utils.js';

// ---- 色変換ユーティリティ（HSL⇔HEX） ----
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h = (((h % 360) + 360) % 360) / 360;
  s /= 100; l /= 100;
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

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// 背景色の明度からテキスト色（白 / 黒）を選ぶ
function textColorFor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#1a1d26' : '#ffffff';
}

// ベースHEXから各配色パターンを生成する
export function buildPalettes(baseHex) {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return [
    {
      id: 'complementary',
      label: '補色（Complementary）',
      colors: [hslToHex(h, s, l), hslToHex(h + 180, s, l)],
    },
    {
      id: 'analogous',
      label: '類似色（Analogous）',
      colors: [hslToHex(h - 30, s, l), hslToHex(h, s, l), hslToHex(h + 30, s, l)],
    },
    {
      id: 'triadic',
      label: 'トライアド（Triadic）',
      colors: [hslToHex(h, s, l), hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)],
    },
    {
      id: 'split-complementary',
      label: 'スプリットコンプリメンタリー',
      colors: [hslToHex(h, s, l), hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)],
    },
    {
      id: 'monochromatic',
      label: 'モノクロマティック（明度5段階）',
      colors: [90, 72, 54, 36, 18].map((lv) => hslToHex(h, s, lv)),
    },
  ];
}

function normalizeHex(value) {
  const m = String(value).trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return '#' + hex.toUpperCase();
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">ベースカラー</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="cp-random">🎲 ランダム</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="color-preview" id="cp-preview"></div>
        <div class="color-inputs">
          <div class="color-input-group">
            <label for="cp-picker">色</label>
            <input type="color" id="cp-picker" value="#4F46E5" style="height:42px;padding:2px;cursor:pointer;" />
          </div>
          <div class="color-input-group">
            <label for="cp-hex">HEX</label>
            <input type="text" id="cp-hex" value="#4F46E5" spellcheck="false" />
            <button class="btn-icon" id="cp-copy-base" title="ベースカラーをコピー">📋</button>
          </div>
        </div>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">生成されたパレット</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="cp-copy-all">パレット全体をコピー</button>
        </div>
      </div>
      <div class="pane-body" id="cp-palettes"></div>
      <div class="status-bar">
        <span class="status-dot"></span>
        <span>スウォッチをクリックするとHEX値をコピーできます</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const picker = document.getElementById('cp-picker');
    const hexInput = document.getElementById('cp-hex');
    const preview = document.getElementById('cp-preview');
    const palettesEl = document.getElementById('cp-palettes');

    let currentHex = '#4F46E5';
    let currentPalettes = [];

    function renderPalettes() {
      currentPalettes = buildPalettes(currentHex);
      palettesEl.innerHTML = currentPalettes
        .map(
          (p) => `
        <div style="margin-bottom:1.25rem;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--color-text-dim);margin-bottom:0.5rem;">${p.label}</div>
          <div style="display:flex;gap:0.5rem;">
            ${p.colors
              .map(
                (hex) => `
              <button type="button" data-hex="${hex}" title="${hex} をコピー"
                style="flex:1;min-width:0;height:64px;border-radius:8px;border:1px solid var(--color-border);background:${hex};color:${textColorFor(hex)};font-family:var(--font-mono);font-size:0.7rem;cursor:pointer;padding:0;">
                ${hex}
              </button>`
              )
              .join('')}
          </div>
        </div>`
        )
        .join('');
    }

    function setBase(hex, { syncHexInput = true } = {}) {
      const normalized = normalizeHex(hex);
      if (!normalized) return;
      currentHex = normalized;
      picker.value = normalized;
      if (syncHexInput) hexInput.value = normalized;
      preview.style.background = normalized;
      renderPalettes();
    }

    palettesEl.addEventListener('click', (e) => {
      const swatch = e.target.closest('[data-hex]');
      if (swatch) copyToClipboard(swatch.dataset.hex);
    });

    picker.addEventListener('input', () => setBase(picker.value));

    hexInput.addEventListener('input', () => {
      // 入力途中の値は無視し、有効なHEXになった時点でパレットを更新する
      setBase(hexInput.value, { syncHexInput: false });
    });

    hexInput.addEventListener('blur', () => {
      hexInput.value = currentHex;
    });

    document.getElementById('cp-random').addEventListener('click', () => {
      const hex = '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
      setBase(hex);
    });

    document.getElementById('cp-copy-base').addEventListener('click', () => {
      copyToClipboard(currentHex);
    });

    document.getElementById('cp-copy-all').addEventListener('click', () => {
      const text = currentPalettes
        .map((p) => `${p.label}: ${p.colors.join(', ')}`)
        .join('\n');
      navigator.clipboard.writeText(text).then(() => {
        showToast('パレット全体をコピーしました');
      });
    });

    setBase('#4F46E5');
  }, 0);

  return widget;
}
