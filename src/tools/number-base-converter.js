import { copyToClipboard } from '../utils.js';

// 変換元として選べる進数のラベル・入力パターン・BigInt変換用プレフィックス
const BASE_LABELS = { 2: '2進数（Binary）', 8: '8進数（Octal）', 10: '10進数（Decimal）', 16: '16進数（Hex）' };
const BASE_PATTERNS = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};
const BASE_PREFIX = { 2: '0b', 8: '0o', 10: '', 16: '0x' };
const BASE_PLACEHOLDER = { 2: '例: 1010', 8: '例: 17', 10: '例: 255', 16: '例: 1a3f' };

// インタラクティブなツール部分のみを描画する（ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">入力</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="nb-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="form-group">
          <label for="nb-from-base">変換元の進数</label>
          <select id="nb-from-base">
            <option value="2">2進数（Binary）</option>
            <option value="8">8進数（Octal）</option>
            <option value="10" selected>10進数（Decimal）</option>
            <option value="16">16進数（Hex）</option>
          </select>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label for="nb-input">変換したい値</label>
          <input type="text" id="nb-input" placeholder="例: 255" autocomplete="off" spellcheck="false" />
        </div>
        <div id="nb-error" class="regex-error" style="display:none;margin-top:12px"></div>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">変換結果</span>
      </div>
      <div class="pane-body">
        <div class="hash-results" id="nb-results">
          <div class="hash-result-item">
            <label>2進数（Binary）</label>
            <div class="hash-value" id="nb-bin">—</div>
            <button class="btn-icon" data-target="nb-bin" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>8進数（Octal）</label>
            <div class="hash-value" id="nb-oct">—</div>
            <button class="btn-icon" data-target="nb-oct" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>10進数（Decimal）</label>
            <div class="hash-value" id="nb-dec">—</div>
            <button class="btn-icon" data-target="nb-dec" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>16進数（Hex）</label>
            <div class="hash-value" id="nb-hex">—</div>
            <button class="btn-icon" data-target="nb-hex" title="コピー">📋</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const fromBaseSelect = document.getElementById('nb-from-base');
    const input = document.getElementById('nb-input');
    const errorEl = document.getElementById('nb-error');
    const clearBtn = document.getElementById('nb-clear');
    const outputs = {
      2: document.getElementById('nb-bin'),
      8: document.getElementById('nb-oct'),
      10: document.getElementById('nb-dec'),
      16: document.getElementById('nb-hex'),
    };

    function showError(message) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    function hideError() {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }

    function clearResults() {
      Object.values(outputs).forEach((el) => {
        el.textContent = '—';
      });
    }

    function update() {
      const base = Number(fromBaseSelect.value);
      const raw = input.value.trim();

      if (!raw) {
        hideError();
        clearResults();
        return;
      }

      const pattern = BASE_PATTERNS[base];
      if (!pattern.test(raw)) {
        showError(`${BASE_LABELS[base]}として使用できない文字が含まれています。0以上の整数のみ入力できます。`);
        clearResults();
        return;
      }

      try {
        const value = BigInt(BASE_PREFIX[base] + raw);
        hideError();
        outputs[2].textContent = value.toString(2);
        outputs[8].textContent = value.toString(8);
        outputs[10].textContent = value.toString(10);
        outputs[16].textContent = value.toString(16).toUpperCase();
      } catch (e) {
        showError('数値への変換に失敗しました。入力内容を確認してください。');
        clearResults();
      }
    }

    fromBaseSelect.addEventListener('change', () => {
      input.placeholder = BASE_PLACEHOLDER[Number(fromBaseSelect.value)];
      update();
    });

    input.addEventListener('input', update);

    clearBtn.addEventListener('click', () => {
      input.value = '';
      hideError();
      clearResults();
      input.focus();
    });

    document.querySelectorAll('#nb-results .btn-icon').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target && target.textContent !== '—') {
          copyToClipboard(target.textContent);
        }
      });
    });

    clearResults();
  }, 0);

  return widget;
}
