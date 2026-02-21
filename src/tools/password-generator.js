import { copyToClipboard } from '../main.js';

export function renderPasswordGenerator() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>Password Generator</span>
      </div>
      <h1>Password Generator</h1>
      <p>Generate strong, random passwords with customizable length and character options. Uses cryptographically secure random number generation.</p>
    </div>
    <div class="tool-container single-pane">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Generator</span>
        </div>
        <div class="pane-body">
          <div class="password-display" id="pw-display">Click "Generate" to create a password</div>
          <div class="password-strength" id="pw-strength"></div>

          <div class="password-controls">
            <div class="form-group">
              <label for="pw-length">Length: <strong id="pw-length-val">16</strong></label>
              <input type="range" id="pw-length" min="4" max="128" value="16" style="width:100%" />
            </div>

            <div class="password-options">
              <label class="pw-option">
                <input type="checkbox" id="pw-upper" checked /> Uppercase (A-Z)
              </label>
              <label class="pw-option">
                <input type="checkbox" id="pw-lower" checked /> Lowercase (a-z)
              </label>
              <label class="pw-option">
                <input type="checkbox" id="pw-numbers" checked /> Numbers (0-9)
              </label>
              <label class="pw-option">
                <input type="checkbox" id="pw-symbols" checked /> Symbols (!@#$%...)
              </label>
              <label class="pw-option">
                <input type="checkbox" id="pw-exclude-ambiguous" /> Exclude Ambiguous (O0Il1)
              </label>
            </div>

            <div style="display:flex;gap:8px;margin-top:16px;">
              <button class="btn btn-primary" id="pw-generate" style="flex:1;">🔄 Generate Password</button>
              <button class="btn btn-secondary" id="pw-copy">📋 Copy</button>
            </div>
          </div>

          <div class="password-bulk" style="margin-top:24px;">
            <h3 style="font-size:0.9rem;color:var(--color-text-muted);margin-bottom:12px;">Bulk Generate</h3>
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
              <label style="font-size:0.85rem;color:var(--color-text-dim);">Count:</label>
              <input type="number" id="pw-bulk-count" value="5" min="1" max="50" style="width:80px;" />
              <button class="btn btn-secondary" id="pw-bulk-generate">Generate Multiple</button>
            </div>
            <div id="pw-bulk-list" class="password-bulk-list"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="tool-info">
      <h2>Why Use Strong Passwords?</h2>
      <p>Weak passwords are the leading cause of security breaches. A strong password should be long, random, and unique for every account.</p>
      <h3>Password Security Tips</h3>
      <ul>
        <li><strong>Length Matters Most:</strong> A 16+ character password is exponentially harder to crack than a short one.</li>
        <li><strong>Mix Character Types:</strong> Use uppercase, lowercase, numbers, and symbols together.</li>
        <li><strong>Never Reuse Passwords:</strong> If one service is breached, unique passwords protect your other accounts.</li>
        <li><strong>Use a Password Manager:</strong> Tools like Bitwarden, 1Password, or KeePass store your passwords securely.</li>
        <li><strong>Enable 2FA:</strong> Two-factor authentication adds an extra layer of security beyond passwords.</li>
      </ul>
      <h3>How Secure is This Generator?</h3>
      <p>This password generator uses the Web Crypto API (<code>crypto.getRandomValues()</code>) for cryptographically secure random number generation. All password generation happens entirely in your browser — passwords are never sent to any server.</p>
      <h3>Brute Force Time Estimates</h3>
      <ul>
        <li><strong>8 characters (lowercase only):</strong> ~5 hours</li>
        <li><strong>8 characters (mixed):</strong> ~7 months</li>
        <li><strong>12 characters (mixed + symbols):</strong> ~34,000 years</li>
        <li><strong>16 characters (mixed + symbols):</strong> ~billions of years</li>
      </ul>
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
            if (!charset) return '⚠️ Select at least one character type';
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

            if (score <= 2) return { label: 'Weak', color: 'var(--color-error)', percent: 25 };
            if (score <= 3) return { label: 'Fair', color: 'var(--color-warning)', percent: 50 };
            if (score <= 4) return { label: 'Strong', color: '#22c55e', percent: 75 };
            return { label: 'Very Strong', color: '#10b981', percent: 100 };
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
            if (text && !text.startsWith('⚠️') && !text.startsWith('Click')) {
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

    return page;
}
