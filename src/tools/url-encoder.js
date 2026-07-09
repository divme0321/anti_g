import { copyToClipboard } from '../utils.js';

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">入力</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="url-clear">クリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="url-input" placeholder="エンコード/デコードしたいテキストまたはURLを入力..."></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="url-encode">エンコード</button>
          <button class="btn btn-primary" id="url-decode">デコード</button>
          <button class="btn btn-secondary" id="url-encode-component">encodeURIComponent</button>
          <button class="btn btn-secondary" id="url-decode-component">decodeURIComponent</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">出力</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="url-copy">コピー</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="url-output" readonly placeholder="結果がここに表示されます..."></textarea>
        </div>
      </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('url-input');
        const output = document.getElementById('url-output');

        document.getElementById('url-encode').addEventListener('click', () => {
            try { output.value = encodeURI(input.value); } catch (e) { output.value = 'エラー: ' + e.message; }
        });
        document.getElementById('url-decode').addEventListener('click', () => {
            try { output.value = decodeURI(input.value); } catch (e) { output.value = 'エラー: ' + e.message; }
        });
        document.getElementById('url-encode-component').addEventListener('click', () => {
            try { output.value = encodeURIComponent(input.value); } catch (e) { output.value = 'エラー: ' + e.message; }
        });
        document.getElementById('url-decode-component').addEventListener('click', () => {
            try { output.value = decodeURIComponent(input.value); } catch (e) { output.value = 'エラー: ' + e.message; }
        });
        document.getElementById('url-clear').addEventListener('click', () => {
            input.value = '';
            output.value = '';
        });
        document.getElementById('url-copy').addEventListener('click', () => {
            if (output.value) copyToClipboard(output.value);
        });
    }, 0);

    return widget;
}
