import { showToast } from '../main.js';

export function renderFaviconGenerator() {
    const page = document.createElement('div');
    page.className = 'tool-page';

    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>Favicon Generator</span>
      </div>
      <h1>Favicon Generator</h1>
      <p>Create favicons from text, emoji, or initials. Download in multiple sizes for web, iOS, and Android.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Design</span>
        </div>
        <div class="pane-body">
          <div class="qr-settings">
            <div class="qr-form-group">
              <label for="fav-mode">Mode</label>
              <select id="fav-mode">
                <option value="emoji">Emoji</option>
                <option value="text">Text / Initials</option>
              </select>
            </div>

            <div id="fav-emoji-opts">
              <div class="qr-form-group">
                <label>Pick an Emoji</label>
                <div class="fav-emoji-grid" id="fav-emoji-grid"></div>
              </div>
            </div>

            <div id="fav-text-opts" style="display:none">
              <div class="qr-form-group">
                <label for="fav-text">Text (1-2 characters)</label>
                <input type="text" id="fav-text" maxlength="2" value="DT" placeholder="AB" />
              </div>
              <div class="qr-form-group">
                <label for="fav-font">Font</label>
                <select id="fav-font">
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="monospace">Monospace</option>
                  <option value="Impact, sans-serif">Impact</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>
              <div class="qr-form-group">
                <label for="fav-bold">Bold</label>
                <select id="fav-bold">
                  <option value="bold">Yes</option>
                  <option value="normal">No</option>
                </select>
              </div>
            </div>

            <div class="qr-options-row">
              <div class="qr-form-group">
                <label for="fav-bg">Background</label>
                <div class="qr-color-input">
                  <input type="color" id="fav-bg" value="#6366f1" />
                  <span id="fav-bg-label">#6366f1</span>
                </div>
              </div>
              <div class="qr-form-group">
                <label for="fav-fg">Text Color</label>
                <div class="qr-color-input">
                  <input type="color" id="fav-fg" value="#ffffff" />
                  <span id="fav-fg-label">#ffffff</span>
                </div>
              </div>
            </div>

            <div class="qr-form-group">
              <label for="fav-shape">Shape</label>
              <select id="fav-shape">
                <option value="rounded">Rounded Square</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Preview & Download</span>
        </div>
        <div class="pane-body">
          <div class="fav-preview-grid" id="fav-preview-grid"></div>
          <div class="fav-download-section">
            <button class="btn btn-primary" id="fav-download-all" style="width:100%; justify-content:center; padding: var(--space-md);">⬇ Download All Sizes (ZIP-free)</button>
          </div>
          <div class="fav-html-section">
            <label style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-dim); margin-bottom: var(--space-sm); display:block;">HTML Code</label>
            <pre><code id="fav-html-output"></code></pre>
            <button class="btn btn-secondary" id="fav-copy-html" style="margin-top: var(--space-sm);">📋 Copy HTML</button>
          </div>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => {
        const emojis = ['🚀', '⚡', '🔥', '💎', '🎯', '⭐', '🌟', '✨', '🎨', '🛠️', '💻', '🌐', '📱', '🎮', '🎵', '📸', '🏆', '💡', '🔒', '📊', '🧩', '🎁', '🌈', '☕', '🍕', '🦄', '🐱', '🐶', '🌸', '🍀', '🎭', '🎪'];

        const sizes = [
            { size: 16, label: '16×16', desc: 'Browser tab' },
            { size: 32, label: '32×32', desc: 'Standard' },
            { size: 48, label: '48×48', desc: 'Windows' },
            { size: 64, label: '64×64', desc: 'Bookmark' },
            { size: 128, label: '128×128', desc: 'Chrome Web Store' },
            { size: 180, label: '180×180', desc: 'Apple Touch' },
            { size: 192, label: '192×192', desc: 'Android' },
            { size: 512, label: '512×512', desc: 'PWA' },
        ];

        let selectedEmoji = '🚀';
        const modeSelect = document.getElementById('fav-mode');
        const emojiOpts = document.getElementById('fav-emoji-opts');
        const textOpts = document.getElementById('fav-text-opts');
        const emojiGrid = document.getElementById('fav-emoji-grid');
        const previewGrid = document.getElementById('fav-preview-grid');

        // Render emoji grid
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'fav-emoji-btn' + (emoji === selectedEmoji ? ' active' : '');
            btn.textContent = emoji;
            btn.addEventListener('click', () => {
                selectedEmoji = emoji;
                emojiGrid.querySelectorAll('.fav-emoji-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderPreviews();
            });
            emojiGrid.appendChild(btn);
        });

        function drawFavicon(canvas, size) {
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;

            const bg = document.getElementById('fav-bg').value;
            const fg = document.getElementById('fav-fg').value;
            const shape = document.getElementById('fav-shape').value;
            const mode = modeSelect.value;

            // Background
            ctx.clearRect(0, 0, size, size);
            ctx.fillStyle = bg;

            if (shape === 'circle') {
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (shape === 'rounded') {
                const r = size * 0.2;
                ctx.beginPath();
                ctx.moveTo(r, 0);
                ctx.lineTo(size - r, 0);
                ctx.quadraticCurveTo(size, 0, size, r);
                ctx.lineTo(size, size - r);
                ctx.quadraticCurveTo(size, size, size - r, size);
                ctx.lineTo(r, size);
                ctx.quadraticCurveTo(0, size, 0, size - r);
                ctx.lineTo(0, r);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(0, 0, size, size);
            }

            // Content
            if (mode === 'emoji') {
                ctx.font = `${size * 0.6}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(selectedEmoji, size / 2, size / 2 + size * 0.03);
            } else {
                const text = document.getElementById('fav-text').value || 'DT';
                const font = document.getElementById('fav-font').value;
                const bold = document.getElementById('fav-bold').value;
                const fontSize = text.length === 1 ? size * 0.6 : size * 0.42;
                ctx.font = `${bold} ${fontSize}px ${font}`;
                ctx.fillStyle = fg;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, size / 2, size / 2 + size * 0.03);
            }
        }

        function renderPreviews() {
            previewGrid.innerHTML = '';
            sizes.forEach(({ size, label, desc }) => {
                const item = document.createElement('div');
                item.className = 'fav-preview-item';

                const canvas = document.createElement('canvas');
                drawFavicon(canvas, size);

                const displaySize = Math.min(size, 64);
                canvas.style.width = displaySize + 'px';
                canvas.style.height = displaySize + 'px';

                const info = document.createElement('div');
                info.className = 'fav-preview-info';
                info.innerHTML = `<strong>${label}</strong><span>${desc}</span>`;

                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'btn btn-secondary';
                downloadBtn.textContent = '⬇';
                downloadBtn.title = `Download ${label}`;
                downloadBtn.addEventListener('click', () => {
                    const link = document.createElement('a');
                    link.download = `favicon-${size}x${size}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    showToast(`${label} favicon downloaded`);
                });

                item.appendChild(canvas);
                item.appendChild(info);
                item.appendChild(downloadBtn);
                previewGrid.appendChild(item);
            });

            // HTML code
            document.getElementById('fav-html-output').textContent =
                `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`;
        }

        // Mode change
        modeSelect.addEventListener('change', () => {
            emojiOpts.style.display = modeSelect.value === 'emoji' ? '' : 'none';
            textOpts.style.display = modeSelect.value === 'text' ? '' : 'none';
            renderPreviews();
        });

        // All inputs
        page.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', renderPreviews);
            el.addEventListener('change', renderPreviews);
        });

        // Color labels
        document.getElementById('fav-bg').addEventListener('input', e => {
            document.getElementById('fav-bg-label').textContent = e.target.value;
        });
        document.getElementById('fav-fg').addEventListener('input', e => {
            document.getElementById('fav-fg-label').textContent = e.target.value;
        });

        // Download all
        document.getElementById('fav-download-all').addEventListener('click', () => {
            sizes.forEach(({ size }) => {
                const canvas = document.createElement('canvas');
                drawFavicon(canvas, size);
                const link = document.createElement('a');
                link.download = `favicon-${size}x${size}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
            showToast('All sizes downloaded');
        });

        // Copy HTML
        document.getElementById('fav-copy-html').addEventListener('click', () => {
            const code = document.getElementById('fav-html-output').textContent;
            navigator.clipboard.writeText(code).then(() => showToast('HTML copied'));
        });

        renderPreviews();
    }, 0);

    return page;
}
