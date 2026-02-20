import { copyToClipboard } from '../main.js';

export function renderBase64() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>/</span> <span>Base64</span>
      </div>
      <h1>Base64 Encoder / Decoder</h1>
      <p>Encode text to Base64 or decode Base64 strings instantly.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Text / Input</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="b64-clear">Clear</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="b64-input" placeholder="Enter text to encode, or Base64 to decode..."></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="b64-encode">Encode →</button>
          <button class="btn btn-primary" id="b64-decode">← Decode</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Result</span>
          <div class="pane-actions">
            <button class="btn-icon" id="b64-copy" title="Copy">📋</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="b64-output" readonly placeholder="Result will appear here..."></textarea>
        </div>
        <div class="status-bar">
          <span class="status-dot" id="b64-status-dot"></span>
          <span id="b64-status">Ready</span>
        </div>
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
                const encoded = btoa(unescape(encodeURIComponent(input.value)));
                output.value = encoded;
                status.textContent = `Encoded — ${encoded.length} characters`;
                statusDot.className = 'status-dot';
            } catch (e) {
                status.textContent = `Error: ${e.message}`;
                statusDot.className = 'status-dot error';
            }
        });

        document.getElementById('b64-decode').addEventListener('click', () => {
            try {
                const decoded = decodeURIComponent(escape(atob(input.value.trim())));
                output.value = decoded;
                status.textContent = `Decoded — ${decoded.length} characters`;
                statusDot.className = 'status-dot';
            } catch (e) {
                status.textContent = 'Error: Invalid Base64 string';
                statusDot.className = 'status-dot error';
            }
        });

        document.getElementById('b64-copy').addEventListener('click', () => {
            if (output.value) copyToClipboard(output.value);
        });

        document.getElementById('b64-clear').addEventListener('click', () => {
            input.value = '';
            output.value = '';
            status.textContent = 'Ready';
            statusDot.className = 'status-dot';
        });
    }, 0);

    return page;
}
