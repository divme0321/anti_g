import { copyToClipboard, showToast } from '../utils.js';

// 全角文字を2、半角文字を1として表示幅を数える（等幅フォントでの桁揃え用）
function displayWidth(str) {
  let width = 0;
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    // CJK・かな・ハングル・全角記号はおおむねこの範囲に収まる
    const isWide =
      (cp >= 0x1100 && cp <= 0x115f) || // ハングル字母
      (cp >= 0x2e80 && cp <= 0xa4cf) || // CJK部首・かな・漢字など
      (cp >= 0xac00 && cp <= 0xd7a3) || // ハングル音節
      (cp >= 0xf900 && cp <= 0xfaff) || // CJK互換漢字
      (cp >= 0xfe30 && cp <= 0xfe4f) || // CJK互換形
      (cp >= 0xff00 && cp <= 0xff60) || // 全角英数・記号
      (cp >= 0xffe0 && cp <= 0xffe6) || // 全角通貨記号
      (cp >= 0x20000 && cp <= 0x3fffd); // CJK拡張漢字
    width += isWide ? 2 : 1;
  }
  return width;
}

// セル文字列をMarkdown向けにエスケープする（パイプは表の区切りと衝突するため \| にする）
function escapeCell(value) {
  return value.trim().replaceAll('|', '\\|');
}

// 表示幅 width になるようにセルをパディングする
function padCell(str, width, align) {
  const pad = Math.max(0, width - displayWidth(str));
  if (align === 'right') return ' '.repeat(pad) + str;
  if (align === 'center') {
    const left = Math.floor(pad / 2);
    return ' '.repeat(left) + str + ' '.repeat(pad - left);
  }
  return str + ' '.repeat(pad);
}

// 区切り行のセル（:-- / :-: / --: を列幅に合わせて伸ばす）
function separatorCell(width, align) {
  if (align === 'right') return '-'.repeat(width - 1) + ':';
  if (align === 'center') return ':' + '-'.repeat(width - 2) + ':';
  return ':' + '-'.repeat(width - 1);
}

// 入力テキストをパースしてMarkdownテーブル文字列に変換する
// - タブが含まれていればタブ区切り（Excelからのコピペ）、なければカンマ区切りとして扱う
// - 1行目をヘッダー行とみなす
export function toMarkdownTable(text, align = 'left') {
  const lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => line.trim() !== '');
  if (lines.length === 0) {
    throw new Error('データが空です');
  }

  const delimiter = text.includes('\t') ? '\t' : ',';
  const rows = lines.map((line) => line.split(delimiter).map(escapeCell));

  // 列数はすべての行の最大値に合わせ、足りないセルは空文字で埋める
  const colCount = Math.max(...rows.map((r) => r.length));
  rows.forEach((r) => {
    while (r.length < colCount) r.push('');
  });

  // 各列の幅を計算する（区切り行 :-: が最低3文字必要）
  const widths = [];
  for (let c = 0; c < colCount; c += 1) {
    widths[c] = Math.max(3, ...rows.map((r) => displayWidth(r[c])));
  }

  const formatRow = (cells) =>
    `| ${cells.map((cell, c) => padCell(cell, widths[c], align)).join(' | ')} |`;

  const out = [
    formatRow(rows[0]),
    `| ${widths.map((w) => separatorCell(w, align)).join(' | ')} |`,
    ...rows.slice(1).map(formatRow),
  ];

  return { markdown: out.join('\n'), rowCount: rows.length, colCount };
}

const SAMPLE_DATA = `名前\t年齢\t都市\n山田太郎\t28\t東京\n佐藤花子\t34\t大阪\n鈴木一郎\t45\t福岡`;

// インタラクティブなツール部分のみを描画する（ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">データ入力（タブ / カンマ区切り）</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="mdt-sample">サンプル</button>
          <button class="btn btn-secondary" id="mdt-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="mdt-input" placeholder="Excelやスプレッドシートからコピーした表をそのまま貼り付けてください...\n（1行目はヘッダーとして扱われます）\n\n名前\t年齢\t都市\n山田太郎\t28\t東京"></textarea>
      </div>
      <div class="tool-actions">
        <label for="mdt-align">列の揃え:</label>
        <select id="mdt-align" style="width:auto;">
          <option value="left">左揃え（:--）</option>
          <option value="center">中央揃え（:-:）</option>
          <option value="right">右揃え（--:）</option>
        </select>
        <button class="btn btn-primary" id="mdt-convert">変換 →</button>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">Markdown</span>
        <div class="pane-actions">
          <button class="btn-icon" id="mdt-copy" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="mdt-output" readonly placeholder="| 名前     | 年齢 | 都市 |\n| :------- | :--- | :--- |\n| 山田太郎 | 28   | 東京 |"></textarea>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="mdt-status-dot"></span>
        <span id="mdt-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('mdt-input');
    const output = document.getElementById('mdt-output');
    const alignSelect = document.getElementById('mdt-align');
    const status = document.getElementById('mdt-status');
    const statusDot = document.getElementById('mdt-status-dot');

    function setStatus(msg, isError = false) {
      status.textContent = msg;
      statusDot.className = isError ? 'status-dot error' : 'status-dot';
    }

    document.getElementById('mdt-convert').addEventListener('click', () => {
      try {
        const { markdown, rowCount, colCount } = toMarkdownTable(input.value, alignSelect.value);
        output.value = markdown;
        setStatus(`変換完了 — ${rowCount} 行 × ${colCount} 列`);
      } catch (e) {
        setStatus(`エラー: ${e.message}`, true);
        showToast(e.message, 'error');
      }
    });

    document.getElementById('mdt-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });

    document.getElementById('mdt-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setStatus('準備完了');
    });

    document.getElementById('mdt-sample').addEventListener('click', () => {
      input.value = SAMPLE_DATA;
      output.value = '';
      setStatus('サンプルデータを読み込みました');
    });
  }, 0);

  return widget;
}
