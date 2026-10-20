import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMetaTags, validateMetaUrl, render } from '../src/tools/meta-tag-generator.js';

test('通常のページ情報は従来どおりのメタタグになる', () => {
    assert.equal(buildMetaTags({ title: 'サンプル', desc: '説明', url: 'https://example.com/page', image: 'https://example.com/image.jpg', keywords: 'web,tool', author: '作成者', robots: 'noindex, follow', ogType: 'article', twitter: '@example' }),
        '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>サンプル</title>\n<meta name="description" content="説明">\n<meta name="keywords" content="web,tool">\n<meta name="author" content="作成者">\n<meta name="robots" content="noindex, follow">\n\n<!-- Open Graph / Facebook -->\n<meta property="og:type" content="article">\n<meta property="og:title" content="サンプル">\n<meta property="og:description" content="説明">\n<meta property="og:url" content="https://example.com/page">\n<meta property="og:image" content="https://example.com/image.jpg">\n\n<!-- Twitter -->\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="サンプル">\n<meta name="twitter:description" content="説明">\n<meta name="twitter:image" content="https://example.com/image.jpg">\n<meta name="twitter:site" content="@example">\n');
});

for (const value of ['https://example.com/image.png?a=1&b=2', 'http://example.com/image.png', 'HTTPS://EXAMPLE.COM/image.png', 'https://example.com/%22%20onerror%3Dx', 'https://example.com/画像.png', 'https://[::1]/image.png']) {
    test(`HTTP/HTTPSのURLを保持する: ${value}`, () => {
        const result = validateMetaUrl(value);
        assert.equal(result.error, '');
        assert.equal(result.value, value);
        assert.equal(result.hostname, new URL(value).hostname);
    });
}

for (const value of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>', 'data:image/png;base64,aGVsbG8=', 'blob:https://example.com/id', 'file:///tmp/file', '//example.com/image.png', '/image.png', 'https://', 'https://[', 'https://example.com/"onerror="alert(1)', "https://example.com/'onload='alert(1)", 'https://example.com/<img>', 'https://example.com/`', 'https://example.com/ space', 'https://example.com/\nnext', 'https://example.com/\rnext', 'https://example.com/\tnext', 'https://example.com/\0next', 'https://example.com/\x7fnext', 'https://example.com/\\path', 'https://user:pass@example.com/image.png', ' https://example.com/image.png', 'https://example.com/image.png ']) {
    test(`危険・不完全なURLを画像と生成コードに使わない: ${JSON.stringify(value)}`, () => {
        const result = validateMetaUrl(value);
        assert.equal(result.value, '');
        assert.ok(result.error.length > 0);
        const html = buildMetaTags({ title: '残す', url: value, image: value });
        assert.match(html, /<title>残す<\/title>/);
        assert.doesNotMatch(html, /property="og:(?:url|image)"|name="twitter:image"/);
        assert.match(html, /name="twitter:card" content="summary"/);
    });
}

test('ページURLのスキーム省略をHTTPSで補い、画像URLは明示を求める', () => {
    assert.equal(validateMetaUrl('example.com/page', true).value, 'https://example.com/page');
    assert.match(buildMetaTags({ url: 'example.com/page' }), /property="og:url" content="https:\/\/example.com\/page"/);
    assert.ok(validateMetaUrl('example.com/image.png').error);
    assert.equal(validateMetaUrl('').error, '');
    assert.doesNotMatch(buildMetaTags(), /og:image|twitter:image/);
});

