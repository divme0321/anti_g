import { copyToClipboard } from '../utils.js';

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';

    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">ページ情報</span>
        </div>
        <div class="pane-body">
          <div class="qr-settings">
            <div class="qr-form-group">
              <label for="meta-title">ページタイトル <span class="meta-counter" id="meta-title-count">0/60</span></label>
              <input type="text" id="meta-title" placeholder="すばらしいページ" maxlength="70" />
            </div>
            <div class="qr-form-group">
              <label for="meta-desc">説明文 <span class="meta-counter" id="meta-desc-count">0/160</span></label>
              <textarea id="meta-desc" rows="3" placeholder="ページ内容の簡単な説明..." maxlength="200"></textarea>
            </div>
            <div class="qr-form-group">
              <label for="meta-url">URL</label>
              <input type="text" id="meta-url" placeholder="https://example.com/page" />
            </div>
            <div class="qr-form-group">
              <label for="meta-image">画像URL（SNSシェア用）</label>
              <input type="text" id="meta-image" placeholder="https://example.com/image.jpg" />
            </div>
            <div class="qr-form-group">
              <label for="meta-keywords">キーワード（カンマ区切り）</label>
              <input type="text" id="meta-keywords" placeholder="キーワード1, キーワード2, キーワード3" />
            </div>
            <div class="qr-form-group">
              <label for="meta-author">作成者</label>
              <input type="text" id="meta-author" placeholder="山田 太郎" />
            </div>

            <div class="qr-options-row">
              <div class="qr-form-group">
                <label for="meta-robots">Robots</label>
                <select id="meta-robots">
                  <option value="index, follow">Index, Follow</option>
                  <option value="noindex, follow">Noindex, Follow</option>
                  <option value="index, nofollow">Index, Nofollow</option>
                  <option value="noindex, nofollow">Noindex, Nofollow</option>
                </select>
              </div>
              <div class="qr-form-group">
                <label for="meta-og-type">OG Type</label>
                <select id="meta-og-type">
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                  <option value="profile">Profile</option>
                </select>
              </div>
            </div>

            <div class="qr-form-group">
              <label for="meta-twitter-handle">Twitterハンドル</label>
              <input type="text" id="meta-twitter-handle" placeholder="@yourhandle" />
            </div>
          </div>
        </div>
      </div>

      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">プレビューとコード</span>
          <div class="pane-actions">
            <button class="btn btn-primary" id="meta-copy">📋 HTMLをコピー</button>
          </div>
        </div>
        <div class="pane-body">
          <div class="meta-previews">
            <div class="qr-form-group">
              <label>Google検索プレビュー</label>
              <div class="meta-google-preview" id="meta-google-preview">
                <div class="meta-gp-url">example.com</div>
                <div class="meta-gp-title">ページタイトル</div>
                <div class="meta-gp-desc">ページの説明文がここに表示されます...</div>
              </div>
            </div>

            <div class="qr-form-group">
              <label>SNSプレビュー</label>
              <div class="meta-social-preview" id="meta-social-preview">
                <div class="meta-sp-image" id="meta-sp-image">
                  <span>🖼️ 画像未設定</span>
                </div>
                <div class="meta-sp-content">
                  <div class="meta-sp-domain">example.com</div>
                  <div class="meta-sp-title">ページタイトル</div>
                  <div class="meta-sp-desc">ページの説明文...</div>
                </div>
              </div>
            </div>
          </div>

          <div class="meta-code-output">
            <label style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-dim); margin-bottom: var(--space-sm); display:block;">生成されたHTML</label>
            <pre><code id="meta-output"></code></pre>
          </div>
        </div>
      </div>
  `;

    setTimeout(() => {
        const titleInput = document.getElementById('meta-title');
        const descInput = document.getElementById('meta-desc');
        const urlInput = document.getElementById('meta-url');
        const imageInput = document.getElementById('meta-image');
        const keywordsInput = document.getElementById('meta-keywords');
        const authorInput = document.getElementById('meta-author');
        const robotsSelect = document.getElementById('meta-robots');
        const ogTypeSelect = document.getElementById('meta-og-type');
        const twitterHandle = document.getElementById('meta-twitter-handle');
        const output = document.getElementById('meta-output');
        const titleCount = document.getElementById('meta-title-count');
        const descCount = document.getElementById('meta-desc-count');

        function update() {
            const title = titleInput.value;
            const desc = descInput.value;
            const url = urlInput.value;
            const image = imageInput.value;
            const keywords = keywordsInput.value;
            const author = authorInput.value;
            const robots = robotsSelect.value;
            const ogType = ogTypeSelect.value;
            const twitter = twitterHandle.value;

            // Counters
            titleCount.textContent = `${title.length}/60`;
            titleCount.style.color = title.length > 60 ? 'var(--color-error)' : 'var(--color-text-dim)';
            descCount.textContent = `${desc.length}/160`;
            descCount.style.color = desc.length > 160 ? 'var(--color-error)' : 'var(--color-text-dim)';

            // Google preview
            const gp = document.getElementById('meta-google-preview');
            gp.querySelector('.meta-gp-url').textContent = url || 'example.com';
            gp.querySelector('.meta-gp-title').textContent = title || 'ページタイトル';
            gp.querySelector('.meta-gp-desc').textContent = desc || 'ページの説明文がここに表示されます...';

            // Social preview
            const spImage = document.getElementById('meta-sp-image');
            if (image) {
                spImage.innerHTML = `<img src="${image}" alt="プレビュー" onerror="this.parentElement.innerHTML='<span>⚠️ 画像を読み込めませんでした</span>'" />`;
            } else {
                spImage.innerHTML = '<span>🖼️ 画像未設定</span>';
            }
            const sp = document.getElementById('meta-social-preview');
            sp.querySelector('.meta-sp-domain').textContent = url ? new URL(url.startsWith('http') ? url : 'https://' + url).hostname : 'example.com';
            sp.querySelector('.meta-sp-title').textContent = title || 'ページタイトル';
            sp.querySelector('.meta-sp-desc').textContent = desc || 'ページの説明文...';

            // Generate HTML
            let html = '';
            html += `<meta charset="UTF-8">\n`;
            html += `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
            if (title) html += `<title>${esc(title)}</title>\n`;
            if (desc) html += `<meta name="description" content="${esc(desc)}">\n`;
            if (keywords) html += `<meta name="keywords" content="${esc(keywords)}">\n`;
            if (author) html += `<meta name="author" content="${esc(author)}">\n`;
            html += `<meta name="robots" content="${robots}">\n`;
            html += `\n<!-- Open Graph / Facebook -->\n`;
            html += `<meta property="og:type" content="${ogType}">\n`;
            if (title) html += `<meta property="og:title" content="${esc(title)}">\n`;
            if (desc) html += `<meta property="og:description" content="${esc(desc)}">\n`;
            if (url) html += `<meta property="og:url" content="${esc(url)}">\n`;
            if (image) html += `<meta property="og:image" content="${esc(image)}">\n`;
            html += `\n<!-- Twitter -->\n`;
            html += `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">\n`;
            if (title) html += `<meta name="twitter:title" content="${esc(title)}">\n`;
            if (desc) html += `<meta name="twitter:description" content="${esc(desc)}">\n`;
            if (image) html += `<meta name="twitter:image" content="${esc(image)}">\n`;
            if (twitter) html += `<meta name="twitter:site" content="${esc(twitter)}">\n`;

            output.textContent = html;
        }

        function esc(str) {
            return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        // Watch all inputs
        widget.querySelectorAll('input, textarea, select').forEach(el => {
            el.addEventListener('input', update);
            el.addEventListener('change', update);
        });

        // Copy
        document.getElementById('meta-copy').addEventListener('click', () => {
            copyToClipboard(output.textContent);
        });

        update();
    }, 0);

    return widget;
}
