import { copyToClipboard, showToast } from '../utils.js';

// 単語として扱う文字クラス: 半角英数字 + ひらがな + カタカナ + 漢字 + 長音符（ー）
// これ以外の連続した文字（スペース・記号・句読点など）は区切り文字に変換する
const WORD_CHAR_CLASS = 'A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF\\u30FC';
const NON_WORD_RUN = new RegExp(`[^${WORD_CHAR_CLASS}]+`, 'g');

function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// タイトル文字列をURLスラッグに変換する
function slugify(text, separator, lowercase) {
  let s = text.trim();
  if (lowercase) s = s.toLowerCase();
  s = s.replace(NON_WORD_RUN, separator);
  const escapedSep = escapeForRegex(separator);
  const trimRe = new RegExp(`^${escapedSep}+|${escapedSep}+$`, 'g');
  return s.replace(trimRe, '');
}

// インタラクティブなツール部分のみを描画する（ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">URLスラッグ生成</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="slug-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <div style="display:flex; flex-direction:column; gap: 0.4rem; margin-bottom: 1.25rem;">
          <label for="slug-input" style="font-size:0.8rem; color:var(--color-text-muted);">タイトル文字列</label>
          <input type="text" id="slug-input" placeholder="例: Hello World 日本語 Test!" />
        </div>

        <div class="password-options" style="flex-direction:row; flex-wrap:wrap; align-items:center; gap:1.5rem;">
          <label class="pw-option">
            区切り文字:
            <select id="slug-separator" style="width:auto;">
              <option value="-">ハイフン (-)</option>
              <option value="_">アンダースコア (_)</option>
            </select>
          </label>
          <label class="pw-option">
            <input type="checkbox" id="slug-lowercase" checked /> 小文字に変換
          </label>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:1.75rem; margin-bottom:0.4rem;">
          <label for="slug-output" style="font-size:0.8rem; color:var(--color-text-muted);">生成されたスラッグ</label>
          <button class="btn-icon" id="slug-copy" title="コピー">📋</button>
        </div>
        <input type="text" id="slug-output" readonly placeholder="変換結果がここに表示されます..." />
      </div>
      <div class="status-bar">
        <span class="status-dot" id="slug-status-dot"></span>
        <span id="slug-status">0 文字</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('slug-input');
    const output = document.getElementById('slug-output');
    const separatorSelect = document.getElementById('slug-separator');
    const lowercaseCheckbox = document.getElementById('slug-lowercase');
    const status = document.getElementById('slug-status');
    const statusDot = document.getElementById('slug-status-dot');

    function update() {
      const slug = slugify(input.value, separatorSelect.value, lowercaseCheckbox.checked);
      output.value = slug;
      status.textContent = `${slug.length} 文字`;
      statusDot.className = 'status-dot';
    }

    input.addEventListener('input', update);
    separatorSelect.addEventListener('change', update);
    lowercaseCheckbox.addEventListener('change', update);

    document.getElementById('slug-copy').addEventListener('click', () => {
      if (output.value) {
        copyToClipboard(output.value);
      } else {
        showToast('先にタイトル文字列を入力してください', 'error');
      }
    });

    document.getElementById('slug-clear').addEventListener('click', () => {
      input.value = '';
      update();
      input.focus();
    });

    update();
  }, 0);

  return widget;
}
