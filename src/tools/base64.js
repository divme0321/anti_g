import { copyToClipboard } from '../utils.js';

// インタラクティブなツール部分のみを描画する（ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">入力（テキスト / Base64）</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="b64-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="b64-input" placeholder="エンコードしたいテキスト、またはデコードしたいBase64文字列を入力..."></textarea>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="b64-encode">エンコード →</button>
        <button class="btn btn-primary" id="b64-decode">← デコード</button>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">結果</span>
        <div class="pane-actions">
          <button class="btn-icon" id="b64-copy" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="b64-output" readonly placeholder="変換結果がここに表示されます..."></textarea>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="b64-status-dot"></span>
        <span id="b64-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('b64-input');
    const output = document.getElementById('b64-output');
    const status = document.getElementById('b64-status');
    const statusDot = document.getElementById('b64-status-dot');

    document.getElementById('b64-encode').addEventListener('click', () => {
      try {
        const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(input.value)));
        output.value = encoded;
        status.textContent = `エンコード完了 — ${encoded.length} 文字`;
        statusDot.className = 'status-dot';
      } catch (e) {
        status.textContent = `エラー: ${e.message}`;
        statusDot.className = 'status-dot error';
      }
    });

    document.getElementById('b64-decode').addEventListener('click', () => {
      try {
        const bytes = Uint8Array.from(atob(input.value.trim()), (c) => c.charCodeAt(0));
        output.value = new TextDecoder().decode(bytes);
        status.textContent = `デコード完了 — ${output.value.length} 文字`;
        statusDot.className = 'status-dot';
      } catch (e) {
        status.textContent = 'エラー: 不正なBase64文字列です';
        statusDot.className = 'status-dot error';
      }
    });

    document.getElementById('b64-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });

    document.getElementById('b64-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      status.textContent = '準備完了';
      statusDot.className = 'status-dot';
    });
  }, 0);

  return widget;
}
