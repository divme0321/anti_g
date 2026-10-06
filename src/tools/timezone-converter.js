import { copyToClipboard } from '../utils.js';

// 主要タイムゾーンのリスト（都市名・IANA識別子）。世界時計の一覧はこの順で表示する。
const DEFAULT_ZONES = [
  { id: 'Asia/Tokyo', label: '東京' },
  { id: 'Europe/London', label: 'ロンドン' },
  { id: 'America/New_York', label: 'ニューヨーク' },
  { id: 'America/Los_Angeles', label: 'ロサンゼルス' },
  { id: 'Europe/Paris', label: 'パリ' },
  { id: 'Asia/Singapore', label: 'シンガポール' },
  { id: 'Australia/Sydney', label: 'シドニー' },
  { id: 'UTC', label: 'UTC' },
];

// Intl.supportedValuesOf('timeZone') が使えないブラウザ用のフォールバック候補
const FALLBACK_ZONES = [
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Kolkata',
  'Asia/Dubai', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Manila', 'Asia/Taipei', 'Asia/Vladivostok',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Madrid', 'Europe/Rome',
  'Europe/Istanbul', 'Europe/Lisbon',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'America/Mexico_City', 'America/Toronto', 'America/Vancouver', 'America/Anchorage',
  'Australia/Sydney', 'Australia/Perth', 'Pacific/Auckland', 'Pacific/Honolulu', 'UTC',
];

// 指定したUTC瞬間における、そのタイムゾーンのUTCからのオフセット（ミリ秒）を返す
// 例: Asia/Tokyo なら常に約 +32400000（+9時間）
export function getZoneOffsetMs(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map = {};
  for (const p of dtf.formatToParts(date)) if (p.type !== 'literal') map[p.type] = p.value;
  const hour = map.hour === '24' ? 0 : Number(map.hour);
  const asUtc = Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day), hour, Number(map.minute), Number(map.second));
  return asUtc - date.getTime();
}

// 「あるタイムゾーンにおける壁時計時刻（年月日時分秒）」からUTCの瞬間（Date）を求める。
// タイムゾーンのオフセットは日付によって変わりうる（サマータイム）ため、
// 一度計算したオフセットを使って再度UTCを求め直す反復法で正確な値に収束させる。
export function zonedTimeToUtc(y, mo, d, h, mi, s, timeZone) {
  const target = Date.UTC(y, mo - 1, d, h, mi, s);
  let utcGuess = target;
  for (let i = 0; i < 2; i++) {
    const offset = getZoneOffsetMs(new Date(utcGuess), timeZone);
    utcGuess = target - offset;
  }
  return new Date(utcGuess);
}

