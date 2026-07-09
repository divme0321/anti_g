import { copyToClipboard } from '../utils.js';

const HTML_ENTITIES = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    '©': '&copy;', '®': '&reg;', '™': '&trade;', '€': '&euro;', '£': '&pound;',
    '¥': '&yen;', '¢': '&cent;', '§': '&sect;', '¶': '&para;', '†': '&dagger;',
    '‡': '&Dagger;', '•': '&bull;', '…': '&hellip;', '—': '&mdash;', '–': '&ndash;',
    ' ': '&nbsp;', '«': '&laquo;', '»': '&raquo;', '±': '&plusmn;', '×': '&times;',
    '÷': '&divide;', '°': '&deg;', '¹': '&sup1;', '²': '&sup2;', '³': '&sup3;',
};

const REVERSE_ENTITIES = Object.fromEntries(Object.entries(HTML_ENTITIES).map(([k, v]) => [v, k]));

export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">入力</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="html-clear">クリア</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="html-input" placeholder='<div class="test"> や &amp;copy; などのテキストを入力してエンコード/デコード...'></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="html-encode">エンコード →</button>
          <button class="btn btn-primary" id="html-decode">← デコード</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">出力</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="html-copy">コピー</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="html-output" readonly placeholder="結果がここに表示されます..."></textarea>
        </div>
      </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('html-input');
        const output = document.getElementById('html-output');

        document.getElementById('html-encode').addEventListener('click', () => {
            let text = input.value;
            // Encode known entities
            text = text.replace(/[&<>"'©®™€£¥¢§¶†‡•…—– «»±×÷°¹²³]/g, ch => HTML_ENTITIES[ch] || ch);
            // Encode remaining non-ASCII as numeric entities
            text = text.replace(/[^\x00-\x7F]/g, ch => '&#' + ch.charCodeAt(0) + ';');
            output.value = text;
        });

        document.getElementById('html-decode').addEventListener('click', () => {
            let text = input.value;
            // Decode named entities
            text = text.replace(/&\w+;/g, entity => REVERSE_ENTITIES[entity] || entity);
            // Decode numeric entities
            text = text.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
            text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
            output.value = text;
        });

        document.getElementById('html-clear').addEventListener('click', () => {
            input.value = '';
            output.value = '';
        });
        document.getElementById('html-copy').addEventListener('click', () => {
            if (output.value) copyToClipboard(output.value);
        });
    }, 0);

    return widget;
}
