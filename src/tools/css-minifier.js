import { copyToClipboard } from '../utils.js';

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">入力CSS</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="css-sample">サンプル</button>
            <button class="btn btn-secondary" id="css-clear">クリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="css-input" placeholder="ここにCSSを貼り付けてください..."></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="css-minify">Minify（圧縮） →</button>
          <button class="btn btn-primary" id="css-beautify">整形 →</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">出力</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="css-copy">コピー</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="css-output" readonly placeholder="結果がここに表示されます..."></textarea>
        </div>
        <div class="status-bar">
          <span id="css-stats"></span>
        </div>
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
                stats.textContent = `元: ${original} 文字 → 出力: ${result} 文字 (${savings > 0 ? savings + '% 削減' : Math.abs(savings) + '% 増加'})`;
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

    return widget;
}