// UTCオフセット（ミリ秒）を "+9:00" のような文字列に整形する
export function formatOffset(offsetMs) {
  const totalMinutes = Math.round(offsetMs / 60000);
  const sign = totalMinutes < 0 ? '-' : '+';
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}:${String(m).padStart(2, '0')}`;
}

// 指定タイムゾーンでの日時を "YYYY/MM/DD(曜) HH:mm:ss" 形式の文字列にする
export function formatInZone(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('ja-JP', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map = {};
  for (const p of dtf.formatToParts(date)) if (p.type !== 'literal') map[p.type] = p.value;
  return `${map.year}/${map.month}/${map.day}(${map.weekday}) ${map.hour}:${map.minute}:${map.second}`;
}

// datetime-local input の value（'YYYY-MM-DDTHH:mm'）を、指定タイムゾーンの「現在時刻」で作る
function nowInZoneInputValue(timeZone) {
  const now = new Date();
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const map = {};
  for (const p of dtf.formatToParts(now)) if (p.type !== 'literal') map[p.type] = p.value;
  const hour = map.hour === '24' ? '00' : map.hour;
  return `${map.year}-${map.month}-${map.day}T${hour}:${map.minute}`;
}

// インタラクティブなツール部分のみを描画する（ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';

  const zoneOptions = DEFAULT_ZONES.map((z) => `<option value="${z.id}">${z.label} (${z.id})</option>`).join('');

  let customZoneIds = [];
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      customZoneIds = Intl.supportedValuesOf('timeZone');
    }
  } catch {
    customZoneIds = [];
  }
  if (!customZoneIds.length) customZoneIds = FALLBACK_ZONES;
  const customOptions = customZoneIds.map((id) => `<option value="${id}">${id}</option>`).join('');

  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">基準日時</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="tz-now">今すぐ</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="timestamp-section">
          <div class="form-group">
            <label for="tz-base-datetime">基準日時</label>
            <input type="datetime-local" id="tz-base-datetime" />
          </div>
          <div class="form-group">
            <label for="tz-base-zone">基準タイムゾーン</label>
            <select id="tz-base-zone">${zoneOptions}</select>
          </div>
          <div class="form-group">
            <label for="tz-custom-zone">タイムゾーンを追加（一覧に表示）</label>
            <select id="tz-custom-zone">
              <option value="">選択してください…</option>
              ${customOptions}
            </select>
          </div>
          <div class="timestamp-live-label">上で指定した日時・タイムゾーンを基準に、右側の各都市の同時刻を計算します。</div>
        </div>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">世界時計（同時刻の一覧）</span>
      </div>
      <div class="pane-body">
        <div class="hash-results" id="tz-list"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const datetimeInput = document.getElementById('tz-base-datetime');
    const baseZoneSelect = document.getElementById('tz-base-zone');
    const customZoneSelect = document.getElementById('tz-custom-zone');
    const nowBtn = document.getElementById('tz-now');
    const listEl = document.getElementById('tz-list');

    const extraZones = [];

    function parseDatetimeLocal(value) {
      const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || '');
      if (!m) return null;
      return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]), h: Number(m[4]), mi: Number(m[5]) };
    }

    function update() {
      const parsed = parseDatetimeLocal(datetimeInput.value);
      if (!parsed) {
        listEl.innerHTML = '<div class="ts-result-row">基準日時を入力してください。</div>';
        return;
      }
      const baseZone = baseZoneSelect.value;
      const utcDate = zonedTimeToUtc(parsed.y, parsed.mo, parsed.d, parsed.h, parsed.mi, 0, baseZone);
      if (Number.isNaN(utcDate.getTime())) {
        listEl.innerHTML = '<div class="ts-result-row">無効な日時です。</div>';
        return;
      }

      const zones = [...DEFAULT_ZONES, ...extraZones.map((id) => ({ id, label: id }))];

      listEl.innerHTML = zones
        .map((z, i) => {
          const offsetMs = getZoneOffsetMs(utcDate, z.id);
          const localStr = formatInZone(utcDate, z.id);
          const offsetStr = `UTC${formatOffset(offsetMs)}`;
          const rowId = `tz-row-${i}`;
          const isDefault = DEFAULT_ZONES.some((d) => d.id === z.id);
          const displayLabel = isDefault ? `${z.label} (${z.id})` : z.id;
          return `
            <div class="hash-result-item">
              <label>${displayLabel} ・ ${offsetStr}</label>
              <div class="hash-value" id="${rowId}">${localStr}</div>
              <button class="btn-icon" data-target="${rowId}" title="コピー">📋</button>
            </div>
          `;
        })
        .join('');

      listEl.querySelectorAll('.btn-icon').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = document.getElementById(btn.dataset.target);
          if (target) copyToClipboard(target.textContent);
        });
      });
    }

    datetimeInput.value = nowInZoneInputValue(baseZoneSelect.value);
    update();

    datetimeInput.addEventListener('input', update);
    baseZoneSelect.addEventListener('change', update);

    nowBtn.addEventListener('click', () => {
      datetimeInput.value = nowInZoneInputValue(baseZoneSelect.value);
      update();
    });

    customZoneSelect.addEventListener('change', () => {
      const val = customZoneSelect.value;
      if (val && !extraZones.includes(val) && !DEFAULT_ZONES.some((z) => z.id === val)) {
        extraZones.push(val);
        update();
      }
      customZoneSelect.value = '';
    });
  }, 0);

  return widget;
}
