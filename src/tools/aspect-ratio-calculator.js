import { copyToClipboard } from '../utils.js';

// アスペクト比計算機 — インタラクティブ部分のみ（見出し・記事はテンプレート側が担当）

// 最大公約数（ユークリッドの互除法）
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// 数値の小数部の桁数を返す（最大4桁まで考慮）
function decimalDigits(value) {
  const str = String(value);
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : Math.min(str.length - dot - 1, 4);
}

// 幅・高さから約分した整数比を返す（小数入力にも対応）
export function reduceRatio(width, height) {
  const scale = Math.pow(10, Math.max(decimalDigits(width), decimalDigits(height)));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const g = gcd(w, h) || 1;
  return { rw: w / g, rh: h / g };
}

// 比率を固定したまま、新しい幅から高さを計算する（整数に丸める）
export function heightFromWidth(width, rw, rh) {
  return Math.round((width * rh) / rw);
}

// 比率を固定したまま、新しい高さから幅を計算する（整数に丸める）
export function widthFromHeight(height, rw, rh) {
  return Math.round((height * rw) / rh);
}

// 小数第2位までに丸め、末尾の0を除去した文字列を返す
function formatDecimal(value) {
  if (!isFinite(value)) return '';
  return String(parseFloat(value.toFixed(2)));
}

// 比率の表示用文字列（整数はそのまま、小数は不要な桁を除去）
function formatRatioPart(value) {
  return String(parseFloat(Number(value).toFixed(4)));
}

// プリセット比率（label: ボタン表示 / rw, rh: 比率 / w, h: 元のサイズ欄に入れる代表サイズ）
const PRESETS = [
  { label: '16:9（フルHD / YouTube）', rw: 16, rh: 9, w: 1920, h: 1080 },
  { label: '4:3', rw: 4, rh: 3, w: 1024, h: 768 },
  { label: '1:1（正方形）', rw: 1, rh: 1, w: 1080, h: 1080 },
  { label: '3:2（写真）', rw: 3, rh: 2, w: 3000, h: 2000 },
  { label: '21:9（ウルトラワイド）', rw: 21, rh: 9, w: 3360, h: 1440 },
  { label: '9:16（縦動画 / ストーリーズ）', rw: 9, rh: 16, w: 1080, h: 1920 },
  { label: '1.618:1（黄金比）', rw: 1.618, rh: 1, w: 1618, h: 1000 },
];

// 早見表のターゲットサイズ（横長は幅基準、縦長は高さ基準で近い整数サイズを生成する）
const TABLE_TARGETS = [1280, 1920, 2560, 3840];

// よく知られた比率については実際に流通している代表サイズを使う
const KNOWN_SIZES = {
  '4:3': [
    { w: 800, h: 600 },
    { w: 1024, h: 768 },
    { w: 1600, h: 1200 },
    { w: 2048, h: 1536 },
  ],
  '3:2': [
    { w: 1620, h: 1080 },
    { w: 3000, h: 2000 },
    { w: 4500, h: 3000 },
    { w: 6000, h: 4000 },
  ],
  '21:9': [
    { w: 1680, h: 720 },
    { w: 2520, h: 1080 },
    { w: 3360, h: 1440 },
    { w: 5040, h: 2160 },
  ],
};

