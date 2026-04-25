import { copyToClipboard, showToast } from '../main.js';

export function renderJsonFormatter() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="/">Home</a> <span>/</span> <span>JSON Formatter</span>
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
    <div class="tool-seo-content" style="margin-top: 3rem; padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); font-size: 1rem; line-height: 1.8; color: var(--text-secondary);">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary); font-weight: 700;">Deep Dive: JSON Formatter & Validator</h2>
      
      <p style="margin-bottom: 1.5rem;">JSON (JavaScript Object Notation) has become the de facto standard for data exchange on the modern web. Whether you are working with REST APIs, configuration files like <code>package.json</code>, or NoSQL databases like MongoDB, you inevitably encounter minified or poorly formatted JSON that is impossible for humans to read. Our <strong>JSON Formatter & Validator</strong> is designed to solve this by providing instant, readable structure to your raw data.</p>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Key Features of our Tool</h3>
      <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
        <li><strong>Prettify & Beautify:</strong> Converts one-line, minified JSON into a clean, indented tree structure.</li>
        <li><strong>Strict Validation:</strong> Our validator follows the RFC 8259 specification, catching missing quotes, trailing commas, and mismatched brackets.</li>
        <li><strong>Minification:</strong> Need to save bandwidth? Use the minify feature to strip all unnecessary whitespace.</li>
        <li><strong>Offline Security:</strong> Unlike other online formatters, your data never leaves your browser. All parsing is done via client-side JavaScript.</li>
      </ul>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Why Validation Matters</h3>
      <p style="margin-bottom: 1.5rem;">A single misplaced comma in a <code>config.json</code> file can crash a production server or break a deployment pipeline. Validating your JSON before use is a critical step in the development lifecycle. This tool provides clear error messages and points you exactly to where the syntax error is located, saving hours of debugging time.</p>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Common Use Cases</h3>
      <p>Developers use our JSON tools for debugging API responses, cleaning up logs, formatting complex nested objects for documentation, and preparing configuration files for deployment. It's a lightweight, high-performance alternative to opening a heavy IDE just for a quick format check.</p>
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
