import { showToast, copyToClipboard } from '../utils.js';

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';

    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">画像 → Base64</span>
        </div>
        <div class="pane-body">
          <div class="img-b64-dropzone" id="img-dropzone">
            <div class="dropzone-content">
              <div class="dropzone-icon">🖼️</div>
              <p>ここに画像をドラッグ＆ドロップ</p>
              <span class="dropzone-sub">またはクリックしてファイルを選択</span>
              <input type="file" id="img-file-input" accept="image/*" class="dropzone-input" />
            </div>
          </div>
          <div id="img-preview-container" style="display:none">
            <div class="img-preview-box">
              <img id="img-preview" alt="プレビュー" />
              <div class="img-meta" id="img-meta"></div>
            </div>
          </div>
          <div id="img-b64-output-area" style="display:none">
            <div class="qr-form-group" style="margin-top: var(--space-md)">
              <label>出力形式</label>
              <select id="img-format-select">
                <option value="datauri">Data URI（プレフィックス付き）</option>
                <option value="raw">Base64のみ</option>
              </select>
            </div>
            <div class="pane-actions" style="margin-top: var(--space-sm)">
              <button class="btn btn-primary" id="img-copy-b64">📋 Base64をコピー</button>
            </div>
            <textarea id="img-b64-output" rows="8" readonly style="margin-top: var(--space-sm); font-size: 0.75rem;"></textarea>
          </div>
        </div>
      </div>

      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Base64 → 画像</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="b64-download">⬇ ダウンロード</button>
          </div>
        </div>
        <div class="pane-body">
          <div class="qr-form-group">
            <label for="b64-input">Base64文字列またはData URIを貼り付け</label>
            <textarea id="b64-input" rows="6" placeholder="data:image/png;base64,iVBORw0KGgo... またはBase64文字列のみ"></textarea>
          </div>
          <div id="b64-preview-container" class="b64-preview-container">
            <div class="qr-placeholder">上にBase64文字列を貼り付けると画像をプレビューできます</div>
          </div>
        </div>
      </div>
  `;

    setTimeout(() => {
        const dropzone = document.getElementById('img-dropzone');
        const fileInput = document.getElementById('img-file-input');
        const imgPreview = document.getElementById('img-preview');
        const previewContainer = document.getElementById('img-preview-container');
        const outputArea = document.getElementById('img-b64-output-area');
        const b64Output = document.getElementById('img-b64-output');
        const imgMeta = document.getElementById('img-meta');
        const formatSelect = document.getElementById('img-format-select');

        let currentDataURI = '';
        let currentRawB64 = '';

        function processFile(file) {
            if (!file || !file.type.startsWith('image/')) {
                showToast('画像ファイルを選択してください', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                currentDataURI = e.target.result;
                currentRawB64 = currentDataURI.split(',')[1];

                imgPreview.src = currentDataURI;
                previewContainer.style.display = '';
                outputArea.style.display = '';

                const sizeKB = (file.size / 1024).toFixed(1);
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                const b64Len = currentRawB64.length;

                imgMeta.innerHTML = `
          <span>${file.name}</span>
          <span>${file.type}</span>
          <span>${file.size > 1048576 ? sizeMB + ' MB' : sizeKB + ' KB'}</span>
          <span>Base64: ${(b64Len / 1024).toFixed(1)} KB</span>
        `;

                updateOutput();
            };
            reader.readAsDataURL(file);
        }

        function updateOutput() {
            const format = formatSelect.value;
            b64Output.value = format === 'datauri' ? currentDataURI : currentRawB64;
        }

        // Dropzone click
        dropzone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) processFile(e.target.files[0]);
        });

        // Drag & drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
        });

        // Format select
        formatSelect.addEventListener('change', updateOutput);

        // Copy button
        document.getElementById('img-copy-b64').addEventListener('click', () => {
            copyToClipboard(b64Output.value);
        });

        // === Base64 → Image ===
        const b64Input = document.getElementById('b64-input');
        const b64PreviewContainer = document.getElementById('b64-preview-container');

        function decodeBase64() {
            let val = b64Input.value.trim();
            if (!val) {
                b64PreviewContainer.innerHTML = '<div class="qr-placeholder">上にBase64文字列を貼り付けると画像をプレビューできます</div>';
                return;
            }

            // If no data URI prefix, try to add one
            if (!val.startsWith('data:')) {
                val = 'data:image/png;base64,' + val;
            }

            const img = document.createElement('img');
            img.style.maxWidth = '100%';
            img.style.borderRadius = '12px';
            img.style.border = '1px solid var(--color-border)';
            img.id = 'b64-decoded-img';

            img.onload = () => {
                b64PreviewContainer.innerHTML = '';
                b64PreviewContainer.appendChild(img);

                const info = document.createElement('div');
                info.className = 'img-meta';
                info.innerHTML = `<span>${img.naturalWidth} × ${img.naturalHeight}px</span>`;
                b64PreviewContainer.appendChild(info);
            };

            img.onerror = () => {
                b64PreviewContainer.innerHTML = '<div class="qr-placeholder" style="color: var(--color-error)">無効なBase64画像データです</div>';
            };

            img.src = val;
        }

        b64Input.addEventListener('input', decodeBase64);

        // Download decoded image
        document.getElementById('b64-download').addEventListener('click', () => {
            const img = document.getElementById('b64-decoded-img');
            if (!img) { showToast('先に画像をデコードしてください', 'error'); return; }
            const link = document.createElement('a');
            link.download = 'decoded-image.png';
            link.href = img.src;
            link.click();
            showToast('画像をダウンロードしました');
        });
    }, 0);

    return widget;
}
