import { copyToClipboard } from '../utils.js';

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container single-pane';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">ジェネレーター</span>
        </div>
        <div class="pane-body">
          <div class="password-display" id="pw-display">「生成」をクリックしてパスワードを作成</div>
          <div class="password-strength" id="pw-strength"></div>

          <div class="password-controls">
            <div class="form-group">
              <label for="pw-length">長さ: <strong id="pw-length-val">16</strong></label>
              <input type="range" id="pw-length" min="4" max="128" value="16" style="width:100%" />
            </div>

            <div class="password-options">
              <label class="pw-option">
                <input type="checkbox" id="pw-upper" checked /> 大文字 (A-Z)
              </label>
              <label class="pw-option">
                <input type="checkbox" id="pw-lower" checked /> 小文字 (a-z)
              </label>
              <label class="pw-option">
                <input type="checkbox" id="pw-numbers" checked /> 数字 (0-9)
              </label>
              <label class="pw-option">
                <input type="checkbox" id="pw-symbols" checked /> 記号 (!@#$%...)
              </label>
              <label class="pw-option">
                <input type="checkbox" id="pw-exclude-ambiguous" /> 紛らわしい文字を除外 (O0Il1)
              </label>
            </div>

            <div style="display:flex;gap:8px;margin-top:16px;">
              <button class="btn btn-primary" id="pw-generate" style="flex:1;">🔄 パスワードを生成</button>
              <button class="btn btn-secondary" id="pw-copy">📋 コピー</button>
            </div>
          </div>

          <div class="password-bulk" style="margin-top:24px;">
            <h3 style="font-size:0.9rem;color:var(--color-text-muted);margin-bottom:12px;">まとめて生成</h3>
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
              <label style="font-size:0.85rem;color:var(--color-text-dim);">個数:</label>
              <input type="number" id="pw-bulk-count" value="5" min="1" max="50" style="width:80px;" />
              <button class="btn btn-secondary" id="pw-bulk-generate">複数生成</button>
            </div>
            <div id="pw-bulk-list" class="password-bulk-list"></div>
          </div>
        </div>
      </div>
  `;

    setTimeout(() => {
        const display = document.getElementById('pw-display');
        const lengthSlider = document.getElementById('pw-length');
        const lengthVal = document.getElementById('pw-length-val');
        const strengthDiv = document.getElementById('pw-strength');

        const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const LOWER = 'abcdefghijklmnopqrstuvwxyz';
        const NUMBERS = '0123456789';
        const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const AMBIGUOUS = 'O0Il1';

        lengthSlider.addEventListener('input', () => {
            lengthVal.textContent = lengthSlider.value;
        });

        function getCharset() {
            let charset = '';
            if (document.getElementById('pw-upper').checked) charset += UPPER;
            if (document.getElementById('pw-lower').checked) charset += LOWER;
            if (document.getElementById('pw-numbers').checked) charset += NUMBERS;
            if (document.getElementById('pw-symbols').checked) charset += SYMBOLS;
            if (document.getElementById('pw-exclude-ambiguous').checked) {
                charset = charset.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
            }
            return charset;
        }

        function generatePassword(length) {
            const charset = getCharset();
            if (!charset) return '⚠️ 少なくとも1種類の文字を選択してください';
            const array = new Uint32Array(length);
            crypto.getRandomValues(array);
            return Array.from(array, x => charset[x % charset.length]).join('');
        }

        function getStrength(password) {
            let score = 0;
            if (password.length >= 8) score++;
            if (password.length >= 12) score++;
            if (password.length >= 16) score++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
            if (/\d/.test(password)) score++;
            if (/[^a-zA-Z0-9]/.test(password)) score++;

            if (score <= 2) return { label: '弱い', color: 'var(--color-error)', percent: 25 };
            if (score <= 3) return { label: 'やや弱い', color: 'var(--color-warning)', percent: 50 };
            if (score <= 4) return { label: '強い', color: '#22c55e', percent: 75 };
            return { label: '非常に強い', color: '#10b981', percent: 100 };
        }

        function updateDisplay() {
            const pw = generatePassword(parseInt(lengthSlider.value));
            display.textContent = pw;
            display.style.userSelect = 'all';

            const strength = getStrength(pw);
            strengthDiv.innerHTML = `
        <div class="pw-strength-bar">
          <div class="pw-strength-fill" style="width:${strength.percent}%;background:${strength.color}"></div>
        </div>
        <span style="font-size:0.8rem;color:${strength.color};font-weight:600">${strength.label}</span>
      `;
        }

        document.getElementById('pw-generate').addEventListener('click', updateDisplay);
        document.getElementById('pw-copy').addEventListener('click', () => {
            const text = display.textContent;
            if (text && !text.startsWith('⚠️') && !text.startsWith('「生成」')) {
                copyToClipboard(text);
            }
        });

        document.getElementById('pw-bulk-generate').addEventListener('click', () => {
            const count = Math.min(50, parseInt(document.getElementById('pw-bulk-count').value) || 5);
            const length = parseInt(lengthSlider.value);
            const list = document.getElementById('pw-bulk-list');
            let html = '';
            for (let i = 0; i < count; i++) {
                const pw = generatePassword(length);
                html += `<div class="pw-bulk-item"><code>${pw}</code><button class="btn-icon pw-bulk-copy" data-pw="${pw}">📋</button></div>`;
            }
            list.innerHTML = html;

            list.querySelectorAll('.pw-bulk-copy').forEach(btn => {
                btn.addEventListener('click', () => copyToClipboard(btn.dataset.pw));
            });
        });

        // Generate initial password
        updateDisplay();
    }, 0);

    return widget;
}
