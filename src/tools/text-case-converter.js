import { copyToClipboard } from '../utils.js';

// 変換先の定義（表示ラベル・DOM ID・変換関数）
// words は常に小文字の単語配列として渡される
const CASES = [
  { id: 'camel', label: 'camelCase', convert: (words) => words.map((w, i) => (i === 0 ? w : capitalize(w))).join('') },
  { id: 'snake', label: 'snake_case', convert: (words) => words.join('_') },
  { id: 'kebab', label: 'kebab-case', convert: (words) => words.join('-') },
  { id: 'pascal', label: 'PascalCase', convert: (words) => words.map(capitalize).join('') },
  { id: 'constant', label: 'CONSTANT_CASE', convert: (words) => words.map((w) => w.toUpperCase()).join('_') },
  { id: 'title', label: 'Title Case', convert: (words) => words.map(capitalize).join(' ') },
  { id: 'lower', label: 'lowercase', convert: (words) => words.join('') },
  { id: 'upper', label: 'UPPERCASE', convert: (words) => words.join('').toUpperCase() },
  { id: 'space', label: 'スペース区切り', convert: (words) => words.join(' ') },
];

function capitalize(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// camelCase / snake_case / kebab-case / スペース区切り など、
// どの形式で入力されても同じ単語配列に分割できるようにする汎用パーサー
export function splitWords(input) {
  if (!input) return [];
  return input
    .trim()
    // 連続する大文字＋大文字小文字の境界を分割（例: "XMLHttp" → "XML Http"）
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // 小文字/数字 → 大文字の境界を分割（camelCase / PascalCase の単語境界）
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // アンダースコア・ハイフン・ドットなどの区切り文字をスペースに統一
    .replace(/[_\-.]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';

  const resultRows = CASES.map(
    (c) => `
        <div class="hash-result-item">
          <label>${c.label}</label>
          <div class="hash-value" id="tc-${c.id}">—</div>
          <button class="btn-icon" data-target="tc-${c.id}" title="コピー">📋</button>
        </div>`
  ).join('');

  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">入力テキスト</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="tc-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <input type="text" id="tc-input" placeholder="変換したいテキストを入力（例: helloWorldExample / hello_world_example / Hello World Example）" />
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">変換結果</span>
      </div>
      <div class="pane-body">
        <div class="hash-results" id="tc-results">${resultRows}</div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('tc-input');
    const clearBtn = document.getElementById('tc-clear');

    function update() {
      const words = splitWords(input.value);
      CASES.forEach((c) => {
        const el = document.getElementById(`tc-${c.id}`);
        el.textContent = words.length ? c.convert(words) : '—';
      });
    }

    input.addEventListener('input', update);

    clearBtn.addEventListener('click', () => {
      input.value = '';
      update();
      input.focus();
    });

    document.querySelectorAll('#tc-results .btn-icon').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target && target.textContent !== '—') {
          copyToClipboard(target.textContent);
        }
      });
    });

    update();
  }, 0);

  return widget;
}
