import { copyToClipboard } from '../main.js';

export function renderUrlEncoder() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>URL Encoder / Decoder</span>
      </div>
      <h1>URL Encoder / Decoder</h1>
      <p>Encode special characters for safe URL usage, or decode URL-encoded strings back to readable text.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Input</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="url-clear">Clear</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="url-input" placeholder="Enter text or URL to encode/decode..."></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="url-encode">Encode</button>
          <button class="btn btn-primary" id="url-decode">Decode</button>
          <button class="btn btn-secondary" id="url-encode-component">encodeURIComponent</button>
          <button class="btn btn-secondary" id="url-decode-component">decodeURIComponent</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Output</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="url-copy">Copy</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="url-output" readonly placeholder="Result will appear here..."></textarea>
        </div>
      </div>
    </div>
    <div class="tool-info">
      <h2>About URL Encoding</h2>
      <p>URL encoding (also known as percent-encoding) replaces special characters in URLs with a "%" followed by two hexadecimal digits. This is necessary because URLs can only contain a limited set of characters from the ASCII character set.</p>
      <h3>When to Use URL Encoding</h3>
      <ul>
        <li><strong>Query Parameters:</strong> When passing data through URL query strings, special characters like spaces, &, =, etc. must be encoded.</li>
        <li><strong>File Paths:</strong> URLs containing spaces or non-ASCII characters need encoding.</li>
        <li><strong>API Requests:</strong> When constructing API URLs programmatically, all user-provided values should be URL-encoded.</li>
        <li><strong>Form Submissions:</strong> HTML forms use URL encoding (application/x-www-form-urlencoded) by default.</li>
      </ul>
      <h3>encodeURI vs encodeURIComponent</h3>
      <ul>
        <li><strong>encodeURI:</strong> Encodes a complete URI. Does NOT encode characters that have special meaning in a URI (like :, /, ?, #, &, =).</li>
        <li><strong>encodeURIComponent:</strong> Encodes a URI component (like a query parameter value). Encodes ALL special characters including :, /, ?, #, etc.</li>
      </ul>
      <p>Use <code>encodeURIComponent</code> when encoding individual values, and <code>encodeURI</code> when encoding a full URL that should remain navigable.</p>
    </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('url-input');
        const output = document.getElementById('url-output');

        document.getElementById('url-encode').addEventListener('click', () => {
            try { output.value = encodeURI(input.value); } catch (e) { output.value = 'Error: ' + e.message; }
        });
        document.getElementById('url-decode').addEventListener('click', () => {
            try { output.value = decodeURI(input.value); } catch (e) { output.value = 'Error: ' + e.message; }
        });
        document.getElementById('url-encode-component').addEventListener('click', () => {
            try { output.value = encodeURIComponent(input.value); } catch (e) { output.value = 'Error: ' + e.message; }
        });
        document.getElementById('url-decode-component').addEventListener('click', () => {
            try { output.value = decodeURIComponent(input.value); } catch (e) { output.value = 'Error: ' + e.message; }
        });
        document.getElementById('url-clear').addEventListener('click', () => {
            input.value = '';
            output.value = '';
        });
        document.getElementById('url-copy').addEventListener('click', () => {
            if (output.value) copyToClipboard(output.value);
        });
    }, 0);

    return page;
}
