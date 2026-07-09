export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">パターン</span>
        </div>
        <div class="pane-body" style="display:flex;flex-direction:column;gap:12px;">
          <div class="regex-input-row">
            <span class="regex-slash">/</span>
            <input type="text" id="regex-pattern" placeholder="正規表現パターンを入力..." style="flex:1" />
            <span class="regex-slash">/</span>
            <input type="text" id="regex-flags" value="g" style="width:60px;text-align:center" placeholder="フラグ" />
          </div>
          <div class="regex-flags-help">
            <span class="regex-flag-tag" data-flag="g">g グローバル</span>
            <span class="regex-flag-tag" data-flag="i">i 大文字小文字を無視</span>
            <span class="regex-flag-tag" data-flag="m">m 複数行</span>
            <span class="regex-flag-tag" data-flag="s">s dotAll</span>
          </div>
          <label class="pane-title" style="margin-top:8px">テスト文字列</label>
          <textarea id="regex-input" placeholder="テスト対象のテキストを入力..." rows="8"></textarea>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">結果</span>
        </div>
        <div class="pane-body">
          <div id="regex-error" class="regex-error" style="display:none"></div>
          <div id="regex-match-info" class="regex-match-info">マッチなし</div>
          <div id="regex-highlighted" class="regex-highlighted"></div>
          <div id="regex-groups" class="regex-groups"></div>
        </div>
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
                matchInfo.textContent = 'マッチなし';
                highlighted.innerHTML = '<span style="color:var(--color-text-dim)">パターンとテキストを入力するとマッチ結果が表示されます</span>';
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

                matchInfo.textContent = matches.length + ' 件のマッチが見つかりました';

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
                    let groupHtml = '<h4 style="margin-bottom:8px;color:var(--color-text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em">キャプチャグループ</h4>';
                    matches.forEach((m, i) => {
                        groupHtml += '<div class="regex-group-match">マッチ ' + (i + 1) + ': ';
                        m.groups.forEach((g, j) => {
                            if (j === 0) return;
                            groupHtml += '<span class="regex-group-tag">グループ ' + j + ': ' + escapeHtml(g || '(空)') + '</span> ';
                        });
                        groupHtml += '</div>';
                    });
                    groupsDiv.innerHTML = groupHtml;
                }
            } catch (e) {
                errorDiv.textContent = '無効な正規表現: ' + e.message;
                errorDiv.style.display = 'block';
                matchInfo.textContent = 'エラー';
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

    return widget;
}
