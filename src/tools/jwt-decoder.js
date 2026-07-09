export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">エンコード済みトークン</span>
        </div>
        <div class="pane-body">
          <textarea id="jwt-input" class="tool-textarea" placeholder="ここにJWTを貼り付けてください... (例: eyJhbGciOiJIUzI1NiIsInR...)" style="height:300px;font-family:var(--font-mono);"></textarea>
          <div id="jwt-error" style="color:var(--color-error);margin-top:10px;display:none;font-size:0.9rem;">JWTの形式が正しくありません</div>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">デコード結果</span>
        </div>
        <div class="pane-body" style="display:flex;flex-direction:column;gap:15px;overflow-y:auto;">
          <div>
            <h3 style="font-size:0.9rem;color:var(--color-text-muted);margin-bottom:8px;">ヘッダー（アルゴリズムとタイプ）</h3>
            <pre id="jwt-header" class="code-output" style="min-height:80px;"></pre>
          </div>
          <div>
            <h3 style="font-size:0.9rem;color:var(--color-text-muted);margin-bottom:8px;">ペイロード（データ）</h3>
            <pre id="jwt-payload" class="code-output" style="min-height:200px;"></pre>
          </div>
        </div>
      </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('jwt-input');
        const headerOut = document.getElementById('jwt-header');
        const payloadOut = document.getElementById('jwt-payload');
        const errorOut = document.getElementById('jwt-error');

        function decodeBase64Url(str) {
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            while (str.length % 4) {
                str += '=';
            }
            const decoded = atob(str);
            try {
                return decodeURIComponent(decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            } catch (e) {
                return decoded;
            }
        }

        input.addEventListener('input', () => {
            const token = input.value.trim();
            if (!token) {
                headerOut.textContent = '';
                payloadOut.textContent = '';
                errorOut.style.display = 'none';
                return;
            }

            const parts = token.split('.');
            if (parts.length !== 3) {
                headerOut.textContent = '';
                payloadOut.textContent = '';
                errorOut.style.display = 'block';
                return;
            }

            try {
                const header = JSON.parse(decodeBase64Url(parts[0]));
                const payload = JSON.parse(decodeBase64Url(parts[1]));

                headerOut.textContent = JSON.stringify(header, null, 2);
                payloadOut.textContent = JSON.stringify(payload, null, 2);
                errorOut.style.display = 'none';
            } catch (e) {
                headerOut.textContent = '';
                payloadOut.textContent = '';
                errorOut.style.display = 'block';
            }
        });
    }, 0);

    return widget;
}
