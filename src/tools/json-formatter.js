import { copyToClipboard, showToast } from '../utils.js';

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">入力</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="json-sample">サンプル</button>
            <button class="btn btn-secondary" id="json-clear">クリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="json-input" placeholder='ここにJSONを貼り付けてください...\n\n{"example": "value"}'></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="json-format">✦ 整形</button>
          <button class="btn btn-secondary" id="json-minify">Minify（圧縮）</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">出力</span>
          <div class="pane-actions">
            <button class="btn-icon" id="json-copy" title="コピー">📋</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="json-output" readonly placeholder="整形されたJSONがここに表示されます..."></textarea>
        </div>
        <div class="status-bar">
          <span class="status-dot" id="json-status-dot"></span>
          <span id="json-status">準備完了</span>
        </div>
      </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('json-input');
        const output = document.getElementById('json-output');
        const statusDot = document.getElementById('json-status-dot');
        const status = document.getElementById('json-status');

        function setStatus(msg, isError = false) {
            status.textContent = msg;
            statusDot.className = isError ? 'status-dot error' : 'status-dot';
        }

        document.getElementById('json-format').addEventListener('click', () => {
            try {
                const parsed = JSON.parse(input.value);
                output.value = JSON.stringify(parsed, null, 2);
                setStatus(`有効なJSONです — トップレベルキー ${Object.keys(parsed).length} 個`);
            } catch (e) {
                output.value = '';
                setStatus(`エラー: ${e.message}`, true);
                showToast(e.message, 'error');
            }
        });

        document.getElementById('json-minify').addEventListener('click', () => {
            try {
                const parsed = JSON.parse(input.value);
                output.value = JSON.stringify(parsed);
                setStatus(`圧縮完了 — ${output.value.length} 文字`);
            } catch (e) {
                setStatus(`エラー: ${e.message}`, true);
                showToast(e.message, 'error');
            }
        });

        document.getElementById('json-copy').addEventListener('click', () => {
            if (output.value) copyToClipboard(output.value);
        });

        document.getElementById('json-clear').addEventListener('click', () => {
            input.value = '';
            output.value = '';
            setStatus('準備完了');
        });

        document.getElementById('json-sample').addEventListener('click', () => {
            input.value = JSON.stringify({
                name: "DevToolBox",
                version: "1.0.0",
                tools: ["json-formatter", "base64", "uuid-generator"],
                config: {
                    theme: "dark",
                    language: "en",
                    features: { formatting: true, validation: true, minification: true }
                },
                stats: { users: 1000, rating: 4.9 }
            }, null, 2);
        });
    }, 0);

    return widget;
}
