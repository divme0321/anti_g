import { copyToClipboard, showToast } from '../main.js';

export function renderJsonFormatter() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>/</span> <span>JSON Formatter</span>
      </div>
      <h1>JSON Formatter & Validator</h1>
      <p>Paste your JSON to format, validate, or minify it instantly.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Input</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="json-sample">Sample</button>
            <button class="btn btn-secondary" id="json-clear">Clear</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="json-input" placeholder='Paste your JSON here...\n\n{"example": "value"}'></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="json-format">✦ Format</button>
          <button class="btn btn-secondary" id="json-minify">Minify</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Output</span>
          <div class="pane-actions">
            <button class="btn-icon" id="json-copy" title="Copy">📋</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="json-output" readonly placeholder="Formatted JSON will appear here..."></textarea>
        </div>
        <div class="status-bar">
          <span class="status-dot" id="json-status-dot"></span>
          <span id="json-status">Ready</span>
        </div>
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
                setStatus(`Valid JSON — ${Object.keys(parsed).length} top-level keys`);
            } catch (e) {
                output.value = '';
                setStatus(`Error: ${e.message}`, true);
                showToast(e.message, 'error');
            }
        });

        document.getElementById('json-minify').addEventListener('click', () => {
            try {
                const parsed = JSON.parse(input.value);
                output.value = JSON.stringify(parsed);
                setStatus(`Minified — ${output.value.length} characters`);
            } catch (e) {
                setStatus(`Error: ${e.message}`, true);
                showToast(e.message, 'error');
            }
        });

        document.getElementById('json-copy').addEventListener('click', () => {
            if (output.value) copyToClipboard(output.value);
        });

        document.getElementById('json-clear').addEventListener('click', () => {
            input.value = '';
            output.value = '';
            setStatus('Ready');
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

    return page;
}
