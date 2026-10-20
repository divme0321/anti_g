import test from 'node:test';
import assert from 'node:assert/strict';
import { tools, toolMap } from '../src/content/tools/index.js';
import { toolPage, aboutPage, privacyPage } from '../src/templates/pages.js';

const changedTools = 'jwt-decoder password-strength-checker csv-json-converter diff-checker markdown-preview markdown-to-text markdown-table-generator slug-generator hash-generator word-counter line-sorter sql-formatter zenkaku-hankaku hex-dump-viewer css-minifier cidr-calculator yaml-json-converter image-base64 qr-code-reader json-to-typescript text-case-converter meta-tag-generator url-encoder image-compressor'.split(' ');

for (const slug of changedTools) {
    test(`${slug}: 本文とFAQが秘密情報の入力を勧めず、注意を案内する`, () => {
        const tool = toolMap[slug];
        const copy = [tool.description, tool.lead, tool.article, ...tool.faq.map(faq => faq.a)].join('\n');
        assert.doesNotMatch(copy, /(?:実環境のトークン|実際に(?:使っている|使用している)パスワード).*?(?:安心|安全)/);
        assert.doesNotMatch(copy, /(?:機密|認証情報|顧客情報|個人情報|社内データ|社外秘).*?安心/);
        assert.doesNotMatch(copy, /どこにも送信|一切送信|一切ありません/);
        assert.match(tool.article, /ダミーデータ/);
        const faq = tool.faq.find(faq => faq.q.includes('入力データの取り扱い'));
        assert.ok(faq);
        assert.match(faq.a, /使用中のパスワードは入力しない/);
        // 表示FAQと構造化データを同じ更新内容に保つ。
        const page = toolPage(slug);
        const schema = page.meta.jsonLd.find(item => item['@type'] === 'FAQPage');
        assert.equal(schema.mainEntity.find(item => item.name === faq.q).acceptedAnswer.text, faq.a);
    });
}

test('全ツールで入力領域の手前に注意とprivacyリンクが静的に表示される', () => {
    assert.equal(tools.length, 46);
    for (const tool of tools) {
        const html = toolPage(tool.slug).html;
        const note = html.indexOf('class="tool-input-note"');
        assert.ok(note > 0 && note < html.indexOf('id="tool-root"'));
        assert.match(html.slice(note, html.indexOf('id="tool-root"')), /href="\/privacy\/"/);
        assert.match(html, /<article class="article">/);
    }
});

test('共通説明は外部読込と計算を区別し、既存の広告Cookie案内を保つ', () => {
    const privacy = privacyPage().html;
    assert.match(privacy, /Google AdSenseの導入を予定/);
    assert.match(privacy, /広告配信開始後/);
    assert.match(privacy, /第三者配信事業者がCookieを使用/);
    assert.match(privacy, /Googleの広告設定/);
    assert.match(privacy, /WebChoices/);
    assert.match(privacy, /外部通信が発生しないこと.*保証するものではありません/);
    assert.match(privacy, /Google Fonts/);
    assert.match(privacy, /外部CDN/);
    assert.match(privacy, /画面テーマ/);
    assert.doesNotMatch(privacy + aboutPage().html, /一切ありません|個人を特定する情報は収集しません|入力データを外部サーバーへ送信しません/);
});

test('メタタグ生成の画像URL説明は実装のHTTP/HTTPS対応と一致する', () => {
    const content = toolMap['meta-tag-generator'];
    assert.match(content.article, /HTTP\/HTTPSの絶対URL/);
    assert.match(content.article, /公開用途ではHTTPSを推奨/);
    assert.match(content.faq.find(faq => faq.q.includes('OGP画像')).a, /HTTP\/HTTPSの絶対画像URL/);
});
