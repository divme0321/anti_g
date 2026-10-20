// 入力からHTML属性やタグを直接作らず、対応するMarkdown記法だけを生成する。
const escapeHTML = value => value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

function safeHref(value) {
    // URL内の制御文字・空白・バックスラッシュによる解釈の揺れを避ける。
    if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return null;
    try {
        const url = new URL(value, 'https://markdown.invalid/');
        if (!['http:', 'https:'].includes(url.protocol)) return null;
        return value;
    } catch {
        return null;
    }
}

function inline(source, depth = 0, allowLinks = true) {
    if (depth > 8) return escapeHTML(source);
    let output = '';
    for (let index = 0; index < source.length;) {
        const rest = source.slice(index);
        let match;
        if (source[index] === '`' && (match = /^`([^`]+)`/.exec(rest))) {
            output += `<code>${escapeHTML(match[1])}</code>`;
        } else if (allowLinks && (source[index] === '[' || (source[index] === '!' && source[index + 1] === '['))) {
            const image = source[index] === '!';
            const start = index + (image ? 2 : 1);
            const labelEnd = source.indexOf(']', start);
            const urlStart = labelEnd + 2;
            const urlEnd = labelEnd >= 0 && source[labelEnd + 1] === '(' ? source.indexOf(')', urlStart) : -1;
            // 不完全なラベル・URLはまとめて文字として扱い、同じ末尾を再探索しない。
            if (labelEnd < 0 || (source[labelEnd + 1] === '(' && urlEnd < 0)) {
                output += escapeHTML(rest);
                break;
            }
            if (urlEnd < 0) {
                output += escapeHTML(source.slice(index, labelEnd + 1));
                index = labelEnd + 1;
                continue;
            }
            const text = source.slice(start, labelEnd);
            const url = source.slice(urlStart, urlEnd);
            if (image) {
                // data:やSVGを含め、画像からの通信・スクリプト実行を許可しない。
                output += `<span class="md-image-placeholder">[画像: ${escapeHTML(text || '代替テキストなし')}（自動読込なし）]</span>`;
            } else {
                const href = safeHref(url);
                const label = inline(text || url, depth + 1, false);
                output += href ? `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${label}</a>` : label;
            }
            index = urlEnd + 1;
            continue;
        } else if (source[index] === '*' && (match = /^(\*{1,3})([^*]+)\1/.exec(rest))) {
            const tags = { 1: ['em', 'em'], 2: ['strong', 'strong'], 3: ['strong><em', 'em></strong'] };
            const [open, close] = tags[match[1].length];
            output += `<${open}>${inline(match[2], depth + 1, allowLinks)}</${close}>`;
        } else if (source[index] === '[' || (source[index] === '!' && source[index + 1] === '[')) {
            // 不完全なリンクの同じ長いラベルを、各 '[' から繰り返し探索しない。
            const close = source.indexOf(']', index);
            const end = close < 0 ? source.length : close + 1;
            output += escapeHTML(source.slice(index, end));
            index = end;
            continue;
        } else {
            output += escapeHTML(source[index++]);
            continue;
        }
        index += match[0].length;
    }
    return output;
}

export function parseMarkdown(source) {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const output = [];
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (/^```/.test(line)) {
            const code = [];
            while (++index < lines.length && !/^```\s*$/.test(lines[index])) code.push(lines[index]);
            output.push(`<pre><code>${escapeHTML(code.join('\n'))}</code></pre>`);
        } else if (!line.trim()) {
            continue;
        } else if (/^#{1,3} /.test(line)) {
            const [, marks, text] = /^(#{1,3}) (.*)$/.exec(line);
            output.push(`<h${marks.length}>${inline(text)}</h${marks.length}>`);
        } else if (/^---\s*$/.test(line)) {
            output.push('<hr>');
        } else if (/^[*-] /.test(line)) {
            const items = [];
            do {
                items.push(`<li>${inline(lines[index].slice(2))}</li>`);
                index++;
            } while (index < lines.length && /^[*-] /.test(lines[index]));
            index--;
            output.push(`<ul>${items.join('')}</ul>`);
        } else if (/^> ?/.test(line)) {
            output.push(`<blockquote>${inline(line.replace(/^> ?/, ''))}</blockquote>`);
        } else {
            output.push(`<p>${inline(line)}</p>`);
        }
    }
    return output.join('\n');
}
