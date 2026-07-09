import { copyToClipboard } from '../utils.js';

// Simple markdown parser (no external dependencies)
function parseMarkdown(md) {
    let html = md
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Headings
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;"/>')
        // Blockquote
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // HR
        .replace(/^---$/gm, '<hr/>')
        // Unordered list
        .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
        // Paragraphs (skip if already wrapped)
        .replace(/^(?!<[a-z])((?!<\/)[^\n]+)$/gm, '<p>$1</p>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>[\s\S]*?<\/li>(\n)?)+/g, (match) => `<ul>${match}</ul>`);

    return html;
}

const SAMPLE_MARKDOWN = `# Welcome to Markdown Preview

This is a **real-time** Markdown editor with *instant* preview.

## Features

- **Bold** and *italic* text
- \`Inline code\` formatting
- [Links](https://example.com) support
- Code blocks with syntax highlighting

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
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Markdown</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="md-clear">クリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="md-input" placeholder="ここにMarkdownを入力してください...">${SAMPLE_MARKDOWN}</textarea>
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
          <div class="markdown-preview" id="md-preview"></div>
        </div>
        <div class="status-bar">
          <span class="status-dot"></span>
          <span id="md-status">0 単語</span>
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