// 現在の比率に基づく代表サイズ一覧を返す
export function buildSizeTable(rw, rh) {
  const known = KNOWN_SIZES[`${rw}:${rh}`];
  if (known) return known;
  const isPortrait = rh > rw;
  return TABLE_TARGETS.map((target) => {
    if (isPortrait) {
      // 縦長の比率は高さを基準に幅を計算する
      const k = Number.isInteger(rh) ? Math.round(target / rh) : 0;
      const h = k > 0 ? k * rh : target;
      const w = k > 0 && Number.isInteger(rw) ? k * rw : widthFromHeight(h, rw, rh);
      return { w, h };
    }
    // 横長・正方形の比率は幅を基準に高さを計算する
    const k = Number.isInteger(rw) ? Math.round(target / rw) : 0;
    const w = k > 0 ? k * rw : target;
    const h = k > 0 && Number.isInteger(rh) ? k * rh : heightFromWidth(w, rw, rh);
    return { w, h };
  });
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">アスペクト比計算</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="ar-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <h3 style="margin-bottom: var(--space-sm); font-size: 0.9rem; color: var(--color-heading);">元のサイズ</h3>
        <div style="display:flex; gap: var(--space-md); align-items:flex-end; flex-wrap:wrap;">
          <div class="qr-form-group" style="flex:1; min-width:120px;">
            <label for="ar-width">幅（px）</label>
            <input type="number" id="ar-width" value="1920" min="1" step="any" placeholder="例: 1920" />
          </div>
          <div style="padding-bottom: var(--space-md); color: var(--color-text-dim); font-size: 1.1rem;">×</div>
          <div class="qr-form-group" style="flex:1; min-width:120px;">
            <label for="ar-height">高さ（px）</label>
            <input type="number" id="ar-height" value="1080" min="1" step="any" placeholder="例: 1080" />
          </div>
        </div>

        <div class="grad-presets" style="margin-top: var(--space-md); margin-bottom: var(--space-lg);">
          ${PRESETS.map(
            (p, i) => `<button class="btn btn-secondary" data-preset="${i}">${p.label}</button>`
          ).join('')}
        </div>

        <div id="ar-error" class="regex-error" style="display:none;"></div>

        <div class="hash-results" id="ar-results">
          <div class="hash-result-item">
            <label>アスペクト比（約分）</label>
            <div class="hash-value" id="ar-ratio">16 : 9</div>
            <button class="btn-icon" data-copy-target="ar-ratio" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>小数比</label>
            <div class="hash-value" id="ar-decimal">1.78 : 1</div>
            <button class="btn-icon" data-copy-target="ar-decimal" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>CSSスニペット</label>
            <div class="hash-value" id="ar-css">aspect-ratio: 16 / 9;</div>
            <button class="btn-icon" data-copy-target="ar-css" title="コピー">📋</button>
          </div>
        </div>

        <h3 style="margin-top: var(--space-xl); margin-bottom: var(--space-sm); font-size: 0.9rem; color: var(--color-heading);">サイズ計算（比率を固定して換算）</h3>
        <div style="display:flex; gap: var(--space-md); align-items:flex-end; flex-wrap:wrap;">
          <div class="qr-form-group" style="flex:1; min-width:120px;">
            <label for="ar-new-width">新しい幅（px）</label>
            <input type="number" id="ar-new-width" min="1" step="any" placeholder="例: 1280" />
          </div>
          <div style="padding-bottom: var(--space-md); color: var(--color-text-dim); font-size: 1.1rem;">×</div>
          <div class="qr-form-group" style="flex:1; min-width:120px;">
            <label for="ar-new-height">新しい高さ（px）</label>
            <input type="number" id="ar-new-height" min="1" step="any" placeholder="例: 720" />
          </div>
        </div>
        <div class="hash-results" style="margin-top: var(--space-md);">
          <div class="hash-result-item">
            <label>計算結果</label>
            <div class="hash-value" id="ar-calc-result">—</div>
            <button class="btn-icon" id="ar-copy-calc" title="コピー">📋</button>
          </div>
        </div>

        <h3 style="margin-top: var(--space-xl); margin-bottom: var(--space-sm); font-size: 0.9rem; color: var(--color-heading);">よく使う解像度の早見表（<span id="ar-table-ratio">16:9</span>）</h3>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-family: var(--font-mono); font-size: 0.85rem;">
            <thead>
              <tr>
                <th style="text-align:left; padding: var(--space-sm); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted);">幅</th>
                <th style="text-align:left; padding: var(--space-sm); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted);">高さ</th>
                <th style="width:48px; border-bottom: 1px solid var(--color-border);"></th>
              </tr>
            </thead>
            <tbody id="ar-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const widthInput = document.getElementById('ar-width');
    const heightInput = document.getElementById('ar-height');
    const newWidthInput = document.getElementById('ar-new-width');
    const newHeightInput = document.getElementById('ar-new-height');
    const ratioOutput = document.getElementById('ar-ratio');
    const decimalOutput = document.getElementById('ar-decimal');
    const cssOutput = document.getElementById('ar-css');
    const calcResult = document.getElementById('ar-calc-result');
    const tableRatio = document.getElementById('ar-table-ratio');
    const tableBody = document.getElementById('ar-table-body');
    const errorBox = document.getElementById('ar-error');
    const results = document.getElementById('ar-results');

    // 現在の比率（プリセットまたは元のサイズから決まる）
    let ratio = { rw: 16, rh: 9 };

    function ratioText() {
      return `${formatRatioPart(ratio.rw)}:${formatRatioPart(ratio.rh)}`;
    }

    // 比率の表示（約分・小数比・CSSスニペット）を更新する
    function renderRatio() {
      ratioOutput.textContent = `${formatRatioPart(ratio.rw)} : ${formatRatioPart(ratio.rh)}`;
      decimalOutput.textContent = `${formatDecimal(ratio.rw / ratio.rh)} : 1`;
      cssOutput.textContent = `aspect-ratio: ${formatRatioPart(ratio.rw)} / ${formatRatioPart(ratio.rh)};`;
      tableRatio.textContent = ratioText();
    }

    // 現在の比率に基づく早見表を更新する
    function renderTable() {
      tableBody.innerHTML = buildSizeTable(ratio.rw, ratio.rh)
        .map(
          ({ w, h }) => `
          <tr>
            <td style="padding: var(--space-sm); border-bottom: 1px solid var(--color-border);">${w}px</td>
            <td style="padding: var(--space-sm); border-bottom: 1px solid var(--color-border);">${h}px</td>
            <td style="padding: var(--space-sm); border-bottom: 1px solid var(--color-border); text-align:center;"><button class="btn-icon" data-size="${w}×${h}" title="コピー">📋</button></td>
          </tr>`
        )
        .join('');
      tableBody.querySelectorAll('[data-size]').forEach((btn) => {
        btn.addEventListener('click', () => copyToClipboard(btn.dataset.size));
      });
    }

    function showError(message) {
      if (message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
        results.style.display = 'none';
      } else {
        errorBox.style.display = 'none';
        results.style.display = 'flex';
      }
    }

    // 元のサイズ入力から比率を再計算する
    function updateFromSize() {
      const w = parseFloat(widthInput.value);
      const h = parseFloat(heightInput.value);
      if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) {
        showError('幅と高さには0より大きい数値を入力してください');
        return;
      }
      showError('');
      ratio = reduceRatio(w, h);
      renderRatio();
      renderTable();
      updateCalcFromWidth();
    }

    // サイズ計算の結果表示を更新する
    function renderCalcResult() {
      const w = parseFloat(newWidthInput.value);
      const h = parseFloat(newHeightInput.value);
      calcResult.textContent = isFinite(w) && isFinite(h) ? `${w} × ${h}` : '—';
    }

    // 新しい幅から高さを計算する
    function updateCalcFromWidth() {
      const w = parseFloat(newWidthInput.value);
      newHeightInput.value = isFinite(w) && w > 0 ? heightFromWidth(w, ratio.rw, ratio.rh) : '';
      renderCalcResult();
    }

    // 新しい高さから幅を計算する
    function updateCalcFromHeight() {
      const h = parseFloat(newHeightInput.value);
      newWidthInput.value = isFinite(h) && h > 0 ? widthFromHeight(h, ratio.rw, ratio.rh) : '';
      renderCalcResult();
    }

    widthInput.addEventListener('input', updateFromSize);
    heightInput.addEventListener('input', updateFromSize);
    newWidthInput.addEventListener('input', updateCalcFromWidth);
    newHeightInput.addEventListener('input', updateCalcFromHeight);

    widget.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = PRESETS[Number(btn.dataset.preset)];
        widthInput.value = preset.w;
        heightInput.value = preset.h;
        showError('');
        // 黄金比などの小数比はプリセットの比率をそのまま使う
        ratio = { rw: preset.rw, rh: preset.rh };
        renderRatio();
        renderTable();
        updateCalcFromWidth();
      });
    });

    widget.querySelectorAll('[data-copy-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.copyTarget);
        if (target && target.textContent !== '—') copyToClipboard(target.textContent);
      });
    });

    document.getElementById('ar-copy-calc').addEventListener('click', () => {
      if (calcResult.textContent !== '—') copyToClipboard(calcResult.textContent);
    });

    document.getElementById('ar-clear').addEventListener('click', () => {
      widthInput.value = '1920';
      heightInput.value = '1080';
      newWidthInput.value = '';
      newHeightInput.value = '';
      updateFromSize();
      renderCalcResult();
      widthInput.focus();
    });

    // 初期表示
    newWidthInput.value = '1280';
    updateFromSize();
  }, 0);

  return widget;
}
