import { copyToClipboard, showToast } from '../utils.js';

// 全角・半角変換 — インタラクティブなツール部分のみを描画する
// （ページの見出し・記事はテンプレート側が担当）

// 半角カタカナ → 全角カタカナ（濁点なしの基本対応表）
const HAN_TO_ZEN_KATA = {
  'ｦ': 'ヲ', 'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
  'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ', 'ｯ': 'ッ', 'ｰ': 'ー',
  'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
  'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
  'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
  'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
  'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
  'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
  'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
  'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
  'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
  'ﾜ': 'ワ', 'ﾝ': 'ン',
  'ﾞ': '゛', 'ﾟ': '゜', '｡': '。', '｢': '「', '｣': '」', '､': '、', '･': '・',
};

// 半角カタカナ + 濁点（ﾞ）→ 合成済みの全角カタカナ
const HAN_TO_ZEN_DAKUTEN = {
  'ｶ': 'ガ', 'ｷ': 'ギ', 'ｸ': 'グ', 'ｹ': 'ゲ', 'ｺ': 'ゴ',
  'ｻ': 'ザ', 'ｼ': 'ジ', 'ｽ': 'ズ', 'ｾ': 'ゼ', 'ｿ': 'ゾ',
  'ﾀ': 'ダ', 'ﾁ': 'ヂ', 'ﾂ': 'ヅ', 'ﾃ': 'デ', 'ﾄ': 'ド',
  'ﾊ': 'バ', 'ﾋ': 'ビ', 'ﾌ': 'ブ', 'ﾍ': 'ベ', 'ﾎ': 'ボ',
  'ｳ': 'ヴ', 'ﾜ': 'ヷ', 'ｦ': 'ヺ',
};

// 半角カタカナ + 半濁点（ﾟ）→ 合成済みの全角カタカナ
const HAN_TO_ZEN_HANDAKUTEN = {
  'ﾊ': 'パ', 'ﾋ': 'ピ', 'ﾌ': 'プ', 'ﾍ': 'ペ', 'ﾎ': 'ポ',
};

// 全角カタカナ → 半角カタカナの逆引き表（濁点付きは「ｶﾞ」のように2文字へ分解）
const ZEN_TO_HAN_KATA = {};
for (const [han, zen] of Object.entries(HAN_TO_ZEN_KATA)) ZEN_TO_HAN_KATA[zen] = han;
for (const [han, zen] of Object.entries(HAN_TO_ZEN_DAKUTEN)) ZEN_TO_HAN_KATA[zen] = han + 'ﾞ';
for (const [han, zen] of Object.entries(HAN_TO_ZEN_HANDAKUTEN)) ZEN_TO_HAN_KATA[zen] = han + 'ﾟ';

// 全角 → 半角。opts は { alpha, num, symbol, kana, space } の真偽値
// 戻り値: { text: 変換後文字列, changed: 変換した文字数 }
export function zenToHan(text, opts) {
  let result = '';
  let changed = 0;
  for (const ch of text) {
    let out = ch;
    const code = ch.codePointAt(0);
    if (code >= 0xff01 && code <= 0xff5e) {
      // 全角英数記号（U+FF01〜FF5E）は 0xFEE0 引くと対応する半角（U+0021〜007E）になる
      const half = String.fromCharCode(code - 0xfee0);
      if (/[A-Za-z]/.test(half)) {
        if (opts.alpha) out = half;
      } else if (/[0-9]/.test(half)) {
        if (opts.num) out = half;
      } else if (opts.symbol) {
        out = half;
      }
    } else if (ch === '　') {
      if (opts.space) out = ' ';
    } else if (opts.kana && ZEN_TO_HAN_KATA[ch]) {
      out = ZEN_TO_HAN_KATA[ch];
    }
    if (out !== ch) changed++;
    result += out;
  }
  return { text: result, changed };
}

