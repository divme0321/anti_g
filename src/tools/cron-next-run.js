import { copyToClipboard } from '../utils.js';

// Cron次回実行時刻シミュレーター — インタラクティブ部分のみを描画する
// cronstrue等の外部ライブラリには依存せず、cron式のマッチング判定を自前で実装する。
// 探索はすべてブラウザのローカルタイムを基準に1分刻みで行う。

const FIELD_LABELS = ['分', '時', '日', '月', '曜日'];
const FIELD_RANGES = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7], // 曜日は 0=日曜〜6=土曜、7も日曜として扱う
];

// cronの1フィールド（例: "*", "1,15,30", "1-5", "*/15", "1-30/5"）を解析し、
// マッチしうる値の Set を返す。不正な形式なら例外を投げる。
function parseCronField(raw, index) {
  const [min, max] = FIELD_RANGES[index];
  const label = FIELD_LABELS[index];
  const values = new Set();

  const segments = raw.split(',');
  for (const segment of segments) {
    if (segment === '') {
      throw new Error(`${label}の指定が空です`);
    }

    let match;
    if (segment === '*') {
      for (let v = min; v <= max; v++) values.add(v);
      continue;
    }

    // ステップ付き範囲: 1-30/5
    match = /^(\d+)-(\d+)\/(\d+)$/.exec(segment);
    if (match) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      const step = Number(match[3]);
      if (step <= 0) throw new Error(`${label}のステップ値は1以上を指定してください`);
      if (start < min || end > max || start > end) {
        throw new Error(`${label}の範囲は${min}〜${max}の間で、開始値は終了値以下にしてください`);
      }
      for (let v = start; v <= end; v += step) values.add(v);
      continue;
    }

    // ステップ付き全体: */15
    match = /^\*\/(\d+)$/.exec(segment);
    if (match) {
      const step = Number(match[1]);
      if (step <= 0) throw new Error(`${label}のステップ値は1以上を指定してください`);
      for (let v = min; v <= max; v += step) values.add(v);
      continue;
    }

    // 範囲: 1-5
    match = /^(\d+)-(\d+)$/.exec(segment);
    if (match) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      if (start < min || end > max || start > end) {
        throw new Error(`${label}の範囲は${min}〜${max}の間で、開始値は終了値以下にしてください`);
      }
      for (let v = start; v <= end; v++) values.add(v);
      continue;
    }

    // 単一値
    match = /^(\d+)$/.exec(segment);
    if (match) {
      const v = Number(match[1]);
      if (v < min || v > max) {
        throw new Error(`${label}の値は${min}〜${max}の範囲で指定してください`);
      }
      values.add(v);
      continue;
    }

    throw new Error(`${label}の記法「${segment}」を解釈できません`);
  }

  return values;
}

// cron式（5フィールド）を解析し、判定用データを返す
export function parseCronExpression(expr) {
  const trimmed = expr.trim();
  if (!trimmed) throw new Error('cron式を入力してください');

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) {
    throw new Error('cron式は「分 時 日 月 曜日」の5つのフィールドで指定してください');
  }

  const [minField, hourField, domField, monField, dowField] = fields;

  const minSet = parseCronField(minField, 0);
  const hourSet = parseCronField(hourField, 1);
  const domSet = parseCronField(domField, 2);
  const monSet = parseCronField(monField, 3);
  const dowSetRaw = parseCronField(dowField, 4);
  // 7は日曜として0に正規化する
  const dowSet = new Set([...dowSetRaw].map((v) => (v === 7 ? 0 : v)));

  return {
    minSet,
    hourSet,
    domSet,
    monSet,
    dowSet,
    domIsWildcard: domField === '*',
    dowIsWildcard: dowField === '*',
  };
}

// 指定した日時がcron条件にマッチするか判定する
function matches(cron, date) {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const dow = date.getDay();

  if (!cron.minSet.has(minute) || !cron.hourSet.has(hour) || !cron.monSet.has(month)) {
    return false;
  }

  const domMatch = cron.domSet.has(day);
  const dowMatch = cron.dowSet.has(dow);

  // 日・曜日の両方が具体的に指定されている場合は「いずれかを満たせば実行」というcron仕様のOR条件
  if (!cron.domIsWildcard && !cron.dowIsWildcard) {
    return domMatch || dowMatch;
  }
  return domMatch && dowMatch;
}

const MAX_SEARCH_MINUTES = 2 * 366 * 24 * 60; // 無限ループ防止: 2年先まで

