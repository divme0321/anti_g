import { copyToClipboard } from '../utils.js';

// 日付計算（日数カウント・加減算）— インタラクティブ部分のみを描画する
// 計算はすべてローカルタイムで行う

// Date → input[type=date] 用の 'YYYY-MM-DD' 文字列
function toInputValue(date) {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 'YYYY-MM-DD' → ローカルタイムの Date（不正なら null）
function parseInputValue(value) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

// 'YYYY年M月D日(曜日)' 形式
export function formatJa(date) {
  const youbi = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${youbi}曜日)`;
}

// 2つの日付の差分日数（end - start）。ローカル深夜0時同士の差を日数に丸める
export function diffInDays(start, end) {
  const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endMid = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endMid.getTime() - startMid.getTime()) / 86400000);
}

// start〜end（両端を含む）の平日（月〜金）の日数
export function countWeekdays(start, end) {
  const diff = diffInDays(start, end);
  const from = diff >= 0 ? start : end;
  const total = Math.abs(diff) + 1;
  let count = Math.floor(total / 7) * 5;
  const startDow = from.getDay();
  for (let i = 0; i < total % 7; i++) {
    const dow = (startDow + i) % 7;
    if (dow >= 1 && dow <= 5) count++;
  }
  return count;
}

// 月単位の加減算（月末を繰り上げない: 1月31日 + 1ヶ月 → 2月末日）
export function addMonthsClamped(date, months) {
  const day = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

// 単位・方向を考慮した日付の加減算
export function addToDate(base, amount, unit, direction) {
  const signed = direction === 'before' ? -amount : amount;
  switch (unit) {
    case 'day':
      return new Date(base.getFullYear(), base.getMonth(), base.getDate() + signed);
    case 'week':
      return new Date(base.getFullYear(), base.getMonth(), base.getDate() + signed * 7);
    case 'month':
      return addMonthsClamped(base, signed);
    case 'year':
      return addMonthsClamped(base, signed * 12);
    default:
      return new Date(base.getTime());
  }
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';
  const today = toInputValue(new Date());
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">日付の差分計算（日数カウント）</span>
      </div>
      <div class="pane-body">
        <div class="timestamp-section">
          <div class="form-group">
            <label for="dc-start">開始日</label>
            <input type="date" id="dc-start" value="${today}" />
          </div>
          <div class="form-group">
            <label for="dc-end">終了日</label>
            <input type="date" id="dc-end" value="${today}" />
          </div>
          <div class="timestamp-result" id="dc-diff-result"></div>
          <div class="timestamp-live-label">※ 平日の日数は月〜金を数えたもので、祝日は考慮していません。</div>
        </div>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">日付の加減算（○日後・○ヶ月前）</span>
        <div class="pane-actions">
          <button class="btn-icon" id="dc-copy" title="結果をコピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="timestamp-section">
          <div class="form-group">
            <label for="dc-base">基準日</label>
            <input type="date" id="dc-base" value="${today}" />
          </div>
          <div class="form-group">
            <label for="dc-amount">加減算する期間</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <input type="number" id="dc-amount" value="1" min="0" style="flex:1;min-width:90px" />
              <select id="dc-unit" style="width:90px">
                <option value="day">日</option>
                <option value="week">週</option>
                <option value="month">月</option>
                <option value="year">年</option>
              </select>
              <select id="dc-dir" style="width:110px">
                <option value="after">後（未来）</option>
                <option value="before">前（過去）</option>
              </select>
            </div>
          </div>
          <div class="timestamp-result">
            <div class="timestamp-live" id="dc-add-result"></div>
            <div class="timestamp-live-label" id="dc-add-label"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const startInput = document.getElementById('dc-start');
    const endInput = document.getElementById('dc-end');
    const diffResult = document.getElementById('dc-diff-result');
    const baseInput = document.getElementById('dc-base');
    const amountInput = document.getElementById('dc-amount');
    const unitSelect = document.getElementById('dc-unit');
    const dirSelect = document.getElementById('dc-dir');
    const addResult = document.getElementById('dc-add-result');
    const addLabel = document.getElementById('dc-add-label');

    let copyText = '';

    function updateDiff() {
      const start = parseInputValue(startInput.value);
      const end = parseInputValue(endInput.value);
      if (!start || !end) {
        diffResult.innerHTML = '<div class="ts-result-row">開始日と終了日を選択してください。</div>';
        return;
      }
      const diff = diffInDays(start, end);
      const abs = Math.abs(diff);
      const inclusive = abs + 1;
      const weeks = Math.floor(abs / 7);
      const remDays = abs % 7;
      const weeksText = weeks > 0 ? `${weeks}週間${remDays > 0 ? `と${remDays}日` : ''}` : `${remDays}日`;
      const months = Math.round((abs / 30.4375) * 10) / 10;
      const weekdays = countWeekdays(start, end);
      diffResult.innerHTML = `
        <div class="ts-result-row"><strong>差分日数（終了日 − 開始日）:</strong> <span class="ts-value">${diff}日</span></div>
        <div class="ts-result-row"><strong>両端を含む日数（初日算入）:</strong> <span class="ts-value">${inclusive}日</span></div>
        <div class="ts-result-row"><strong>週数:</strong> <span class="ts-value">${weeksText}</span></div>
        <div class="ts-result-row"><strong>およその月数:</strong> <span class="ts-value">約${months}ヶ月</span></div>
        <div class="ts-result-row"><strong>平日（月〜金）の日数（両端を含む）:</strong> <span class="ts-value">${weekdays}日</span></div>
      `;
    }

    function updateAdd() {
      const base = parseInputValue(baseInput.value);
      const amount = parseInt(amountInput.value, 10);
      if (!base || Number.isNaN(amount) || amount < 0) {
        addResult.textContent = '—';
        addLabel.textContent = '基準日と期間を入力してください。';
        copyText = '';
        return;
      }
      const result = addToDate(base, amount, unitSelect.value, dirSelect.value);
      const unitLabel = { day: '日', week: '週間', month: 'ヶ月', year: '年' }[unitSelect.value];
      const dirLabel = dirSelect.value === 'before' ? '前' : '後';
      copyText = formatJa(result);
      addResult.textContent = copyText;
      addLabel.textContent = `${formatJa(base)} の ${amount}${unitLabel}${dirLabel}`;
    }

    [startInput, endInput].forEach((el) => {
      el.addEventListener('input', updateDiff);
      el.addEventListener('change', updateDiff);
    });
    [baseInput, amountInput, unitSelect, dirSelect].forEach((el) => {
      el.addEventListener('input', updateAdd);
      el.addEventListener('change', updateAdd);
    });

    document.getElementById('dc-copy').addEventListener('click', () => {
      if (copyText) copyToClipboard(copyText);
    });

    updateDiff();
    updateAdd();
  }, 0);

  return widget;
}
