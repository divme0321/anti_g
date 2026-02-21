export function renderDiffChecker() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>Diff Checker</span>
      </div>
      <h1>Diff Checker</h1>
      <p>Compare two blocks of text side by side and see the differences highlighted. Perfect for code reviews and document comparison.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Original Text</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="diff-sample">Sample</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="diff-left" placeholder="Paste original text here..."></textarea>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Modified Text</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="diff-clear">Clear All</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="diff-right" placeholder="Paste modified text here..."></textarea>
        </div>
      </div>
    </div>
    <div style="max-width:1200px;margin:16px auto;padding:0 32px;">
      <button class="btn btn-primary" id="diff-compare" style="width:100%;">Compare ↓</button>
    </div>
    <div class="tool-page" style="padding-top:0;">
      <div id="diff-result" class="diff-result"></div>
    </div>
    <div class="tool-info">
      <h2>About Diff Checking</h2>
      <p>A diff (short for "difference") shows the changes between two versions of a text. Lines that were removed are highlighted in red, and lines that were added are highlighted in green. Unchanged lines provide context.</p>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Code Review:</strong> Compare code changes before committing to version control.</li>
        <li><strong>Document Editing:</strong> See what changed between drafts of a document.</li>
        <li><strong>Configuration Comparison:</strong> Compare configuration files between environments.</li>
        <li><strong>Data Validation:</strong> Verify expected vs. actual output in testing.</li>
      </ul>
      <h3>How It Works</h3>
      <p>This tool uses a line-by-line comparison algorithm. Each line is compared between the original and modified text. Lines that exist only in the original are marked as removed (red), lines that exist only in the modified text are marked as added (green), and matching lines are shown as context.</p>
    </div>
  `;

    setTimeout(() => {
        const left = document.getElementById('diff-left');
        const right = document.getElementById('diff-right');
        const result = document.getElementById('diff-result');

        function computeDiff(a, b) {
            const linesA = a.split('\n');
            const linesB = b.split('\n');
            const maxLen = Math.max(linesA.length, linesB.length);
            const output = [];

            // Simple LCS-based diff
            const m = linesA.length;
            const n = linesB.length;
            const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    if (linesA[i - 1] === linesB[j - 1]) {
                        dp[i][j] = dp[i - 1][j - 1] + 1;
                    } else {
                        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    }
                }
            }

            // Backtrack
            let i = m, j = n;
            const diff = [];
            while (i > 0 || j > 0) {
                if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
                    diff.unshift({ type: 'same', line: linesA[i - 1], lineA: i, lineB: j });
                    i--; j--;
                } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                    diff.unshift({ type: 'add', line: linesB[j - 1], lineB: j });
                    j--;
                } else {
                    diff.unshift({ type: 'remove', line: linesA[i - 1], lineA: i });
                    i--;
                }
            }
            return diff;
        }

        function escapeHtml(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        document.getElementById('diff-compare').addEventListener('click', () => {
            const diff = computeDiff(left.value, right.value);
            let added = 0, removed = 0, unchanged = 0;

            let html = '<div class="diff-stats" id="diff-stats"></div>';
            html += '<div class="diff-table"><table>';

            diff.forEach(d => {
                const cls = d.type === 'add' ? 'diff-added' : d.type === 'remove' ? 'diff-removed' : '';
                const prefix = d.type === 'add' ? '+' : d.type === 'remove' ? '-' : ' ';
                const lineNum = d.type === 'remove' ? (d.lineA || '') : d.type === 'add' ? '' : (d.lineA || '');
                const lineNum2 = d.type === 'add' ? (d.lineB || '') : d.type === 'remove' ? '' : (d.lineB || '');

                if (d.type === 'add') added++;
                else if (d.type === 'remove') removed++;
                else unchanged++;

                html += `<tr class="${cls}">
          <td class="diff-line-num">${lineNum}</td>
          <td class="diff-line-num">${lineNum2}</td>
          <td class="diff-prefix">${prefix}</td>
          <td class="diff-content">${escapeHtml(d.line)}</td>
        </tr>`;
            });

            html += '</table></div>';
            result.innerHTML = html;

            document.getElementById('diff-stats').innerHTML = `
        <span class="diff-stat-added">+${added} added</span>
        <span class="diff-stat-removed">-${removed} removed</span>
        <span class="diff-stat-unchanged">${unchanged} unchanged</span>
      `;
        });

        document.getElementById('diff-sample').addEventListener('click', () => {
            left.value = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const result = greet("World");`;

            right.value = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return { success: true, message: greeting };
}

const result = greet("World", "Hi");
console.log(result);`;
        });

        document.getElementById('diff-clear').addEventListener('click', () => {
            left.value = '';
            right.value = '';
            result.innerHTML = '';
        });
    }, 0);

    return page;
}
