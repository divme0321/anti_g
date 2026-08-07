import { copyToClipboard, showToast } from '../utils.js';
import jsQR from 'jsqr';

// 画像のデコード処理はすべてブラウザ内（Canvas API）で完結する。サーバーへの送信は一切行わない。
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';

  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">画像を選択</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="qrr-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="img-b64-dropzone" id="qrr-dropzone">
          <div class="dropzone-content">
            <div class="dropzone-icon">🔍</div>
            <p>ここにQRコードの画像をドラッグ＆ドロップ</p>
            <span class="dropzone-sub">またはクリックしてファイルを選択</span>
            <input type="file" id="qrr-file-input" accept="image/*" class="dropzone-input" />
          </div>
        </div>

        <div id="qrr-preview-area" style="display:none; margin-top: var(--space-lg)">
          <div class="img-preview-box">
            <img id="qrr-preview" alt="アップロードした画像のプレビュー" />
            <div class="img-meta" id="qrr-meta"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">読み取り結果</span>
        <div class="pane-actions">
          <button class="btn-icon" id="qrr-copy" title="コピー" disabled>📋</button>
        </div>
      </div>
      <div class="pane-body">
        <div id="qrr-result-placeholder" class="qr-placeholder">
          左でQRコードの画像を選択すると、読み取った内容がここに表示されます。
        </div>
        <div id="qrr-result-area" style="display:none">
          <textarea id="qrr-output" readonly></textarea>
          <div id="qrr-link-area" style="display:none; margin-top: var(--space-md)">
            <a id="qrr-link" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">🔗 リンクを開く</a>
          </div>
        </div>
        <div class="status-bar">
          <span class="status-dot" id="qrr-status-dot"></span>
          <span id="qrr-status">準備完了</span>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const dropzone = document.getElementById('qrr-dropzone');
    const fileInput = document.getElementById('qrr-file-input');
    const previewArea = document.getElementById('qrr-preview-area');
    const preview = document.getElementById('qrr-preview');
    const meta = document.getElementById('qrr-meta');

    const resultPlaceholder = document.getElementById('qrr-result-placeholder');
    const resultArea = document.getElementById('qrr-result-area');
    const output = document.getElementById('qrr-output');
    const linkArea = document.getElementById('qrr-link-area');
    const link = document.getElementById('qrr-link');
    const copyBtn = document.getElementById('qrr-copy');
    const status = document.getElementById('qrr-status');
    const statusDot = document.getElementById('qrr-status-dot');

    let objectUrl = '';

    function formatSize(bytes) {
      if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
      return (bytes / 1024).toFixed(1) + ' KB';
    }

    function resetResult() {
      resultArea.style.display = 'none';
      resultPlaceholder.style.display = '';
      linkArea.style.display = 'none';
      output.value = '';
      copyBtn.disabled = true;
    }

    function showError(message) {
      resetResult();
      status.textContent = message;
      statusDot.className = 'status-dot error';
    }

    function processFile(file) {
      if (!file || !file.type.startsWith('image/')) {
        showToast('画像ファイルを選択してください', 'error');
        return;
      }

      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        preview.src = objectUrl;
        previewArea.style.display = '';
        meta.innerHTML = `
          <span>${file.name}</span>
          <span>${img.naturalWidth} × ${img.naturalHeight}px</span>
          <span>${formatSize(file.size)}</span>
        `;

        status.textContent = '解析中...';
        statusDot.className = 'status-dot';
        resetResult();

        // Canvasに描画してピクセルデータを取得し、jsQRでデコードする
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        let imageData;
        try {
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
          showError('エラー: 画像データの取得に失敗しました');
          return;
        }

        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          resultPlaceholder.style.display = 'none';
          resultArea.style.display = '';
          output.value = code.data;
          copyBtn.disabled = false;

          if (/^https?:\/\//i.test(code.data.trim())) {
            link.href = code.data.trim();
            linkArea.style.display = '';
          } else {
            linkArea.style.display = 'none';
          }

          status.textContent = `読み取り完了 — ${code.data.length} 文字`;
          statusDot.className = 'status-dot';
        } else {
          showError('QRコードを検出できませんでした。画像が鮮明か、QRコード全体が写っているか確認してください');
        }
      };
      img.onerror = () => {
        showToast('画像の読み込みに失敗しました', 'error');
      };
      img.src = objectUrl;
    }

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

    copyBtn.addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });

    document.getElementById('qrr-clear').addEventListener('click', () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = '';
      }
      fileInput.value = '';
      previewArea.style.display = 'none';
      preview.src = '';
      meta.innerHTML = '';
      resetResult();
      status.textContent = '準備完了';
      statusDot.className = 'status-dot';
    });
  }, 0);

  return widget;
}