test('すべてのテキスト出力で引用符・タグ・改行・タブをエスケープする', () => {
    const value = '</title><img src=x onerror="alert(1)">\'&\r\n\t';
    const html = buildMetaTags({ title: value, desc: value, keywords: value, author: value, robots: value, ogType: value, twitter: value });
    assert.doesNotMatch(html, /<img|<script|onerror="|\r|\t/);
    assert.match(html, /&lt;\/title&gt;&lt;img/);
    assert.match(html, /&quot;/);
    assert.match(html, /&#39;&amp;&#13;&#10;&#9;/);
});

test('HTML実体を再解釈させず、URLのアンパサンドを正しく出力する', () => {
    const html = buildMetaTags({ title: '&lt;script&gt;', url: 'https://example.com/?a=1&b=2', image: 'https://example.com/&quot;onerror=alert' });
    assert.match(html, /<title>&amp;lt;script&amp;gt;<\/title>/);
    assert.match(html, /content="https:\/\/example.com\/\?a=1&amp;b=2"/);
    assert.match(html, /content="https:\/\/example.com\/&amp;quot;onerror=alert"/);
});

test('実際の入力・プレビュー・コピー・エラー回復のイベント経路を保つ', async t => {
    class Element {
        constructor() { this.value = ''; this.style = {}; this.dataset = {}; this.children = []; this.attributes = {}; this.listeners = {}; this._text = ''; }
        setAttribute(name, value) { this.attributes[name] = value; }
        addEventListener(type, fn) { this.listeners[type] = fn; }
        querySelector(selector) { return get(selector); }
        querySelectorAll() { return inputs; }
        replaceChildren(...children) { this.children = children; }
        set textContent(value) { this._text = value; this.children = []; }
        get textContent() { return this._text; }
        get firstChild() { return this.children[0]; }
        remove() {}
    }
    const elements = new Map();
    const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
    const ids = ['meta-title', 'meta-desc', 'meta-url', 'meta-image', 'meta-keywords', 'meta-author', 'meta-robots', 'meta-og-type', 'meta-twitter-handle'];
    const inputs = ids.map(get);
    get('meta-robots').value = 'index, follow';
    get('meta-og-type').value = 'website';
    const original = new Map(['document', 'navigator'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
    t.after(() => { for (const [name, descriptor] of original) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } });
    const timers = [];
    t.mock.method(globalThis, 'setTimeout', callback => { timers.push(callback); return 0; });
    let copied = '';
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => new Element(), getElementById: get, querySelector: () => null, body: { appendChild() {} } } });
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async value => { copied = value; } } } });
    render();
    timers.shift()();
    const set = (id, value) => { get(id).value = value; get(id).listeners.input(); };
    set('meta-title', 'タイトル');
    set('meta-url', 'example.com/page');
    set('meta-image', 'https://example.com/image.png');
    const image = get('meta-sp-image').firstChild;
    assert.equal(image.src, 'https://example.com/image.png');
    assert.equal(image.referrerPolicy, 'no-referrer');
    assert.equal(image.attributes.onerror, undefined);
    assert.equal(get('.meta-sp-domain').textContent, 'example.com');
    set('meta-desc', '説明を更新');
    assert.equal(get('meta-sp-image').firstChild, image, '他の欄の入力で画像を再生成しない');
    set('meta-url', 'https://[');
    set('meta-image', 'javascript:alert(1)');
    assert.equal(get('meta-image').attributes['aria-invalid'], 'true');
    assert.ok(get('meta-image-error').textContent);
    assert.equal(get('meta-sp-image').children.length, 0);
    assert.match(get('meta-output').textContent, /説明を更新/);
    assert.doesNotMatch(get('meta-output').textContent, /og:url|og:image/);
    set('meta-url', 'https://example.com/new');
    set('meta-image', 'https://example.com/new.png');
    const replacement = get('meta-sp-image').firstChild;
    image.listeners.error();
    assert.equal(get('meta-sp-image').firstChild, replacement, '古い画像のエラーが新しいプレビューを消さない');
    get('meta-copy').listeners.click();
    await Promise.resolve();
    assert.equal(copied, get('meta-output').textContent);
    assert.equal(get('meta-image').attributes['aria-invalid'], 'false');
    assert.equal(get('meta-url-error').textContent, '');
    replacement.listeners.error();
    assert.match(get('meta-sp-image').textContent, /画像を読み込めません/);
    set('meta-image', '');
    assert.match(get('meta-sp-image').textContent, /画像未設定/);
    assert.match(get('meta-output').textContent, /twitter:card" content="summary"/);
});
