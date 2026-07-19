import { copyToClipboard, showToast } from '../utils.js';

// 行ソート・重複削除 — インタラクティブなツール部分のみを描画する
// （ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">入力（複数行テキスト）</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="ls-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="ls-input" placeholder="処理したい複数行のテキストを貼り付けてください..."></textarea>
      </div>
      <div class="tool-actions" style="flex-wrap:wrap;">
        <button class="btn btn-primary" id="ls-sort-asc">昇順ソート（A→Z）</button>
        <button class="btn btn-primary" id="ls-sort-desc">降順ソート（Z→A）</button>
        <button class="btn btn-primary" id="ls-unique">重複行を削除</button>
        <button class="btn btn-secondary" id="ls-remove-empty">空行を削除</button>
        <button class="btn btn-secondary" id="ls-trim">前後空白を削除</button>
        <button class="btn btn-secondary" id="ls-reverse">逆順（上下反転）</button>
      </div>
      <div class="tool-actions">
        <label class="pw-option">
          <input type="checkbox" id="ls-ignore-case" /> 大文字小文字を区別しない
        </label>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">結果</span>
        <div class="pane-actions">
          <button class="btn-icon" id="ls-copy" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="ls-output" readonly placeholder="処理結果がここに表示されます..."></textarea>
      </div>
      <div class="tool-actions">
        <button class="btn btn-secondary" id="ls-send-back">← 結果を入力に戻す</button>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="ls-status-dot"></span>
        <span id="ls-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('ls-input');
    const output = document.getElementById('ls-output');
    const status = document.getElementById('ls-status');
    const statusDot = document.getElementById('ls-status-dot');
    const ignoreCase = document.getElementById('ls-ignore-case');

    // 入力を行配列に分割する（末尾の改行1つは行として数えない）
    function getLines() {
      let text = input.value;
      if (text === '') return [];
      if (text.endsWith('\n')) text = text.slice(0, -1);
      return text.split('\n');
    }

    // ソート用の比較キー（大文字小文字を区別しない場合は小文字化）
    function key(line) {
      return ignoreCase.checked ? line.toLowerCase() : line;
    }

    // 処理結果を出力ペインに反映し、行数の変化をステータスバーに表示する
    function apply(lines, before) {
      output.value = lines.join('\n');
      const removed = before - lines.length;
      status.textContent =
        removed > 0
          ? `${before}行 → ${lines.length}行（${removed}行削除）`
          : `${before}行 → ${lines.length}行`;
      statusDot.className = 'status-dot';
    }

    function sortLines(direction) {
      const lines = getLines();
      // 日本語も自然に並ぶよう locale 'ja' + numeric（数値の大小を考慮）で比較する
      const sorted = [...lines].sort(
        (a, b) => key(a).localeCompare(key(b), 'ja', { numeric: true }) * direction
      );
      apply(sorted, lines.length);
    }

    document.getElementById('ls-sort-asc').addEventListener('click', () => sortLines(1));
    document.getElementById('ls-sort-desc').addEventListener('click', () => sortLines(-1));

    document.getElementById('ls-unique').addEventListener('click', () => {
      const lines = getLines();
      // 元の順序を維持したまま、2回目以降に現れた行を取り除く
      const seen = new Set();
      const unique = lines.filter((line) => {
        const k = key(line);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      apply(unique, lines.length);
    });

    document.getElementById('ls-remove-empty').addEventListener('click', () => {
      const lines = getLines();
      // 空白文字だけの行も「空行」として扱う
      apply(lines.filter((line) => line.trim() !== ''), lines.length);
    });

    document.getElementById('ls-trim').addEventListener('click', () => {
      const lines = getLines();
      apply(lines.map((line) => line.trim()), lines.length);
    });

    document.getElementById('ls-reverse').addEventListener('click', () => {
      const lines = getLines();
      apply([...lines].reverse(), lines.length);
    });

    document.getElementById('ls-send-back').addEventListener('click', () => {
      if (!output.value) {
        showToast('結果がありません', 'error');
        return;
      }
      // 処理を連続適用できるよう、結果を入力欄へ戻す
      input.value = output.value;
      output.value = '';
      status.textContent = '結果を入力に戻しました';
      statusDot.className = 'status-dot';
    });

    document.getElementById('ls-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });

    document.getElementById('ls-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      status.textContent = '準備完了';
      statusDot.className = 'status-dot';
    });
  }, 0);

  return widget;
}
