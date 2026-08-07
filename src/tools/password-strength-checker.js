// パスワード強度チェッカー — 入力されたパスワードを診断する専用ツール
// （パスワード生成機能は password-generator.js が担当するため、ここには持たせない）
import { escapeHtml } from '../utils.js';

// よく使われる弱いパスワードの代表例（完全一致・部分一致の両方を検出対象にする）
const COMMON_PASSWORDS = [
  'password',
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty',
  'qwertyuiop',
  'abc123',
  'letmein',
  'monkey',
  '111111',
  '000000',
  'iloveyou',
  'admin',
  'welcome',
  'password1',
  'passw0rd',
  'sunshine',
  'princess',
  'football',
  'dragon',
  'master',
  'login',
];

// 3文字以上の連続文字列（abc, 123, cba など昇順・降順どちらも）を検出する
function hasSequentialRun(pw, runLength = 3) {
  const lower = pw.toLowerCase();
  for (let i = 0; i <= lower.length - runLength; i++) {
    let asc = true;
    let desc = true;
    for (let j = 1; j < runLength; j++) {
      const prev = lower.charCodeAt(i + j - 1);
      const cur = lower.charCodeAt(i + j);
      if (cur !== prev + 1) asc = false;
      if (cur !== prev - 1) desc = false;
    }
    if (asc || desc) return true;
  }
  return false;
}

// 同じ文字の3連続以上の繰り返し（aaa, 111 など）を検出する
function hasRepeatedChar(pw, runLength = 3) {
  for (let i = 0; i <= pw.length - runLength; i++) {
    let same = true;
    for (let j = 1; j < runLength; j++) {
      if (pw[i + j] !== pw[i]) same = false;
    }
    if (same) return true;
  }
  return false;
}

// よくある弱いパスワードとの完全一致・部分一致を検出する
function isCommonPassword(pw) {
  const lower = pw.toLowerCase();
  if (!lower) return false;
  return COMMON_PASSWORDS.some((common) => lower === common || lower.includes(common));
}

// 使用されている文字種から総当たり攻撃の探索空間（文字集合サイズ）を概算する
function estimatePoolSize({ hasLower, hasUpper, hasDigit, hasSymbol }) {
  let pool = 0;
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasDigit) pool += 10;
  if (hasSymbol) pool += 32; // 主要な記号の目安
  return pool;
}

// 秒数を日本語の目安表記に変換する
function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 1) return '1秒未満';

  const YEAR = 60 * 60 * 24 * 365;
  if (seconds >= YEAR) {
    const years = seconds / YEAR;
    if (years >= 1e12) return '天文学的な時間（実質的に解読不可能）';
    if (years >= 1e8) return `約${(years / 1e8).toFixed(1)}億年`;
    if (years >= 1e4) return `約${Math.round(years / 1e4)}万年`;
    return `約${Math.round(years)}年`;
  }
  const DAY = 60 * 60 * 24;
  if (seconds >= DAY) return `約${Math.round(seconds / DAY)}日`;
  const HOUR = 60 * 60;
  if (seconds >= HOUR) return `約${Math.round(seconds / HOUR)}時間`;
  const MINUTE = 60;
  if (seconds >= MINUTE) return `約${Math.round(seconds / MINUTE)}分`;
  return `約${Math.round(seconds)}秒`;
}

// 理論上の解読時間を概算する（オフライン高速攻撃を想定し、毎秒100億回の試行と仮定）
function estimateCrackTime(pw, isCommon) {
  if (!pw) return '-';
  if (isCommon) return '瞬時（よく使われるパスワード辞書に含まれます）';

  const poolSize = estimatePoolSize({
    hasLower: /[a-z]/.test(pw),
    hasUpper: /[A-Z]/.test(pw),
    hasDigit: /[0-9]/.test(pw),
    hasSymbol: /[^a-zA-Z0-9]/.test(pw),
  });
  if (poolSize === 0) return '-';

  const GUESSES_PER_SECOND = 1e10;
  const combinations = Math.pow(poolSize, pw.length);
  const seconds = combinations / (2 * GUESSES_PER_SECOND);
  return formatDuration(seconds);
}

