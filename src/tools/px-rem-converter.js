import { copyToClipboard } from '../utils.js';

// px ⇔ rem 変換ウィジェット（インタラクティブ部分のみ。見出し・記事はテンプレート側が担当）

// 早見表に載せるpx値
const TABLE_PX_VALUES = [8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64];

// 小数第4位までに丸め、末尾の0を除去した文字列を返す
function formatNumber(value) {
  if (!isFinite(value)) return '';
  return String(parseFloat(value.toFixed(4)));
}

function pxToRem(px, base) {
  return formatNumber(px / base);
}

function remToPx(rem, base) {
  return formatNumber(rem * base);
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">px ⇔ rem 変換</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="pxr-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="qr-form-group">
          <label for="pxr-base">基準フォントサイズ（px）</label>
          <input type="number" id="pxr-base" value="16" min="1" step="1" />
          <div style="font-size: 0.75rem; color: var(--color-text-dim); margin-top: var(--space-xs);">通常はブラウザの既定値である 16px のままで問題ありません。</div>
        </div>

        <div style="display:flex; gap: var(--space-md); align-items:flex-end; flex-wrap:wrap; margin-top: var(--space-lg);">
          <div class="qr-form-group" style="flex:1; min-width:140px;">
            <label for="pxr-px">px</label>
            <input type="number" id="pxr-px" value="24" step="any" placeholder="例: 24" />
          </div>
          <div style="padding-bottom: var(--space-md); color: var(--color-text-dim); font-size: 1.1rem;">⇔</div>
          <div class="qr-form-group" style="flex:1; min-width:140px;">
            <label for="pxr-rem">rem</label>
            <input type="number" id="pxr-rem" value="1.5" step="any" placeholder="例: 1.5" />
          </div>
        </div>

        <div class="hash-results" style="margin-top: var(--space-lg);">
          <div class="hash-result-item">
            <label>CSS表記</label>
            <div class="hash-value" id="pxr-css">font-size: 1.5rem;</div>
            <button class="btn-icon" id="pxr-copy-css" title="コピー">📋</button>
          </div>
        </div>

        <h3 style="margin-top: var(--space-xl); margin-bottom: var(--space-sm); font-size: 0.9rem; color: var(--color-heading);">変換早見表（基準 <span id="pxr-table-base">16</span>px）</h3>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-family: var(--font-mono); font-size: 0.85rem;">
            <thead>
              <tr>
                <th style="text-align:left; padding: var(--space-sm); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted);">px</th>
                <th style="text-align:left; padding: var(--space-sm); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted);">rem</th>
                <th style="width:48px; border-bottom: 1px solid var(--color-border);"></th>
              </tr>
            </thead>
            <tbody id="pxr-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const baseInput = document.getElementById('pxr-base');
    const pxInput = document.getElementById('pxr-px');
    const remInput = document.getElementById('pxr-rem');
    const cssOutput = document.getElementById('pxr-css');
    const tableBase = document.getElementById('pxr-table-base');
    const tableBody = document.getElementById('pxr-table-body');

    function getBase() {
      const base = parseFloat(baseInput.value);
      return isFinite(base) && base > 0 ? base : 16;
    }

    function updateCss() {
      const rem = remInput.value.trim();
      cssOutput.textContent = rem === '' ? '—' : `font-size: ${rem}rem;`;
    }

    function updateFromPx() {
      const px = parseFloat(pxInput.value);
      remInput.value = isFinite(px) ? pxToRem(px, getBase()) : '';
      updateCss();
    }

    function updateFromRem() {
      const rem = parseFloat(remInput.value);
      pxInput.value = isFinite(rem) ? remToPx(rem, getBase()) : '';
      updateCss();
    }

    function renderTable() {
      const base = getBase();
      tableBase.textContent = formatNumber(base);
      tableBody.innerHTML = TABLE_PX_VALUES.map((px) => {
        const rem = pxToRem(px, base);
        return `
          <tr>
            <td style="padding: var(--space-sm); border-bottom: 1px solid var(--color-border);">${px}px</td>
            <td style="padding: var(--space-sm); border-bottom: 1px solid var(--color-border);">${rem}rem</td>
            <td style="padding: var(--space-sm); border-bottom: 1px solid var(--color-border); text-align:center;"><button class="btn-icon" data-rem="${rem}" title="コピー">📋</button></td>
          </tr>`;
      }).join('');

      tableBody.querySelectorAll('[data-rem]').forEach((btn) => {
        btn.addEventListener('click', () => copyToClipboard(`${btn.dataset.rem}rem`));
      });
    }

    baseInput.addEventListener('input', () => {
      // 基準変更時はpx側を起点に再計算し、早見表も更新する
      updateFromPx();
      renderTable();
    });
    pxInput.addEventListener('input', updateFromPx);
    remInput.addEventListener('input', updateFromRem);

    document.getElementById('pxr-copy-css').addEventListener('click', () => {
      if (remInput.value.trim() !== '') copyToClipboard(`font-size: ${remInput.value.trim()}rem;`);
    });

    document.getElementById('pxr-clear').addEventListener('click', () => {
      baseInput.value = '16';
      pxInput.value = '';
      remInput.value = '';
      updateCss();
      renderTable();
    });

    renderTable();
    updateCss();
  }, 0);

  return widget;
}
