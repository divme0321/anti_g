export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">入力テキスト</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="wc-clear">クリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="wc-input" placeholder="ここにテキストを入力または貼り付け..."></textarea>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">統計</span>
        </div>
        <div class="pane-body">
          <div class="wc-stats-grid" id="wc-stats">
            <div class="wc-stat"><div class="wc-stat-value" id="wc-words">0</div><div class="wc-stat-label">単語数</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-chars">0</div><div class="wc-stat-label">文字数</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-chars-no-space">0</div><div class="wc-stat-label">文字数（空白除く）</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-sentences">0</div><div class="wc-stat-label">文の数</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-paragraphs">0</div><div class="wc-stat-label">段落数</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-lines">0</div><div class="wc-stat-label">行数</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-reading">0 分</div><div class="wc-stat-label">読了時間</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-speaking">0 分</div><div class="wc-stat-label">発話時間</div></div>
          </div>
          <div class="wc-top-words" id="wc-top-words"></div>
        </div>
      </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('wc-input');

        function analyze() {
            const text = input.value;

            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const chars = text.length;
            const charsNoSpace = text.replace(/\s/g, '').length;
            const sentences = text.trim() ? (text.match(/[.!?]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0) : 0;
            const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
            const lines = text ? text.split('\n').length : 0;
            const readTime = Math.max(1, Math.ceil(words / 225));
            const speakTime = Math.max(1, Math.ceil(words / 150));

            document.getElementById('wc-words').textContent = words.toLocaleString();
            document.getElementById('wc-chars').textContent = chars.toLocaleString();
            document.getElementById('wc-chars-no-space').textContent = charsNoSpace.toLocaleString();
            document.getElementById('wc-sentences').textContent = sentences.toLocaleString();
            document.getElementById('wc-paragraphs').textContent = paragraphs.toLocaleString();
            document.getElementById('wc-lines').textContent = lines.toLocaleString();
            document.getElementById('wc-reading').textContent = words ? readTime + ' 分' : '0 分';
            document.getElementById('wc-speaking').textContent = words ? speakTime + ' 分' : '0 分';

            // Top words
            if (words > 0) {
                const wordFreq = {};
                text.toLowerCase().match(/\b[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]{2,}\b/g)?.forEach(w => {
                    wordFreq[w] = (wordFreq[w] || 0) + 1;
                });
                const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);
                if (sorted.length > 0) {
                    document.getElementById('wc-top-words').innerHTML = '<h4 style="margin-bottom:8px;color:var(--color-text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em">頻出単語</h4>' +
                        sorted.map(([word, count]) => `<span class="wc-word-tag">${word} <strong>${count}</strong></span>`).join(' ');
                }
            } else {
                document.getElementById('wc-top-words').innerHTML = '';
            }
        }

        input.addEventListener('input', analyze);
        document.getElementById('wc-clear').addEventListener('click', () => {
            input.value = '';
            analyze();
        });
    }, 0);

    return widget;
}
