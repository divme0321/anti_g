import { copyToClipboard, showToast } from '../utils.js';

// ファイルアップロード時に読み込む最大バイト数（これを超える分は表示しない）
const MAX_BYTES = 4096;

// バイト列を伝統的なhexdump形式（1行16バイト）のテキストに変換する
function formatHexDump(bytes) {
  const lines = [];
  for (let offset = 0; offset < bytes.length; offset += 16) {
    const row = bytes.slice(offset, offset + 16);
    const offsetHex = offset.toString(16).padStart(8, '0');

    const hexOf = (start, end) => {
      const parts = [];
      for (let i = start; i < end; i++) {
        parts.push(i < row.length ? row[i].toString(16).padStart(2, '0') : '  ');
      }
      return parts.join(' ');
    };

    const ascii = Array.from(row)
      .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'))
      .join('');

    lines.push(`${offsetHex}  ${hexOf(0, 8)}  ${hexOf(8, 16)}  |${ascii}|`);
  }
  return lines.join('\n');
}

// バイト数を人間が読みやすい単位に変換する
function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return `${bytes} B`;
}

// バイト列（Uint8Array）から表示用のダンプ結果一式を組み立てる（4096バイトを超える分は切り詰める）
function buildDumpResult(bytes) {
  const totalLength = bytes.length;
  const truncated = totalLength > MAX_BYTES;
  const shown = truncated ? bytes.subarray(0, MAX_BYTES) : bytes;
  return {
    text: formatHexDump(shown),
    totalLength,
    shownLength: shown.length,
    truncated,
  };
}

// すべての処理はブラウザ内（JavaScript）で完結し、入力データがサーバーへ送信されることはない
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">入力</span>
        <div class="pane-actions">
          <button class="btn btn-secondary hex-mode-btn active" id="hex-mode-text-btn">📝 テキスト入力</button>
          <button class="btn btn-secondary hex-mode-btn" id="hex-mode-file-btn">📁 ファイルアップロード</button>
        </div>
      </div>
      <div class="pane-body">
        <div id="hex-text-area">
          <textarea id="hex-text-input" placeholder="16進ダンプにしたいテキストを入力..."></textarea>
          <div class="tool-actions">
            <button class="btn btn-primary" id="hex-generate-text">🧬 ダンプ生成</button>
            <button class="btn btn-secondary" id="hex-clear-text">クリア</button>
          </div>
        </div>
        <div id="hex-file-area" style="display:none">
          <div class="img-b64-dropzone" id="hex-dropzone">
            <div class="dropzone-content">
              <div class="dropzone-icon">📄</div>
              <p>ここにファイルをドラッグ＆ドロップ</p>
              <span class="dropzone-sub">またはクリックしてファイルを選択（先頭 ${MAX_BYTES.toLocaleString()} バイトまで表示）</span>
              <input type="file" id="hex-file-input" class="dropzone-input" />
            </div>
          </div>
          <div class="img-meta" id="hex-file-meta" style="display:none"></div>
        </div>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">HEXダンプ結果</span>
        <div class="pane-actions">
          <button class="btn-icon" id="hex-copy" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="hex-dump-box">
          <pre class="hex-dump-pre" id="hex-output">ここに結果が表示されます</pre>
        </div>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="hex-status-dot"></span>
        <span id="hex-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const modeTextBtn = document.getElementById('hex-mode-text-btn');
    const modeFileBtn = document.getElementById('hex-mode-file-btn');
    const textArea = document.getElementById('hex-text-area');
    const fileArea = document.getElementById('hex-file-area');

    const textInput = document.getElementById('hex-text-input');
    const generateTextBtn = document.getElementById('hex-generate-text');
    const clearTextBtn = document.getElementById('hex-clear-text');

    const dropzone = document.getElementById('hex-dropzone');
    const fileInput = document.getElementById('hex-file-input');
    const fileMeta = document.getElementById('hex-file-meta');

    const output = document.getElementById('hex-output');
    const copyBtn = document.getElementById('hex-copy');
    const status = document.getElementById('hex-status');
    const statusDot = document.getElementById('hex-status-dot');

    // モード切り替え（テキスト入力 / ファイルアップロード）
    function setMode(mode) {
      const isText = mode === 'text';
      modeTextBtn.classList.toggle('active', isText);
      modeFileBtn.classList.toggle('active', !isText);
      textArea.style.display = isText ? '' : 'none';
      fileArea.style.display = isText ? 'none' : '';
    }
    modeTextBtn.addEventListener('click', () => setMode('text'));
    modeFileBtn.addEventListener('click', () => setMode('file'));

    function setStatus(text, isError = false) {
      status.textContent = text;
      statusDot.className = isError ? 'status-dot error' : 'status-dot';
    }

    function renderDump(bytes) {
      if (!bytes.length) {
        output.textContent = 'ここに結果が表示されます';
        setStatus('準備完了');
        return;
      }
      const result = buildDumpResult(bytes);
      output.textContent = result.text;
      if (result.truncated) {
        setStatus(
          `ダンプ生成完了 — 全 ${result.totalLength.toLocaleString()} バイト中、先頭 ${result.shownLength.toLocaleString()} バイトのみ表示（${MAX_BYTES.toLocaleString()} バイト上限）`
        );
      } else {
        setStatus(`ダンプ生成完了 — 全 ${result.totalLength.toLocaleString()} バイト`);
      }
    }

    // テキスト入力モード: UTF-8バイト列に変換してダンプ生成
    generateTextBtn.addEventListener('click', () => {
      const text = textInput.value;
      if (!text) {
        output.textContent = 'ここに結果が表示されます';
        setStatus('入力が空です', true);
        return;
      }
      const bytes = new TextEncoder().encode(text);
      renderDump(bytes);
    });

    clearTextBtn.addEventListener('click', () => {
      textInput.value = '';
      output.textContent = 'ここに結果が表示されます';
      setStatus('準備完了');
    });

    // ファイルアップロードモード: FileReaderでバイナリ読み込み
    function processFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const bytes = new Uint8Array(reader.result);
        fileMeta.style.display = '';
        fileMeta.innerHTML = `
          <span>${file.name}</span>
          <span>${formatSize(file.size)}</span>
          <span>${bytes.length.toLocaleString()} バイト</span>
        `;
        renderDump(bytes);
      };
      reader.onerror = () => {
        showToast('ファイルの読み込みに失敗しました', 'error');
        setStatus('エラー: ファイルの読み込みに失敗しました', true);
      };
      reader.readAsArrayBuffer(file);
    }

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) processFile(e.target.files[0]);
    });
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
    });

    // 結果全体をコピー
    copyBtn.addEventListener('click', () => {
      if (output.textContent && output.textContent !== 'ここに結果が表示されます') {
        copyToClipboard(output.textContent);
      }
    });
  }, 0);

  return widget;
}
