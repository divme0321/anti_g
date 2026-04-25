import { copyToClipboard } from '../main.js';

export function renderBase64() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="/">Home</a> <span>/</span> <span>Base64</span>
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
    <div class="tool-seo-content" style="margin-top: 3rem; padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); font-size: 1rem; line-height: 1.8; color: var(--text-secondary);">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary); font-weight: 700;">Understanding Base64 Encoding & Decoding</h2>
      
      <p style="margin-bottom: 1.5rem;">Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It is most commonly used when there is a need to encode binary data that needs to be stored and transferred over media that are designed to deal with textual data. This ensures that the data remains intact without modification during transport.</p>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">How Base64 Works</h3>
      <p style="margin-bottom: 1.5rem;">The term "Base64" comes from the fact that the encoding uses a set of 64 unique characters to represent data. These include uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), and the symbols '+' and '/'. The '=' character is used as padding at the end of the encoded string to ensure the length is a multiple of 4.</p>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Common Applications in Web Development</h3>
      <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
        <li><strong>Data URIs:</strong> Embedding small images (like icons or logos) directly into HTML or CSS files to reduce HTTP requests.</li>
        <li><strong>Basic Authentication:</strong> Encoding credentials (username and password) for use in HTTP headers.</li>
        <li><strong>Email Attachments:</strong> Using MIME (Multipurpose Internet Mail Extensions) to send binary files over SMTP.</li>
        <li><strong>JWT (JSON Web Tokens):</strong> Encoding the header and payload sections of a token for secure transmission.</li>
      </ul>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Safe & Private Processing</h3>
      <p>Security is paramount when handling data. Many developers use Base64 to encode sensitive strings or configuration snippets. Our tool performs all encoding and decoding locally in your browser. This means your data is never uploaded to a server, keeping your information safe from third-party interception.</p>
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
