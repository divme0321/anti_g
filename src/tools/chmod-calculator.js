import { copyToClipboard } from '../utils.js';

// 8進数3桁の文字列（例: '755'）をシンボリック表記（例: 'rwxr-xr-x'）に変換する
export function octalToSymbolic(octal) {
  return octal
    .split('')
    .map((d) => {
      const n = Number(d);
      return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
    })
    .join('');
}

// 8進数表記のバリデーション（000〜777、3桁のみ許可）
export function isValidOctal(value) {
  return /^[0-7]{3}$/.test(value);
}

// プリセット定義（値・ボタン表示ラベル）
const PRESETS = [
  { value: '644', label: '644（ファイル標準）' },
  { value: '755', label: '755（ディレクトリ・実行ファイル）' },
  { value: '600', label: '600（秘密鍵）' },
  { value: '664', label: '664' },
  { value: '775', label: '775' },
  { value: '777', label: '777（非推奨）' },
];

// 行: 所有者 / グループ / その他（who = 8進数の桁インデックス）
const ROWS = [
  { who: 0, label: '所有者（owner）' },
  { who: 1, label: 'グループ（group）' },
  { who: 2, label: 'その他（others）' },
];

// 列: 読み取り / 書き込み / 実行（bit = 加算値）
const COLS = [
  { bit: 4, label: '読み取り（r）' },
  { bit: 2, label: '書き込み（w）' },
  { bit: 1, label: '実行（x）' },
];

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">パーミッションを選択</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="chmod-reset">リセット</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="grad-presets" style="margin-bottom: var(--space-lg);">
          ${PRESETS.map(
            (p) => `<button class="btn btn-secondary" data-chmod-preset="${p.value}">${p.label}</button>`
          ).join('')}
        </div>

        <div class="article" style="max-width:none;">
          <table id="chmod-grid">
            <thead>
              <tr>
                <th>対象</th>
                ${COLS.map((c) => `<th>${c.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${ROWS.map(
                (row) => `
              <tr>
                <th>${row.label}</th>
                ${COLS.map(
                  (col) => `
                <td>
                  <label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer;">
                    <input type="checkbox" class="chmod-check" id="chmod-check-${row.who}-${col.bit}" data-who="${row.who}" data-bit="${col.bit}" />
                    <span>許可</span>
                  </label>
                </td>`
                ).join('')}
              </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>

        <div class="form-group" style="display:flex; flex-direction:column; gap: var(--space-xs); margin-bottom: var(--space-md);">
          <label for="chmod-octal" style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color: var(--color-text-dim);">8進数表記（000〜777）</label>
          <input type="text" id="chmod-octal" maxlength="3" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="例: 755" />
        </div>

        <div id="chmod-error" class="regex-error" style="display:none;"></div>

        <div class="hash-results" id="chmod-results">
          <div class="hash-result-item">
            <label>シンボリック表記</label>
            <div class="hash-value" id="chmod-symbolic">—</div>
            <button class="btn-icon" data-target="chmod-symbolic" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>コマンド例</label>
            <div class="hash-value" id="chmod-command">—</div>
            <button class="btn-icon" data-target="chmod-command" title="コピー">📋</button>
          </div>
        </div>

        <div id="chmod-note" style="display:none; margin-top: var(--space-md); font-size: 0.8rem; color: var(--color-text-dim);"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const octalInput = document.getElementById('chmod-octal');
    const symbolicEl = document.getElementById('chmod-symbolic');
    const commandEl = document.getElementById('chmod-command');
    const errorBox = document.getElementById('chmod-error');
    const noteBox = document.getElementById('chmod-note');
    const checks = Array.from(widget.querySelectorAll('.chmod-check'));

    // チェックボックスの状態から8進数3桁の文字列を組み立てる
    function readOctalFromChecks() {
      const digits = [0, 0, 0];
      checks.forEach((cb) => {
        if (cb.checked) digits[Number(cb.dataset.who)] += Number(cb.dataset.bit);
      });
      return digits.join('');
    }

    // 8進数文字列をチェックボックスに反映する
    function applyOctalToChecks(octal) {
      checks.forEach((cb) => {
        const digit = Number(octal[Number(cb.dataset.who)]);
        cb.checked = Boolean(digit & Number(cb.dataset.bit));
      });
    }

    // 結果表示（シンボリック表記・コマンド例・777の注意書き）を更新する
    function renderResults(octal) {
      symbolicEl.textContent = octalToSymbolic(octal);
      commandEl.textContent = `chmod ${octal} ファイル名`;
      errorBox.style.display = 'none';
      if (octal === '777') {
        noteBox.textContent =
          '⚠ 777 はすべてのユーザーに読み取り・書き込み・実行を許可します。セキュリティ上のリスクが大きいため、本番環境での使用は推奨されません。';
        noteBox.style.display = 'block';
      } else {
        noteBox.style.display = 'none';
      }
    }

    // チェックボックス側の変更 → 8進数入力と結果に反映
    function syncFromChecks() {
      const octal = readOctalFromChecks();
      octalInput.value = octal;
      renderResults(octal);
    }

    // 8進数入力側の変更 → バリデーションしてチェックボックスと結果に反映
    function syncFromOctal() {
      const value = octalInput.value.trim();
      if (!isValidOctal(value)) {
        errorBox.textContent = '8進数3桁（000〜777）で入力してください。各桁は0〜7の数字です（例: 755）';
        errorBox.style.display = 'block';
        return;
      }
      applyOctalToChecks(value);
      renderResults(value);
    }

    checks.forEach((cb) => cb.addEventListener('change', syncFromChecks));
    octalInput.addEventListener('input', syncFromOctal);

    widget.querySelectorAll('[data-chmod-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        octalInput.value = btn.dataset.chmodPreset;
        syncFromOctal();
      });
    });

    document.getElementById('chmod-reset').addEventListener('click', () => {
      octalInput.value = '644';
      syncFromOctal();
    });

    widget.querySelectorAll('#chmod-results .btn-icon').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target && target.textContent !== '—') {
          copyToClipboard(target.textContent);
        }
      });
    });

    // 初期表示は 755（ディレクトリの標準値）
    octalInput.value = '755';
    syncFromOctal();
  }, 0);

  return widget;
}
