import { showToast } from '../utils.js';

// すべての画像処理はCanvas APIを使いブラウザ内で完結する（サーバーへのアップロードは一切行わない）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';

  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">元画像 / 圧縮設定</span>
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

        <div id="img-original-area" style="display:none">
          <div class="img-preview-box">
            <img id="img-original-preview" alt="元画像のプレビュー" />
            <div class="img-meta" id="img-original-meta"></div>
          </div>

          <div class="qr-settings" style="margin-top: var(--space-lg)">
            <div class="qr-form-group">
              <label for="img-format">出力形式</label>
              <select id="img-format">
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG</option>
              </select>
            </div>

            <div class="qr-form-group" id="img-quality-row">
              <label for="img-quality">品質（<span id="img-quality-value">0.8</span>）</label>
              <input type="range" id="img-quality" class="grad-range" min="0.1" max="1.0" step="0.05" value="0.8" />
            </div>

            <div class="qr-form-group">
              <label for="img-maxwidth">最大幅（px・任意）</label>
              <input type="number" id="img-maxwidth" min="1" placeholder="例: 1200（空欄なら元サイズのまま）" />
            </div>
          </div>

          <div class="tool-actions" style="margin-top: var(--space-lg)">
            <button class="btn btn-primary" id="img-compress-btn">🗜 圧縮する</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">圧縮後</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="img-download-btn" disabled>⬇ ダウンロード</button>
        </div>
      </div>
      <div class="pane-body">
        <div id="img-result-placeholder" class="qr-placeholder">
          左で画像を選択し、「圧縮する」ボタンを押すと結果がここに表示されます。
        </div>
        <div id="img-result-area" style="display:none">
          <div class="img-preview-box">
            <img id="img-compressed-preview" alt="圧縮後画像のプレビュー" />
            <div class="img-meta" id="img-compressed-meta"></div>
          </div>
          <div class="status-bar">
            <span class="status-dot" id="img-status-dot"></span>
            <span id="img-status">準備完了</span>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const dropzone = document.getElementById('img-dropzone');
    const fileInput = document.getElementById('img-file-input');
    const originalArea = document.getElementById('img-original-area');
    const originalPreview = document.getElementById('img-original-preview');
    const originalMeta = document.getElementById('img-original-meta');

    const formatSelect = document.getElementById('img-format');
    const qualityRow = document.getElementById('img-quality-row');
    const qualityInput = document.getElementById('img-quality');
    const qualityValue = document.getElementById('img-quality-value');
    const maxWidthInput = document.getElementById('img-maxwidth');
    const compressBtn = document.getElementById('img-compress-btn');

    const resultPlaceholder = document.getElementById('img-result-placeholder');
    const resultArea = document.getElementById('img-result-area');
    const compressedPreview = document.getElementById('img-compressed-preview');
    const compressedMeta = document.getElementById('img-compressed-meta');
    const downloadBtn = document.getElementById('img-download-btn');
    const status = document.getElementById('img-status');
    const statusDot = document.getElementById('img-status-dot');

    let originalFile = null;
    let originalImage = null;
    let originalObjectUrl = '';
    let compressedObjectUrl = '';
    let compressedBlob = null;

    function formatSize(bytes) {
      if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
      return (bytes / 1024).toFixed(1) + ' KB';
    }

    function extForMime(mime) {
      if (mime === 'image/jpeg') return 'jpg';
      if (mime === 'image/webp') return 'webp';
      return 'png';
    }

    function resetResult() {
      resultArea.style.display = 'none';
      resultPlaceholder.style.display = '';
      downloadBtn.disabled = true;
      compressedBlob = null;
      if (compressedObjectUrl) {
        URL.revokeObjectURL(compressedObjectUrl);
        compressedObjectUrl = '';
      }
      status.textContent = '準備完了';
      statusDot.className = 'status-dot';
    }

    function processFile(file) {
      if (!file || !file.type.startsWith('image/')) {
        showToast('画像ファイルを選択してください', 'error');
        return;
      }

      if (originalObjectUrl) URL.revokeObjectURL(originalObjectUrl);
      originalFile = file;
      originalObjectUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        originalImage = img;
        originalPreview.src = originalObjectUrl;
        originalArea.style.display = '';

        originalMeta.innerHTML = `
          <span>${file.name}</span>
          <span>${img.naturalWidth} × ${img.naturalHeight}px</span>
          <span>${formatSize(file.size)}</span>
          <span>${file.type || '不明な形式'}</span>
        `;

        resetResult();
      };
      img.onerror = () => {
        showToast('画像の読み込みに失敗しました', 'error');
      };
      img.src = originalObjectUrl;
    }

    // ドロップゾーンのクリックでファイル選択
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) processFile(e.target.files[0]);
    });

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

    // 品質スライダーはJPEG/WebP選択時のみ有効
    function updateQualityAvailability() {
      const isLossy = formatSelect.value === 'image/jpeg' || formatSelect.value === 'image/webp';
      qualityInput.disabled = !isLossy;
      qualityRow.style.opacity = isLossy ? '1' : '0.5';
    }
    formatSelect.addEventListener('change', updateQualityAvailability);
    updateQualityAvailability();

    qualityInput.addEventListener('input', () => {
      qualityValue.textContent = Number(qualityInput.value).toFixed(2);
    });

    // 圧縮処理
    compressBtn.addEventListener('click', () => {
      if (!originalImage || !originalFile) {
        showToast('先に画像を選択してください', 'error');
        return;
      }

      const mimeType = formatSelect.value;
      const quality = parseFloat(qualityInput.value);
      const maxWidth = parseInt(maxWidthInput.value, 10);

      let targetWidth = originalImage.naturalWidth;
      let targetHeight = originalImage.naturalHeight;

      if (maxWidth && maxWidth > 0 && maxWidth < targetWidth) {
        const scale = maxWidth / targetWidth;
        targetWidth = Math.round(maxWidth);
        targetHeight = Math.round(targetHeight * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      // JPEGは透過を扱えないため、白背景を敷いてから描画する
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }
      ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

      status.textContent = '圧縮中...';
      statusDot.className = 'status-dot';

      const isLossy = mimeType === 'image/jpeg' || mimeType === 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            status.textContent = 'エラー: この形式には対応していません';
            statusDot.className = 'status-dot error';
            showToast('圧縮に失敗しました', 'error');
            return;
          }

          if (compressedObjectUrl) URL.revokeObjectURL(compressedObjectUrl);
          compressedBlob = blob;
          compressedObjectUrl = URL.createObjectURL(blob);

          compressedPreview.src = compressedObjectUrl;
          resultPlaceholder.style.display = 'none';
          resultArea.style.display = '';
          downloadBtn.disabled = false;

          const reduction = ((1 - blob.size / originalFile.size) * 100).toFixed(1);
          const reductionLabel =
            reduction >= 0 ? `${reduction}% 削減` : `${Math.abs(reduction)}% 増加`;

          compressedMeta.innerHTML = `
            <span>${targetWidth} × ${targetHeight}px</span>
            <span>${formatSize(blob.size)}</span>
            <span>${mimeType}</span>
            <span>${reductionLabel}</span>
          `;

          status.textContent = `圧縮完了 — ${formatSize(originalFile.size)} → ${formatSize(blob.size)}（${reductionLabel}）`;
          statusDot.className = 'status-dot';
        },
        mimeType,
        isLossy ? quality : undefined
      );
    });

    // ダウンロード
    downloadBtn.addEventListener('click', () => {
      if (!compressedBlob) return;
      const baseName = (originalFile.name || 'image').replace(/\.[^.]+$/, '');
      const link = document.createElement('a');
      link.download = `${baseName}-compressed.${extForMime(formatSelect.value)}`;
      link.href = compressedObjectUrl;
      link.click();
      showToast('画像をダウンロードしました');
    });
  }, 0);

  return widget;
}
