export function renderWordCounter() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>Word Counter</span>
      </div>
      <h1>Word Counter & Text Analyzer</h1>
      <p>Count words, characters, sentences, and paragraphs. Estimate reading time and analyze text statistics in real time.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Input Text</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="wc-clear">Clear</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="wc-input" placeholder="Start typing or paste your text here..."></textarea>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Statistics</span>
        </div>
        <div class="pane-body">
          <div class="wc-stats-grid" id="wc-stats">
            <div class="wc-stat"><div class="wc-stat-value" id="wc-words">0</div><div class="wc-stat-label">Words</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-chars">0</div><div class="wc-stat-label">Characters</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-chars-no-space">0</div><div class="wc-stat-label">Characters (no spaces)</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-sentences">0</div><div class="wc-stat-label">Sentences</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-paragraphs">0</div><div class="wc-stat-label">Paragraphs</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-lines">0</div><div class="wc-stat-label">Lines</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-reading">0 min</div><div class="wc-stat-label">Reading Time</div></div>
            <div class="wc-stat"><div class="wc-stat-value" id="wc-speaking">0 min</div><div class="wc-stat-label">Speaking Time</div></div>
          </div>
          <div class="wc-top-words" id="wc-top-words"></div>
        </div>
      </div>
    </div>
    <div class="tool-info">
      <h2>About Word Counter</h2>
      <p>This tool provides a comprehensive analysis of your text, helping writers, students, and content creators track their writing progress and optimize content length.</p>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Content Writing:</strong> Ensure blog posts, articles, and social media posts meet target word counts.</li>
        <li><strong>SEO Optimization:</strong> Search engines often favor content of certain lengths. Track your word count for optimal SEO.</li>
        <li><strong>Academic Writing:</strong> Stay within essay and paper word limits set by professors.</li>
        <li><strong>Speech Preparation:</strong> Estimate speaking time using the average speaking pace of ~150 words per minute.</li>
        <li><strong>Character Limits:</strong> Check character counts for tweets (280 chars), meta descriptions (155 chars), and titles (60 chars).</li>
      </ul>
      <h3>How Reading Time is Calculated</h3>
      <p>Average reading speed is approximately 200-250 words per minute. We use 225 wpm as the baseline. Speaking time uses 150 wpm, which is the average pace for presentations.</p>
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
            document.getElementById('wc-reading').textContent = words ? readTime + ' min' : '0 min';
            document.getElementById('wc-speaking').textContent = words ? speakTime + ' min' : '0 min';

            // Top words
            if (words > 0) {
                const wordFreq = {};
                text.toLowerCase().match(/\b[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]{2,}\b/g)?.forEach(w => {
                    wordFreq[w] = (wordFreq[w] || 0) + 1;
                });
                const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);
                if (sorted.length > 0) {
                    document.getElementById('wc-top-words').innerHTML = '<h4 style="margin-bottom:8px;color:var(--color-text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em">Top Words</h4>' +
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

    return page;
}
