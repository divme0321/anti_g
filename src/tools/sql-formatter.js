import { copyToClipboard } from '../utils.js';

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">元のSQL</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="sql-clear">クリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="sql-input" class="tool-textarea" placeholder="SELECT * FROM users WHERE active = 1" style="height:300px;font-family:var(--font-mono);"></textarea>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">整形後のSQL</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="sql-copy">📋 コピー</button>
          </div>
        </div>
        <div class="pane-body">
          <pre id="sql-output" class="code-output" style="height:300px;overflow-y:auto;"></pre>
        </div>
      </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('sql-input');
        const output = document.getElementById('sql-output');

        function formatSql(sql) {
            if (!sql) return '';

            const keywords = [
                'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
                'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
                'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'JOIN',
                'HAVING', 'OFFSET', 'UNION', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE'
            ];

            let formatted = sql.replace(/\s+/g, ' ');

            keywords.forEach(kw => {
                const regex = new RegExp(`\\b${kw}\\b`, 'gi');
                formatted = formatted.replace(regex, `\n${kw.toUpperCase()}\n  `);
            });

            // Clean up multiple newlines
            formatted = formatted.replace(/\n\s*\n/g, '\n').trim();

            // Add slight indentation for AND/OR
            formatted = formatted.replace(/\n\s+(AND|OR)/g, '\n    $1');

            return formatted;
        }

        input.addEventListener('input', () => {
            output.textContent = formatSql(input.value);
        });

        document.getElementById('sql-clear').addEventListener('click', () => {
            input.value = '';
            output.textContent = '';
        });

        document.getElementById('sql-copy').addEventListener('click', () => {
            copyToClipboard(output.textContent);
        });
    }, 0);

    return widget;
}
