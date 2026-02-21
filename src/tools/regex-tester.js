export function renderRegexTester() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>Regex Tester</span>
      </div>
      <h1>Regex Tester</h1>
      <p>Test regular expressions against sample text with real-time match highlighting, capture groups, and flag support.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Pattern</span>
        </div>
        <div class="pane-body" style="display:flex;flex-direction:column;gap:12px;">
          <div class="regex-input-row">
            <span class="regex-slash">/</span>
            <input type="text" id="regex-pattern" placeholder="Enter regex pattern..." style="flex:1" />
            <span class="regex-slash">/</span>
            <input type="text" id="regex-flags" value="g" style="width:60px;text-align:center" placeholder="flags" />
          </div>
          <div class="regex-flags-help">
            <span class="regex-flag-tag" data-flag="g">g global</span>
            <span class="regex-flag-tag" data-flag="i">i case-insensitive</span>
            <span class="regex-flag-tag" data-flag="m">m multiline</span>
            <span class="regex-flag-tag" data-flag="s">s dotAll</span>
          </div>
          <label class="pane-title" style="margin-top:8px">Test String</label>
          <textarea id="regex-input" placeholder="Enter text to test against..." rows="8"></textarea>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Results</span>
        </div>
        <div class="pane-body">
          <div id="regex-error" class="regex-error" style="display:none"></div>
          <div id="regex-match-info" class="regex-match-info">No matches</div>
          <div id="regex-highlighted" class="regex-highlighted"></div>
          <div id="regex-groups" class="regex-groups"></div>
        </div>
      </div>
    </div>
    <div class="tool-info">
      <h2>Regular Expression Reference</h2>
      <p>Regular expressions (regex) are powerful patterns used to match, search, and manipulate text. They're an essential skill for developers working with text processing, form validation, and data extraction.</p>
      <h3>Common Patterns</h3>
      <ul>
        <li><code>.</code> — Matches any character (except newline by default)</li>
        <li><code>\\d</code> — Matches any digit (0-9)</li>
        <li><code>\\w</code> — Matches any word character (a-z, A-Z, 0-9, _)</li>
        <li><code>\\s</code> — Matches any whitespace character</li>
        <li><code>^</code> — Start of string (or line in multiline mode)</li>
        <li><code>$</code> — End of string (or line in multiline mode)</li>
        <li><code>[abc]</code> — Character class: matches a, b, or c</li>
        <li><code>(group)</code> — Capturing group</li>
        <li><code>a|b</code> — Alternation: matches a or b</li>
      </ul>
      <h3>Quantifiers</h3>
      <ul>
        <li><code>*</code> — Zero or more times</li>
        <li><code>+</code> — One or more times</li>
        <li><code>?</code> — Zero or one time</li>
        <li><code>{n}</code> — Exactly n times</li>
        <li><code>{n,m}</code> — Between n and m times</li>
      </ul>
      <h3>Flags</h3>
      <ul>
        <li><strong>g</strong> (global) — Find all matches, not just the first</li>
        <li><strong>i</strong> (case-insensitive) — Ignore case differences</li>
        <li><strong>m</strong> (multiline) — ^ and $ match start/end of each line</li>
        <li><strong>s</strong> (dotAll) — . matches newline characters too</li>
      </ul>
    </div>
  `;

    setTimeout(() => {
        const pattern = document.getElementById('regex-pattern');
        const flags = document.getElementById('regex-flags');
        const input = document.getElementById('regex-input');
        const errorDiv = document.getElementById('regex-error');
        const matchInfo = document.getElementById('regex-match-info');
        const highlighted = document.getElementById('regex-highlighted');
        const groupsDiv = document.getElementById('regex-groups');

        function escapeHtml(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function update() {
            const pat = pattern.value;
            const flg = flags.value;
            const text = input.value;

            errorDiv.style.display = 'none';
            groupsDiv.innerHTML = '';

            if (!pat || !text) {
                matchInfo.textContent = 'No matches';
                highlighted.innerHTML = '<span style="color:var(--color-text-dim)">Enter a pattern and text to see matches</span>';
                return;
            }

            try {
                const regex = new RegExp(pat, flg);
                let matches = [];
                let match;

                if (flg.includes('g')) {
                    while ((match = regex.exec(text)) !== null) {
                        matches.push({ index: match.index, length: match[0].length, groups: [...match] });
                        if (match[0].length === 0) regex.lastIndex++;
                    }
                } else {
                    match = regex.exec(text);
                    if (match) matches.push({ index: match.index, length: match[0].length, groups: [...match] });
                }

                matchInfo.textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '') + ' found';

                // Highlight matches
                let html = '';
                let lastIndex = 0;
                matches.forEach(m => {
                    html += escapeHtml(text.substring(lastIndex, m.index));
                    html += '<mark class="regex-match">' + escapeHtml(text.substring(m.index, m.index + m.length)) + '</mark>';
                    lastIndex = m.index + m.length;
                });
                html += escapeHtml(text.substring(lastIndex));
                highlighted.innerHTML = '<pre style="white-space:pre-wrap;word-break:break-all;margin:0;font-family:var(--font-mono);font-size:0.875rem;line-height:1.6">' + html + '</pre>';

                // Show groups
                if (matches.length > 0 && matches[0].groups.length > 1) {
                    let groupHtml = '<h4 style="margin-bottom:8px;color:var(--color-text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em">Capture Groups</h4>';
                    matches.forEach((m, i) => {
                        groupHtml += '<div class="regex-group-match">Match ' + (i + 1) + ': ';
                        m.groups.forEach((g, j) => {
                            if (j === 0) return;
                            groupHtml += '<span class="regex-group-tag">Group ' + j + ': ' + escapeHtml(g || '(empty)') + '</span> ';
                        });
                        groupHtml += '</div>';
                    });
                    groupsDiv.innerHTML = groupHtml;
                }
            } catch (e) {
                errorDiv.textContent = 'Invalid regex: ' + e.message;
                errorDiv.style.display = 'block';
                matchInfo.textContent = 'Error';
                highlighted.innerHTML = '';
            }
        }

        pattern.addEventListener('input', update);
        flags.addEventListener('input', update);
        input.addEventListener('input', update);

        // Flag tag clicks
        document.querySelectorAll('.regex-flag-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const flag = tag.dataset.flag;
                if (flags.value.includes(flag)) {
                    flags.value = flags.value.replace(flag, '');
                } else {
                    flags.value += flag;
                }
                update();
            });
        });
    }, 0);

    return page;
}
