import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown } from '../src/tools/markdown-renderer.js';

test('見出し・強調・リスト・引用・区切りを表示する', () => {
    assert.equal(parseMarkdown('# 見出し\n\n## 二段\n### 三段\n**太字** *斜体* ***両方***\n- 一つ\n- 二つ\n> 引用\n---'),
        '<h1>見出し</h1>\n<h2>二段</h2>\n<h3>三段</h3>\n<p><strong>太字</strong> <em>斜体</em> <strong><em>両方</em></strong></p>\n<ul><li>一つ</li><li>二つ</li></ul>\n<blockquote>引用</blockquote>\n<hr>');
});

test('コード内の記法を再変換せず、タグと引用符をエスケープする', () => {
    const source = '```html\n<img src="https://example.com/x" onerror="alert(1)">\n**literal** &\n```\n`<b> & **text**`';
    const html = parseMarkdown(source);
    assert.equal(html, '<pre><code>&lt;img src=&quot;https://example.com/x&quot; onerror=&quot;alert(1)&quot;&gt;\n**literal** &amp;</code></pre>\n<p><code>&lt;b&gt; &amp; **text**</code></p>');
    assert.doesNotMatch(html, /<img|<b>|<strong>/);
});

for (const source of [
    '<script>alert(1)</script>', '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>', '<iframe src="https://example.com">',
    '<style>@import "https://example.com";</style>', '<form action="https://example.com"><input autofocus onfocus=alert(1)>',
    '</textarea><img src=x onerror=alert(1)>', '<a href="javascript:alert(1)" onclick="alert(1)">x</a>',
    '<math><mtext><img src=x onerror=alert(1)>',
]) {
    test(`生HTMLは実行可能なタグにしない: ${source}`, () => {
        const html = parseMarkdown(source);
        assert.ok(html.includes('&lt;'));
        assert.doesNotMatch(html, /<(?:script|img|svg|iframe|style|form|input|a\b|math)/i);
    });
}

for (const url of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)', 'file:///tmp/file', 'blob:https://example.com/id', 'mailto:person@example.com',
    'java\tscript:alert(1)', 'java\nscript:alert(1)', '\\evil.example/x', 'https://example.com/" onmouseover="alert(1)']) {
    test(`危険または対象外のURLをリンクにしない: ${JSON.stringify(url)}`, () => {
        const html = parseMarkdown(`[表示](${url})`);
        assert.doesNotMatch(html, /<a\b/);
        assert.doesNotMatch(html, /<(?:script|img|iframe)\b/i);
    });
}

for (const url of ['https://example.com/path?q=1&x=2', 'http://example.com/', '/about/', '../guide.md', 'guide.md', '#section', '?query=test']) {
    test(`通常のリンクを保ち、別タブから元ページへアクセスさせない: ${url}`, () => {
        const html = parseMarkdown(`[ガイド](${url})`);
        assert.match(html, /<a href="/);
        assert.match(html, /rel="noopener noreferrer"/);
        assert.match(html, />ガイド<\/a>/);
        assert.ok(!html.includes('q=1&x=2'));
    });
}

test('URLやラベル内のHTML実体・引用符から属性を注入できない', () => {
    const html = parseMarkdown('[<img src=x onerror=alert>](https://example.com/"onclick="x)\n[x](javascript&#58;alert)');
    assert.match(html, /href="https:\/\/example.com\/&quot;onclick=&quot;x"/);
    assert.match(html, /&lt;img/);
    assert.match(html, /javascript&amp;#58;/);
    assert.doesNotMatch(html, /<img|"onclick="/);
});

for (const url of ['https://example.com/private.png', '//example.com/private.png', 'data:image/svg+xml,<svg onload=alert(1)>', '/local.png']) {
    test(`画像URLを読み込まず代替テキストを表示: ${url}`, () => {
        const html = parseMarkdown(`![画像 <b>説明</b>](${url})`);
        assert.match(html, /画像 &lt;b&gt;説明&lt;\/b&gt;/);
        assert.match(html, /自動読込なし/);
        assert.doesNotMatch(html, /<(?:img|svg|a)\b|\bsrc=/i);
        assert.ok(!html.includes('example.com'));
    });
}

test('空入力、CRLF、未閉鎖コードを扱える', () => {
    assert.equal(parseMarkdown(''), '');
    assert.equal(parseMarkdown('# 見出し\r\n本文'), '<h1>見出し</h1>\n<p>本文</p>');
    assert.equal(parseMarkdown('```\n**literal**'), '<pre><code>**literal**</code></pre>');
});

test('リンクラベルの太字とコードを保ち、リンクを入れ子にしない', () => {
    const html = parseMarkdown('[**重要**](https://example.com) [説明 `code`](https://example.com)');
    assert.match(html, /><strong>重要<\/strong><\/a>/);
    assert.match(html, />説明 <code>code<\/code><\/a>/);
    assert.equal((html.match(/<a /g) || []).length, 2);
    assert.doesNotMatch(html, /<a[^>]*>[^<]*<a/);
});

test('閉じていない角括弧の大きな入力を文字として保持する', () => {
    const input = '['.repeat(100000);
    assert.equal(parseMarkdown(input), '<p>' + input + '</p>');
    const unfinished = input + '](https://example.com';
    assert.equal(parseMarkdown(unfinished), '<p>' + unfinished + '</p>');
    for (const pattern of ['[](', '[x](', '![x](']) {
        const urlUnclosed = pattern.repeat(25000);
        const start = performance.now();
        assert.equal(parseMarkdown(urlUnclosed), '<p>' + urlUnclosed + '</p>');
        // 大量貼付けで同期処理が秒単位に停止する退行を検出する。通常は数ms。
        assert.ok(performance.now() - start < 1000, '未閉鎖URLの処理が1秒を超えました');
    }
});
