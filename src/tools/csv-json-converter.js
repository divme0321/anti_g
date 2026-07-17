import { copyToClipboard, showToast } from '../utils.js';

// CSV文字列をパースしてオブジェクトの配列に変換する（RFC4180準拠）
// - ダブルクォートで囲まれたフィールドはカンマ・改行を含んでよい
// - "" はエスケープされたダブルクォート1文字として扱う
// - 1行目はヘッダー行として扱う
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  function pushField() {
    row.push(field);
    field = '';
  }
  function pushRow() {
    pushField();
    rows.push(row);
    row = [];
  }

  while (i < len) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      pushField();
      i += 1;
      continue;
    }
    if (ch === '\r') {
      // \r\n と単独の \r の両方に対応
      if (text[i + 1] === '\n') i += 1;
      pushRow();
      i += 1;
      continue;
    }
    if (ch === '\n') {
      pushRow();
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }

  if (inQuotes) {
    throw new Error('CSVの形式が不正です（ダブルクォートが閉じられていません）');
  }

  // 最後のフィールド/行を確定する（末尾が改行で終わっていない場合）
  if (field !== '' || row.length > 0) {
    pushRow();
  }

  // 完全に空の行（末尾の空行など）を除去する
  const cleanedRows = rows.filter((r) => !(r.length === 1 && r[0] === ''));
  if (cleanedRows.length === 0) {
    throw new Error('CSVデータが空です');
  }

  const header = cleanedRows[0];
  const dataRows = cleanedRows.slice(1);

  return dataRows.map((r) => {
    const obj = {};
    header.forEach((key, idx) => {
      obj[key] = r[idx] !== undefined ? r[idx] : '';
    });
    return obj;
  });
}

// フィールド値をCSV向けにエスケープする（必要な場合のみダブルクォートで囲む）
function escapeCsvField(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

// オブジェクトの配列をCSV文字列に変換する
function jsonToCsv(data) {
  if (!Array.isArray(data)) {
    throw new Error('JSONはオブジェクトの配列である必要があります（例: [{"a":1}]）');
  }
  if (data.length === 0) {
    throw new Error('配列が空です');
  }
  if (!data.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))) {
    throw new Error('配列の各要素はオブジェクトである必要があります');
  }

  // すべての行に登場するキーを順番を保ちつつ収集する
  const headerSet = [];
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!headerSet.includes(key)) headerSet.push(key);
    });
  });

  const lines = [headerSet.map(escapeCsvField).join(',')];
  data.forEach((item) => {
    const line = headerSet.map((key) => {
      const v = item[key];
      if (v !== null && typeof v === 'object') {
        return escapeCsvField(JSON.stringify(v));
      }
      return escapeCsvField(v);
    });
    lines.push(line.join(','));
  });

  return lines.join('\r\n');
}

const SAMPLE_CSV = `name,age,city\n山田太郎,28,東京\n佐藤花子,34,大阪\n鈴木一郎,45,福岡`;

// インタラクティブなツール部分のみを描画する（ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">CSV</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="cj-sample">サンプル</button>
          <button class="btn btn-secondary" id="cj-clear">クリア</button>
          <button class="btn-icon" id="cj-copy-csv" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="cj-csv" placeholder="ここにCSVを貼り付けてください...\n\nname,age,city\n山田太郎,28,東京"></textarea>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="cj-to-json">CSV→JSON →</button>
        <button class="btn btn-primary" id="cj-to-csv">← JSON→CSV</button>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">JSON</span>
        <div class="pane-actions">
          <button class="btn-icon" id="cj-copy" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="cj-json" placeholder='ここにJSON配列を貼り付けてください...\n\n[{"name": "山田太郎", "age": "28"}]'></textarea>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="cj-status-dot"></span>
        <span id="cj-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const csvArea = document.getElementById('cj-csv');
    const jsonArea = document.getElementById('cj-json');
    const status = document.getElementById('cj-status');
    const statusDot = document.getElementById('cj-status-dot');

    function setStatus(msg, isError = false) {
      status.textContent = msg;
      statusDot.className = isError ? 'status-dot error' : 'status-dot';
    }

    document.getElementById('cj-to-json').addEventListener('click', () => {
      try {
        const data = parseCsv(csvArea.value);
        jsonArea.value = JSON.stringify(data, null, 2);
        setStatus(`変換完了 — ${data.length} 行 → JSON`);
      } catch (e) {
        setStatus(`エラー: ${e.message}`, true);
        showToast(e.message, 'error');
      }
    });

    document.getElementById('cj-to-csv').addEventListener('click', () => {
      try {
        const parsed = JSON.parse(jsonArea.value);
        const csv = jsonToCsv(parsed);
        csvArea.value = csv;
        setStatus(`変換完了 — ${parsed.length} 行 → CSV`);
      } catch (e) {
        setStatus(`エラー: ${e.message}`, true);
        showToast(e.message, 'error');
      }
    });

    document.getElementById('cj-copy').addEventListener('click', () => {
      if (jsonArea.value) copyToClipboard(jsonArea.value);
    });

    document.getElementById('cj-copy-csv').addEventListener('click', () => {
      if (csvArea.value) copyToClipboard(csvArea.value);
    });

    document.getElementById('cj-clear').addEventListener('click', () => {
      csvArea.value = '';
      jsonArea.value = '';
      setStatus('準備完了');
    });

    document.getElementById('cj-sample').addEventListener('click', () => {
      csvArea.value = SAMPLE_CSV;
      jsonArea.value = '';
      setStatus('サンプルCSVを読み込みました');
    });
  }, 0);

  return widget;
}
