import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import { copyToClipboard, showToast } from '../utils.js';

// サンプル用のYAML（アプリ設定風。ネストしたオブジェクトと配列を含む）
const SAMPLE_YAML = `# アプリケーション設定サンプル
app:
  name: devtoolbox
  version: 1.0.0
  debug: false
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data
tags:
  - frontend
  - backend
  - devtools
`;

// インタラクティブなツール部分のみを描画する（ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">YAML</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="yj-sample">サンプル</button>
          <button class="btn btn-secondary" id="yj-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="yj-yaml" placeholder="ここにYAMLを貼り付けてください...&#10;&#10;name: DevToolBox&#10;version: 1.0.0"></textarea>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="yj-to-json">YAML→JSON →</button>
        <button class="btn btn-primary" id="yj-to-yaml">← JSON→YAML</button>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">JSON</span>
        <div class="pane-actions">
          <button class="btn-icon" id="yj-copy" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="yj-json" placeholder='ここにJSONを貼り付けてください...&#10;&#10;{"name": "DevToolBox", "version": "1.0.0"}'></textarea>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="yj-status-dot"></span>
        <span id="yj-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const yamlEl = document.getElementById('yj-yaml');
    const jsonEl = document.getElementById('yj-json');
    const status = document.getElementById('yj-status');
    const statusDot = document.getElementById('yj-status-dot');

    function setStatus(msg, isError = false) {
      status.textContent = msg;
      statusDot.className = isError ? 'status-dot error' : 'status-dot';
    }

    document.getElementById('yj-to-json').addEventListener('click', () => {
      try {
        const obj = yamlLoad(yamlEl.value);
        jsonEl.value = JSON.stringify(obj, null, 2);
        setStatus('YAML→JSON 変換完了');
      } catch (e) {
        setStatus(`エラー: ${e.message}`, true);
        showToast(e.message, 'error');
      }
    });

    document.getElementById('yj-to-yaml').addEventListener('click', () => {
      try {
        const obj = JSON.parse(jsonEl.value);
        yamlEl.value = yamlDump(obj);
        setStatus('JSON→YAML 変換完了');
      } catch (e) {
        setStatus(`エラー: ${e.message}`, true);
        showToast(e.message, 'error');
      }
    });

    document.getElementById('yj-copy').addEventListener('click', () => {
      if (jsonEl.value) copyToClipboard(jsonEl.value);
    });

    document.getElementById('yj-clear').addEventListener('click', () => {
      yamlEl.value = '';
      jsonEl.value = '';
      setStatus('準備完了');
    });

    document.getElementById('yj-sample').addEventListener('click', () => {
      yamlEl.value = SAMPLE_YAML;
      jsonEl.value = '';
      setStatus('サンプルを読み込みました');
    });
  }, 0);

  return widget;
}
