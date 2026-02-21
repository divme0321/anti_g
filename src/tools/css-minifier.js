import { copyToClipboard } from '../main.js';

export function renderCssMinifier() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>CSS Minifier / Beautifier</span>
      </div>
      <h1>CSS Minifier / Beautifier</h1>
      <p>Minify CSS to reduce file size for production, or beautify minified CSS for readability. Helps improve page load performance.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Input CSS</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="css-sample">Sample</button>
            <button class="btn btn-secondary" id="css-clear">Clear</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="css-input" placeholder="Paste your CSS here..."></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="css-minify">Minify →</button>
          <button class="btn btn-primary" id="css-beautify">Beautify →</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Output</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="css-copy">Copy</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="css-output" readonly placeholder="Result will appear here..."></textarea>
        </div>
        <div class="status-bar">
          <span id="css-stats"></span>
        </div>
      </div>
    </div>
    <div class="tool-info">
      <h2>Why Minify CSS?</h2>
      <p>CSS minification removes unnecessary characters (whitespace, comments, semicolons) from CSS code without changing its functionality. This results in smaller file sizes, which leads to faster page load times.</p>
      <h3>Benefits of Minification</h3>
      <ul>
        <li><strong>Faster Load Times:</strong> Smaller files download faster, especially on mobile networks.</li>
        <li><strong>Reduced Bandwidth:</strong> Less data transferred means lower hosting costs and better performance.</li>
        <li><strong>Better Performance Scores:</strong> Tools like Google PageSpeed Insights recommend minified CSS.</li>
        <li><strong>Production Best Practice:</strong> Modern build tools automatically minify CSS for production.</li>
      </ul>
      <h3>What Gets Removed</h3>
      <ul>
        <li>Comments (<code>/* ... */</code>)</li>
        <li>Unnecessary whitespace and line breaks</li>
        <li>Trailing semicolons before closing braces</li>
        <li>Extra spaces around selectors, properties, and values</li>
      </ul>
    </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('css-input');
        const output = document.getElementById('css-output');
        const stats = document.getElementById('css-stats');

        function minifyCSS(css) {
            return css
                .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove comments
                .replace(/\s+/g, ' ')               // Collapse whitespace
                .replace(/\s*([{}:;,>~+])\s*/g, '$1') // Remove spaces around special chars
                .replace(/;\}/g, '}')               // Remove trailing semicolons
                .replace(/^\s+|\s+$/g, '');          // Trim
        }

        function beautifyCSS(css) {
            let result = '';
            let indent = 0;
            const chars = css.replace(/\/\*[\s\S]*?\*\//g, '').trim();
            let i = 0;

            while (i < chars.length) {
                const ch = chars[i];
                if (ch === '{') {
                    result += ' {\n' + '  '.repeat(indent + 1);
                    indent++;
                    i++;
                } else if (ch === '}') {
                    indent = Math.max(0, indent - 1);
                    result = result.trimEnd() + '\n' + '  '.repeat(indent) + '}\n' + '  '.repeat(indent);
                    i++;
                } else if (ch === ';') {
                    result += ';\n' + '  '.repeat(indent);
                    i++;
                } else if (ch === ':' && !chars.substring(i).match(/^:[:a-z]/)) {
                    result += ': ';
                    i++;
                } else {
                    result += ch;
                    i++;
                }
            }
            return result.replace(/\n\s*\n/g, '\n').trim();
        }

        function updateStats() {
            const original = input.value.length;
            const result = output.value.length;
            if (original > 0 && result > 0) {
                const savings = ((1 - result / original) * 100).toFixed(1);
                stats.textContent = `Original: ${original} chars → Output: ${result} chars (${savings > 0 ? savings + '% smaller' : Math.abs(savings) + '% larger'})`;
            } else {
                stats.textContent = '';
            }
        }

        document.getElementById('css-minify').addEventListener('click', () => {
            output.value = minifyCSS(input.value);
            updateStats();
        });

        document.getElementById('css-beautify').addEventListener('click', () => {
            output.value = beautifyCSS(input.value);
            updateStats();
        });

        document.getElementById('css-sample').addEventListener('click', () => {
            input.value = `/* Main Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Styles */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 12px;
  }
  .header-inner {
    flex-direction: column;
    gap: 8px;
  }
}`;
        });

        document.getElementById('css-clear').addEventListener('click', () => {
            input.value = '';
            output.value = '';
            stats.textContent = '';
        });

        document.getElementById('css-copy').addEventListener('click', () => {
            if (output.value) copyToClipboard(output.value);
        });
    }, 0);

    return page;
}
