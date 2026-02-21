import { copyToClipboard } from '../main.js';

const HTML_ENTITIES = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    '©': '&copy;', '®': '&reg;', '™': '&trade;', '€': '&euro;', '£': '&pound;',
    '¥': '&yen;', '¢': '&cent;', '§': '&sect;', '¶': '&para;', '†': '&dagger;',
    '‡': '&Dagger;', '•': '&bull;', '…': '&hellip;', '—': '&mdash;', '–': '&ndash;',
    ' ': '&nbsp;', '«': '&laquo;', '»': '&raquo;', '±': '&plusmn;', '×': '&times;',
    '÷': '&divide;', '°': '&deg;', '¹': '&sup1;', '²': '&sup2;', '³': '&sup3;',
};

const REVERSE_ENTITIES = Object.fromEntries(Object.entries(HTML_ENTITIES).map(([k, v]) => [v, k]));

export function renderHtmlEntities() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>HTML Entity Encoder / Decoder</span>
      </div>
      <h1>HTML Entity Encoder / Decoder</h1>
      <p>Convert special characters to HTML entities and vice versa. Essential for safely embedding content in HTML.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Input</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="html-clear">Clear</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="html-input" placeholder='Enter text like <div class="test"> or &amp;copy; to encode/decode...'></textarea>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="html-encode">Encode →</button>
          <button class="btn btn-primary" id="html-decode">← Decode</button>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Output</span>
          <div class="pane-actions">
            <button class="btn btn-secondary" id="html-copy">Copy</button>
          </div>
        </div>
        <div class="pane-body">
          <textarea id="html-output" readonly placeholder="Result will appear here..."></textarea>
        </div>
      </div>
    </div>
    <div class="tool-info">
      <h2>What are HTML Entities?</h2>
      <p>HTML entities are special codes used to represent characters that have a reserved meaning in HTML, or characters that are not easily typed on a keyboard. They begin with an ampersand (&) and end with a semicolon (;).</p>
      <h3>Why Use HTML Entities?</h3>
      <ul>
        <li><strong>Security (XSS Prevention):</strong> Encoding user input prevents Cross-Site Scripting (XSS) attacks where malicious HTML/JavaScript could be injected.</li>
        <li><strong>Display Special Characters:</strong> Characters like <, >, and & have special meaning in HTML. To display them literally, you must use entities.</li>
        <li><strong>Non-ASCII Characters:</strong> Represent symbols like © (copyright), ® (registered), € (euro) reliably across different character encodings.</li>
      </ul>
      <h3>Common HTML Entities</h3>
      <ul>
        <li><code>&amp;lt;</code> → < (less than)</li>
        <li><code>&amp;gt;</code> → > (greater than)</li>
        <li><code>&amp;amp;</code> → & (ampersand)</li>
        <li><code>&amp;quot;</code> → " (double quote)</li>
        <li><code>&amp;copy;</code> → © (copyright)</li>
        <li><code>&amp;nbsp;</code> → non-breaking space</li>
      </ul>
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

    return page;
}
