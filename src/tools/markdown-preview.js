import { copyToClipboard } from '../utils.js';
import { parseMarkdown } from './markdown-renderer.js';

const SAMPLE_MARKDOWN = `# Welcome to Markdown Preview

This is a **real-time** Markdown editor with *instant* preview.

## Features

- **Bold** and *italic* text
- \`Inline code\` formatting
- [Links](https://example.com) support
- Code blocks

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("DevToolBox"));
\`\`\`

> "The best tools are the ones that get out of your way."

---

Built with ♥ by **DevToolBox**
`;

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container markdown-tool';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Markdown</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="md-clear">クリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="md-input" aria-label="Markdown入力" aria-describedby="md-safety-note" placeholder="ここにMarkdownを入力してください...">${SAMPLE_MARKDOWN}</textarea>
          <p id="md-safety-note">生HTMLは文字として表示し、画像は自動で読み込みません。リンクを開くと移動先へ通信します。</p>
        </div>
        <div class="tool-actions">
          <button class="btn btn-secondary" id="md-copy-md">📋 MDをコピー</button>
          <button class="btn btn-secondary" id="md-copy-html">📋 HTMLをコピー</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">プレビュー</span>
        </div>
        <div class="pane-body">
          <div class="markdown-preview" id="md-preview" role="region" aria-label="Markdownプレビュー"></div>
        </div>
        <div class="status-bar">
          <span class="status-dot"></span>
          <span id="md-status" role="status">0 単語</span>
        </div>
      </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('md-input');
        const preview = document.getElementById('md-preview');
        const status = document.getElementById('md-status');

        function update() {
            const md = input.value;
            preview.innerHTML = parseMarkdown(md);
            const wordCount = md.trim() ? md.trim().split(/\s+/).length : 0;
            status.textContent = `${wordCount} 単語 · ${md.length} 文字`;
        }

        input.addEventListener('input', update);

        document.getElementById('md-clear').addEventListener('click', () => {
            input.value = '';
            update();
        });

        document.getElementById('md-copy-md').addEventListener('click', () => {
            copyToClipboard(input.value);
        });

        document.getElementById('md-copy-html').addEventListener('click', () => {
            copyToClipboard(parseMarkdown(input.value));
        });

        update();
    }, 0);

    return widget;
}
