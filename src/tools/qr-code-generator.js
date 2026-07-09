import { showToast } from '../utils.js';
import qrcode from 'qrcode-generator';

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';

  widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">設定</span>
        </div>
        <div class="pane-body">
          <div class="qr-settings">
            <div class="qr-form-group">
              <label for="qr-type">種類</label>
              <select id="qr-type">
                <option value="text">テキスト / URL</option>
                <option value="wifi">WiFi</option>
                <option value="email">メール</option>
                <option value="phone">電話番号</option>
              </select>
            </div>

            <div id="qr-text-fields">
              <div class="qr-form-group">
                <label for="qr-input">内容</label>
                <textarea id="qr-input" rows="4" placeholder="URLまたはテキストを入力...">https://</textarea>
              </div>
            </div>

            <div id="qr-wifi-fields" style="display:none">
              <div class="qr-form-group">
                <label for="qr-wifi-ssid">ネットワーク名 (SSID)</label>
                <input type="text" id="qr-wifi-ssid" placeholder="MyNetwork" />
              </div>
              <div class="qr-form-group">
                <label for="qr-wifi-pass">パスワード</label>
                <input type="text" id="qr-wifi-pass" placeholder="パスワード" />
              </div>
              <div class="qr-form-group">
                <label for="qr-wifi-enc">暗号化方式</label>
                <select id="qr-wifi-enc">
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">なし</option>
                </select>
              </div>
            </div>

            <div id="qr-email-fields" style="display:none">
              <div class="qr-form-group">
                <label for="qr-email-to">宛先</label>
                <input type="text" id="qr-email-to" placeholder="user@example.com" />
              </div>
              <div class="qr-form-group">
                <label for="qr-email-subject">件名</label>
                <input type="text" id="qr-email-subject" placeholder="件名" />
              </div>
              <div class="qr-form-group">
                <label for="qr-email-body">本文</label>
                <textarea id="qr-email-body" rows="3" placeholder="メール本文..."></textarea>
              </div>
            </div>

            <div id="qr-phone-fields" style="display:none">
              <div class="qr-form-group">
                <label for="qr-phone-num">電話番号</label>
                <input type="text" id="qr-phone-num" placeholder="+819012345678" />
              </div>
            </div>

            <div class="qr-options-row">
              <div class="qr-form-group">
                <label for="qr-size">サイズ</label>
                <select id="qr-size">
                  <option value="4">小 (132px)</option>
                  <option value="6" selected>中 (198px)</option>
                  <option value="10">大 (330px)</option>
                  <option value="16">特大 (528px)</option>
                </select>
              </div>
              <div class="qr-form-group">
                <label for="qr-ecl">誤り訂正レベル</label>
                <select id="qr-ecl">
                  <option value="L">低 (7%)</option>
                  <option value="M" selected>中 (15%)</option>
                  <option value="Q">高 (25%)</option>
                  <option value="H">最高 (30%)</option>
                </select>
              </div>
            </div>

            <div class="qr-options-row">
              <div class="qr-form-group">
                <label for="qr-fg">前景色</label>
                <div class="qr-color-input">
                  <input type="color" id="qr-fg" value="#000000" />
                  <span id="qr-fg-label">#000000</span>
                </div>
              </div>
              <div class="qr-form-group">
                <label for="qr-bg">背景色</label>
                <div class="qr-color-input">
                  <input type="color" id="qr-bg" value="#ffffff" />
                  <span id="qr-bg-label">#ffffff</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">プレビュー</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="qr-download-png">⬇ PNG</button>
            <button class="btn btn-secondary" id="qr-download-svg">⬇ SVG</button>
          </div>
        </div>
        <div class="pane-body qr-preview-body">
          <div id="qr-preview" class="qr-preview-area"></div>
        </div>
      </div>
  `;

  setTimeout(() => {
    const typeSelect = document.getElementById('qr-type');
    const textFields = document.getElementById('qr-text-fields');
    const wifiFields = document.getElementById('qr-wifi-fields');
    const emailFields = document.getElementById('qr-email-fields');
    const phoneFields = document.getElementById('qr-phone-fields');
    const preview = document.getElementById('qr-preview');

    function showFields(type) {
      textFields.style.display = type === 'text' ? '' : 'none';
      wifiFields.style.display = type === 'wifi' ? '' : 'none';
      emailFields.style.display = type === 'email' ? '' : 'none';
      phoneFields.style.display = type === 'phone' ? '' : 'none';
    }

    function getData() {
      const type = typeSelect.value;
      if (type === 'text') return document.getElementById('qr-input').value;
      if (type === 'wifi') {
        const ssid = document.getElementById('qr-wifi-ssid').value;
        const pass = document.getElementById('qr-wifi-pass').value;
        const enc = document.getElementById('qr-wifi-enc').value;
        return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
      }
      if (type === 'email') {
        const to = document.getElementById('qr-email-to').value;
        const sub = document.getElementById('qr-email-subject').value;
        const body = document.getElementById('qr-email-body').value;
        return `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
      }
      if (type === 'phone') return `tel:${document.getElementById('qr-phone-num').value}`;
      return '';
    }

    function generateQR() {
      const data = getData();
      if (!data || data === 'https://' || data === 'tel:' || data === 'mailto:?subject=&body=') {
        preview.innerHTML = '<div class="qr-placeholder">内容を入力するとQRコードが生成されます</div>';
        return;
      }

      const ecl = document.getElementById('qr-ecl').value;
      const cellSize = parseInt(document.getElementById('qr-size').value);
      const fg = document.getElementById('qr-fg').value;
      const bg = document.getElementById('qr-bg').value;

      try {
        const qr = qrcode(0, ecl);
        qr.addData(data);
        qr.make();

        const moduleCount = qr.getModuleCount();
        const size = moduleCount * cellSize + cellSize * 2;

        // Generate canvas
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.id = 'qr-canvas';
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = fg;
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(
                col * cellSize + cellSize,
                row * cellSize + cellSize,
                cellSize,
                cellSize
              );
            }
          }
        }

        preview.innerHTML = '';
        canvas.style.maxWidth = '100%';
        canvas.style.borderRadius = '12px';
        preview.appendChild(canvas);

        // Store SVG data for download
        preview.dataset.svg = qr.createSvgTag({ cellSize, margin: cellSize });
      } catch (e) {
        preview.innerHTML = '<div class="qr-placeholder" style="color: var(--color-error)">データが長すぎてQRコードにできません — 短い内容をお試しください</div>';
      }
    }

    typeSelect.addEventListener('change', () => {
      showFields(typeSelect.value);
      generateQR();
    });

    // Watch all inputs
    widget.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', generateQR);
      el.addEventListener('change', generateQR);
    });

    // Color label updates
    document.getElementById('qr-fg').addEventListener('input', e => {
      document.getElementById('qr-fg-label').textContent = e.target.value;
    });
    document.getElementById('qr-bg').addEventListener('input', e => {
      document.getElementById('qr-bg-label').textContent = e.target.value;
    });

    // Download PNG
    document.getElementById('qr-download-png').addEventListener('click', () => {
      const canvas = document.getElementById('qr-canvas');
      if (!canvas) { showToast('先にQRコードを生成してください', 'error'); return; }
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('PNGをダウンロードしました');
    });

    // Download SVG
    document.getElementById('qr-download-svg').addEventListener('click', () => {
      const svgData = preview.dataset.svg;
      if (!svgData) { showToast('先にQRコードを生成してください', 'error'); return; }
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = 'qrcode.svg';
      link.href = URL.createObjectURL(blob);
      link.click();
      showToast('SVGをダウンロードしました');
    });

    generateQR();
  }, 0);

  return widget;
}
