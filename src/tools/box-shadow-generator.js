import { copyToClipboard } from '../utils.js';

// HEXカラーと不透明度(%)から rgba() 文字列を生成する
export function hexToRgba(hex, opacityPercent) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = parseFloat((opacityPercent / 100).toFixed(2));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// px値の整形（0のときは単位なしの「0」にする）
export function px(n) {
  return n === 0 ? '0' : `${n}px`;
}

// 現在の設定から box-shadow の値部分を組み立てる
export function buildShadowValue({ x, y, blur, spread, color, opacity, inset }) {
  const parts = [];
  if (inset) parts.push('inset');
  parts.push(px(x), px(y), px(blur));
  if (spread !== 0) parts.push(px(spread));
  parts.push(hexToRgba(color, opacity));
  return parts.join(' ');
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';

  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">設定</span>
      </div>
      <div class="pane-body">
        <div class="qr-settings">
          <div class="qr-form-group">
            <label for="bs-x">X方向オフセット: <span id="bs-x-val">0</span>px</label>
            <input type="range" id="bs-x" min="-50" max="50" value="0" class="grad-range" />
          </div>
          <div class="qr-form-group">
            <label for="bs-y">Y方向オフセット: <span id="bs-y-val">4</span>px</label>
            <input type="range" id="bs-y" min="-50" max="50" value="4" class="grad-range" />
          </div>
          <div class="qr-form-group">
            <label for="bs-blur">ぼかし: <span id="bs-blur-val">12</span>px</label>
            <input type="range" id="bs-blur" min="0" max="100" value="12" class="grad-range" />
          </div>
          <div class="qr-form-group">
            <label for="bs-spread">広がり: <span id="bs-spread-val">0</span>px</label>
            <input type="range" id="bs-spread" min="-50" max="50" value="0" class="grad-range" />
          </div>
          <div class="qr-form-group">
            <label for="bs-opacity">不透明度: <span id="bs-opacity-val">15</span>%</label>
            <input type="range" id="bs-opacity" min="0" max="100" value="15" class="grad-range" />
          </div>
          <div class="qr-form-group">
            <label for="bs-color">影の色</label>
            <input type="color" id="bs-color" value="#000000" />
          </div>
          <div class="qr-form-group">
            <label for="bs-inset" style="justify-content: flex-start; gap: var(--space-xs)">
              <input type="checkbox" id="bs-inset" />
              内側の影（inset）
            </label>
          </div>
          <div class="qr-form-group" style="margin-top: var(--space-lg)">
            <label>プリセット</label>
            <div class="grad-presets" id="bs-presets"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">プレビューとコード</span>
        <div class="pane-actions">
          <button class="btn btn-primary" id="bs-copy">📋 CSSをコピー</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="grad-preview" id="bs-preview" style="background: #e9ecef; display: flex; align-items: center; justify-content: center">
          <div id="bs-preview-card" style="width: 180px; height: 110px; background: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #495057; font-size: 0.85rem">プレビュー</div>
        </div>
        <div class="grad-code-block">
          <pre><code id="bs-css-output"></code></pre>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const presets = [
      { name: 'ソフト', x: 0, y: 1, blur: 3, spread: 0, opacity: 15, color: '#000000', inset: false },
      { name: '標準カード', x: 0, y: 4, blur: 12, spread: 0, opacity: 15, color: '#000000', inset: false },
      { name: '浮遊', x: 0, y: 12, blur: 32, spread: 0, opacity: 20, color: '#000000', inset: false },
      { name: 'シャープ', x: 0, y: 2, blur: 4, spread: 0, opacity: 25, color: '#000000', inset: false },
      { name: '内側', x: 0, y: 2, blur: 6, spread: 0, opacity: 20, color: '#000000', inset: true },
    ];

    const sliders = ['x', 'y', 'blur', 'spread', 'opacity'].map((key) => ({
      key,
      input: document.getElementById(`bs-${key}`),
      valLabel: document.getElementById(`bs-${key}-val`),
    }));
    const colorInput = document.getElementById('bs-color');
    const insetInput = document.getElementById('bs-inset');
    const previewCard = document.getElementById('bs-preview-card');
    const cssOutput = document.getElementById('bs-css-output');
    const presetsContainer = document.getElementById('bs-presets');

    function currentSettings() {
      const s = { color: colorInput.value, inset: insetInput.checked };
      sliders.forEach(({ key, input }) => {
        s[key] = parseInt(input.value, 10);
      });
      return s;
    }

    function update() {
      const shadow = buildShadowValue(currentSettings());
      previewCard.style.boxShadow = shadow;
      cssOutput.textContent = `box-shadow: ${shadow};`;
    }

    sliders.forEach(({ input, valLabel }) => {
      input.addEventListener('input', () => {
        valLabel.textContent = input.value;
        update();
      });
    });
    colorInput.addEventListener('input', update);
    insetInput.addEventListener('change', update);

    document.getElementById('bs-copy').addEventListener('click', () => {
      copyToClipboard(cssOutput.textContent);
    });

    presets.forEach((preset) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.textContent = preset.name;
      btn.addEventListener('click', () => {
        sliders.forEach(({ key, input, valLabel }) => {
          input.value = preset[key];
          valLabel.textContent = preset[key];
        });
        colorInput.value = preset.color;
        insetInput.checked = preset.inset;
        update();
      });
      presetsContainer.appendChild(btn);
    });

    update();
  }, 0);

  return widget;
}
