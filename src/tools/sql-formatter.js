import { copyToClipboard } from '../main.js';

export function renderSqlFormatter() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="/">Home</a> <span>›</span> <span>SQL Formatter</span>
      </div>
      <h1>SQL Formatter</h1>
      <p>Beautify and format minified SQL queries for better readability.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Raw SQL</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="sql-clear">Clear</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="sql-input" class="tool-textarea" placeholder="SELECT * FROM users WHERE active = 1" style="height:300px;font-family:var(--font-mono);"></textarea>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Formatted SQL</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="sql-copy">📋 Copy</button>
          </div>
        </div>
        <div class="pane-body">
          <pre id="sql-output" class="code-output" style="height:300px;overflow-y:auto;"></pre>
        </div>
      </div>
    </div>
    <div class="tool-seo-content" style="margin-top: 3rem; padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); font-size: 1rem; line-height: 1.8; color: var(--text-secondary);">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary); font-weight: 700;">SQL Formatter & Beautifier</h2>
      <p style="margin-bottom: 1.5rem;">Database administrators and backend developers constantly interact with SQL queries. Often, queries extracted from application logs, ORMs, or legacy codebases are completely minified into a single, unreadable line.</p>
      <p style="margin-bottom: 1.5rem;">Our SQL Formatter takes raw, messy SQL and intelligently adds line breaks, capitalization, and indentation to reserved keywords (like SELECT, FROM, WHERE, JOIN) so you can easily understand the query structure at a glance.</p>
      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Safe & Private</h3>
      <p>All processing in this tool is done securely within your browser using client-side JavaScript. Your data is never sent to a server or stored in a database, ensuring complete privacy.</p>
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

    return page;
}