// cron式から、現在時刻より後の次回実行時刻を最大 count 件探索する
export function findNextRuns(expr, count, now = new Date()) {
  const cron = parseCronExpression(expr);

  const results = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1); // 現在時刻の次の分から探索する

  let steps = 0;
  while (results.length < count && steps < MAX_SEARCH_MINUTES) {
    if (matches(cron, cursor)) {
      results.push(new Date(cursor.getTime()));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
    steps++;
  }

  return results;
}

// 'YYYY年M月D日(曜日) HH:mm' 形式
function formatDateTimeJa(date) {
  const youbi = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${youbi}) ${hh}:${mm}`;
}

// 基準時刻からの相対時間を「〜後」の形式で表す（例: 3時間15分後）
function formatRelative(target, base) {
  const diffMin = Math.round((target.getTime() - base.getTime()) / 60000);
  if (diffMin <= 0) return 'まもなく';

  const days = Math.floor(diffMin / 1440);
  const hours = Math.floor((diffMin % 1440) / 60);
  const minutes = diffMin % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}日`);
  if (hours > 0) parts.push(`${hours}時間`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}分`);
  return `${parts.join('')}後`;
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">Cron次回実行時刻シミュレーター</span>
        <div class="pane-actions">
          <button class="btn-icon" id="cnr-copy" title="結果をコピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="timestamp-section">
          <div class="form-group">
            <label for="cnr-cron">Cron式（分 時 日 月 曜日）</label>
            <input type="text" id="cnr-cron" value="0 9 * * 1" placeholder="例: 0 9 * * 1" />
          </div>

          <div class="form-group">
            <label>プリセット</label>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary btn-sm cnr-preset" data-cron="* * * * *">毎分</button>
              <button type="button" class="btn btn-secondary btn-sm cnr-preset" data-cron="0 * * * *">毎時0分</button>
              <button type="button" class="btn btn-secondary btn-sm cnr-preset" data-cron="0 9 * * *">毎日9時</button>
              <button type="button" class="btn btn-secondary btn-sm cnr-preset" data-cron="0 9 * * 1">毎週月曜9時</button>
              <button type="button" class="btn btn-secondary btn-sm cnr-preset" data-cron="0 0 1 * *">毎月1日0時</button>
            </div>
          </div>

          <div class="form-group">
            <label for="cnr-count">次回実行回数</label>
            <input type="number" id="cnr-count" value="10" min="1" max="50" style="max-width:120px" />
          </div>

          <div class="tool-actions" style="padding:0; border:none; background:none; margin:4px 0 16px;">
            <button type="button" class="btn btn-primary" id="cnr-run">次回実行時刻を計算</button>
          </div>

          <div id="cnr-error" class="regex-error" style="display:none;"></div>
          <div id="cnr-result" class="timestamp-result"></div>
        </div>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="cnr-status-dot"></span>
        <span id="cnr-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const cronInput = document.getElementById('cnr-cron');
    const countInput = document.getElementById('cnr-count');
    const runBtn = document.getElementById('cnr-run');
    const errorBox = document.getElementById('cnr-error');
    const resultBox = document.getElementById('cnr-result');
    const status = document.getElementById('cnr-status');
    const statusDot = document.getElementById('cnr-status-dot');

    let copyText = '';

    function showError(message) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
      resultBox.innerHTML = '';
      status.textContent = `エラー: ${message}`;
      statusDot.className = 'status-dot error';
      copyText = '';
    }

    function run() {
      errorBox.style.display = 'none';

      let count = parseInt(countInput.value, 10);
      if (Number.isNaN(count) || count < 1) count = 1;
      if (count > 50) count = 50;
      countInput.value = String(count);

      let runs;
      try {
        const now = new Date();
        runs = findNextRuns(cronInput.value, count, now);

        if (runs.length === 0) {
          showError('該当する実行時刻が見つかりませんでした（2年以内に条件を満たす日時がありません）');
          return;
        }

        const now2 = now;
        const rows = runs
          .map(
            (d, i) =>
              `<div class="ts-result-row">${i + 1}. <span class="ts-value">${formatDateTimeJa(d)}</span>（${formatRelative(d, now2)}）</div>`
          )
          .join('');
        resultBox.innerHTML = rows;
        copyText = runs.map((d) => `${formatDateTimeJa(d)}（${formatRelative(d, now2)}）`).join('\n');

        status.textContent = `${runs.length}件の次回実行時刻を計算しました`;
        statusDot.className = 'status-dot';
      } catch (e) {
        showError(e.message);
      }
    }

    runBtn.addEventListener('click', run);
    cronInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') run();
    });

    document.querySelectorAll('.cnr-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        cronInput.value = btn.dataset.cron;
        run();
      });
    });

    document.getElementById('cnr-copy').addEventListener('click', () => {
      if (copyText) copyToClipboard(copyText);
    });

    run();
  }, 0);

  return widget;
}