// 半角 → 全角。濁点・半濁点（ｶ + ﾞ → ガ）は1文字に合成する
export function hanToZen(text, opts) {
  const chars = [...text];
  let result = '';
  let changed = 0;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    let out = ch;
    let consumed = 1;
    const code = ch.charCodeAt(0);
    if (code >= 0x21 && code <= 0x7e) {
      // 半角英数記号は 0xFEE0 足すと対応する全角になる
      const full = String.fromCharCode(code + 0xfee0);
      if (/[A-Za-z]/.test(ch)) {
        if (opts.alpha) out = full;
      } else if (/[0-9]/.test(ch)) {
        if (opts.num) out = full;
      } else if (opts.symbol) {
        out = full;
      }
    } else if (ch === ' ') {
      if (opts.space) out = '　';
    } else if (opts.kana && HAN_TO_ZEN_KATA[ch]) {
      const next = chars[i + 1];
      if (next === 'ﾞ' && HAN_TO_ZEN_DAKUTEN[ch]) {
        out = HAN_TO_ZEN_DAKUTEN[ch];
        consumed = 2;
      } else if (next === 'ﾟ' && HAN_TO_ZEN_HANDAKUTEN[ch]) {
        out = HAN_TO_ZEN_HANDAKUTEN[ch];
        consumed = 2;
      } else {
        out = HAN_TO_ZEN_KATA[ch];
      }
    }
    if (out !== ch) changed += consumed;
    result += out;
    i += consumed - 1;
  }
  return { text: result, changed };
}

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">入力</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="zh-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="zh-input" placeholder="変換したいテキストを貼り付けてください...&#10;例: ＡＢＣ１２３ ﾃﾞﾝﾜﾊﾞﾝｺﾞｳ"></textarea>
      </div>
      <div class="tool-actions" style="flex-wrap:wrap;">
        <label class="pw-option"><input type="checkbox" id="zh-alpha" checked /> 英字</label>
        <label class="pw-option"><input type="checkbox" id="zh-num" checked /> 数字</label>
        <label class="pw-option"><input type="checkbox" id="zh-symbol" checked /> 記号</label>
        <label class="pw-option"><input type="checkbox" id="zh-kana" checked /> カタカナ</label>
        <label class="pw-option"><input type="checkbox" id="zh-space" checked /> スペース</label>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="zh-to-han">全角 → 半角</button>
        <button class="btn btn-primary" id="zh-to-zen">半角 → 全角</button>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">結果</span>
        <div class="pane-actions">
          <button class="btn-icon" id="zh-copy" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="zh-output" readonly placeholder="変換結果がここに表示されます..."></textarea>
      </div>
      <div class="tool-actions">
        <button class="btn btn-secondary" id="zh-send-back">← 結果を入力に戻す</button>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="zh-status-dot"></span>
        <span id="zh-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('zh-input');
    const output = document.getElementById('zh-output');
    const status = document.getElementById('zh-status');
    const statusDot = document.getElementById('zh-status-dot');

    // チェックボックスの状態を変換オプションとしてまとめる
    function getOpts() {
      return {
        alpha: document.getElementById('zh-alpha').checked,
        num: document.getElementById('zh-num').checked,
        symbol: document.getElementById('zh-symbol').checked,
        kana: document.getElementById('zh-kana').checked,
        space: document.getElementById('zh-space').checked,
      };
    }

    function convert(fn, label) {
      const { text, changed } = fn(input.value, getOpts());
      output.value = text;
      status.textContent =
        changed > 0 ? `${label}完了 — ${changed} 文字を変換しました` : '変換対象の文字がありませんでした';
      statusDot.className = 'status-dot';
    }

    document.getElementById('zh-to-han').addEventListener('click', () => convert(zenToHan, '全角 → 半角'));
    document.getElementById('zh-to-zen').addEventListener('click', () => convert(hanToZen, '半角 → 全角'));

    document.getElementById('zh-send-back').addEventListener('click', () => {
      if (!output.value) {
        showToast('結果がありません', 'error');
        return;
      }
      // オプションを変えて再変換できるよう、結果を入力欄へ戻す
      input.value = output.value;
      output.value = '';
      status.textContent = '結果を入力に戻しました';
      statusDot.className = 'status-dot';
    });

    document.getElementById('zh-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });

    document.getElementById('zh-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      status.textContent = '準備完了';
      statusDot.className = 'status-dot';
    });
  }, 0);

  return widget;
}