// パスワードを診断し、スコア・強度ラベル・診断詳細をまとめて返す
function analyzePassword(pw) {
  const length = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  const typeCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  const sequential = length >= 3 && hasSequentialRun(pw);
  const repeated = length >= 3 && hasRepeatedChar(pw);
  const common = isCommonPassword(pw);

  // 加点方式: 文字数（最大50点）＋ 文字種の多様性（最大50点）
  let score = 0;
  if (length > 0) {
    score += Math.min(50, length * 3.2);
    score += typeCount * 12.5;
    if (sequential) score -= 15;
    if (repeated) score -= 15;
    if (common) score -= 60;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  let level;
  if (length === 0) {
    level = { label: '未入力', color: 'var(--color-text-dim)' };
  } else if (score < 20) {
    level = { label: '非常に弱い', color: 'var(--color-error)' };
  } else if (score < 40) {
    level = { label: '弱い', color: 'var(--color-error)' };
  } else if (score < 60) {
    level = { label: '普通', color: 'var(--color-warning)' };
  } else if (score < 80) {
    level = { label: '強い', color: '#22c55e' };
  } else {
    level = { label: '非常に強い', color: '#10b981' };
  }

  const checklist = [
    { ok: length >= 8, label: '8文字以上' },
    { ok: length >= 12, label: '12文字以上' },
    { ok: length >= 16, label: '16文字以上' },
    { ok: hasUpper, label: '大文字が含まれている' },
    { ok: hasLower, label: '小文字が含まれている' },
    { ok: hasDigit, label: '数字が含まれている' },
    { ok: hasSymbol, label: '記号が含まれている' },
    { ok: !sequential, label: '連続する文字列（abc, 123など）を含まない' },
    { ok: !repeated, label: '同じ文字の3回以上の繰り返しがない' },
    { ok: !common, label: 'よく使われる弱いパスワードと一致しない' },
  ];

  return { length, score, level, checklist, common };
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">パスワード強度チェッカー</span>
      </div>
      <div class="pane-body">
        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
          <label for="psc-input" style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-dim);">診断したいパスワード</label>
          <div style="display:flex;gap:8px;">
            <input type="password" id="psc-input" placeholder="パスワードを入力してください" autocomplete="off" autocapitalize="off" spellcheck="false" style="flex:1;" />
            <button type="button" class="btn-icon" id="psc-toggle" title="表示/非表示を切り替え" aria-label="パスワードの表示/非表示を切り替え">👁</button>
          </div>
        </div>

        <div class="password-strength" id="psc-strength"></div>

        <div id="psc-crack-time" style="font-size:0.85rem;color:var(--color-text-muted);margin-bottom:20px;"></div>

        <div>
          <h3 style="font-size:0.9rem;color:var(--color-text-muted);margin-bottom:12px;">診断の詳細</h3>
          <ul id="psc-checklist" style="list-style:none;display:flex;flex-direction:column;gap:6px;font-size:0.85rem;padding:0;margin:0;"></ul>
        </div>
      </div>
      <div class="status-bar">
        <span>🔒 入力したパスワードはブラウザ内でのみ処理され、サーバーなど外部には一切送信されません。</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('psc-input');
    const toggleBtn = document.getElementById('psc-toggle');
    const strengthDiv = document.getElementById('psc-strength');
    const crackTimeDiv = document.getElementById('psc-crack-time');
    const checklistEl = document.getElementById('psc-checklist');

    function update() {
      const pw = input.value;
      const result = analyzePassword(pw);

      if (pw.length === 0) {
        strengthDiv.innerHTML = `
          <div class="pw-strength-bar"><div class="pw-strength-fill" style="width:0%;background:var(--color-text-dim)"></div></div>
          <span style="font-size:0.8rem;color:var(--color-text-dim);font-weight:600">パスワードを入力すると診断結果が表示されます</span>
        `;
        crackTimeDiv.textContent = '';
        checklistEl.innerHTML = '';
        return;
      }

      strengthDiv.innerHTML = `
        <div class="pw-strength-bar"><div class="pw-strength-fill" style="width:${result.score}%;background:${result.level.color}"></div></div>
        <span style="font-size:0.8rem;color:${result.level.color};font-weight:600">${result.level.label}（スコア: ${result.score} / 100）</span>
      `;

      const crackTime = estimateCrackTime(pw, result.common);
      crackTimeDiv.innerHTML = `⏱ 理論上の解読時間の目安（総当たり攻撃、毎秒100億回試行を想定）: <strong style="color:var(--color-heading)">${escapeHtml(crackTime)}</strong>`;

      checklistEl.innerHTML = result.checklist
        .map(
          (item) => `
            <li style="display:flex;align-items:center;gap:8px;color:${item.ok ? 'var(--color-success)' : 'var(--color-error)'}">
              <span aria-hidden="true">${item.ok ? '✓' : '✗'}</span>
              <span style="color:var(--color-text)">${escapeHtml(item.label)}</span>
            </li>`
        )
        .join('');
    }

    toggleBtn.addEventListener('click', () => {
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      toggleBtn.textContent = showing ? '👁' : '🙈';
    });

    input.addEventListener('input', update);
    update();
  }, 0);

  return widget;
}
