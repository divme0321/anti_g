export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-widget';
    widget.innerHTML = `
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">元のテキスト</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="diff-sample">サンプル</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="diff-left" placeholder="元のテキストをここに貼り付けてください..."></textarea>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">変更後のテキスト</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="diff-clear">すべてクリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="diff-right" placeholder="変更後のテキストをここに貼り付けてください..."></textarea>
        </div>
      </div>
    </div>
    <div style="max-width:1200px;margin:16px auto;padding:0 32px;">
      <button class="btn btn-primary" id="diff-compare" style="width:100%;">比較 ↓</button>
    </div>
    <div class="tool-page" style="padding-top:0;">
      <div id="diff-result" class="diff-result"></div>
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
        <span class="diff-stat-added">+${added} 追加</span>
        <span class="diff-stat-removed">-${removed} 削除</span>
        <span class="diff-stat-unchanged">${unchanged} 変更なし</span>
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

    return widget;
}
