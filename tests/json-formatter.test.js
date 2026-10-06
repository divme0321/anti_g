import assert from 'node:assert/strict';
import test from 'node:test';
import { formatJson, render } from '../src/tools/json-formatter.js';
import content from '../src/content/tools/json-formatter.js';

const cases = [
    ['安全な整数の境界', '[9007199254740991,9007199254740992,9007199254740993,-9007199254740993]'],
    ['桁数の多い整数', '{"id":1234567890123456789012345678901234567890}'],
    ['高精度の小数と末尾ゼロ', '[0.123456789012345678901234567890,1.2300,-0.00000000000000000000000001]'],
    ['指数の大文字・符号・先頭ゼロ', '[1e3,1E+03,1e-03,-1.2300E+0010]'],
    ['数値変換でオーバーフロー・アンダーフローする値', '[1e400,-1e400,1e-4000,-1e-4000]'],
    ['負のゼロ', '[-0,-0.0,-0e0,-0E+00]'],
    ['重複キーと数値に見えるキーの順序', '{"2":1,"1":2,"2":9007199254740993,"01":3}'],
    ['特殊なキー', '{"__proto__":{"polluted":true},"constructor":1,"prototype":2}'],
    ['エスケープの表記', String.raw`{"\u0061":"\u0041\/\b\f\n\r\t","quote":"\"","slash":"\\"}`],
    ['文字列内の空白・記号・数値', '{" a b ":" 9007199254740993 { } [ ] , : true null ","line":"a\\nb"}'],
    ['Unicodeとサロゲート', String.raw`{"日本語":"😀　é","escaped":"\ud83d\ude00","lone":"\uD800"}`],
    ['文字列内の行区切りと段落区切り', '"a\u2028b\u2029c"'],
    ['入れ子と空コンテナ', '{"a":[{},[],{"b":[true,false,null,[9007199254740993]]}]}'],
    ['空オブジェクト', '{}'],
    ['空配列', '[]'],
    ['トップレベルnull', 'null'],
    ['トップレベルtrue', 'true'],
    ['トップレベルfalse', 'false'],
    ['トップレベル文字列', '" a b \\n \\" c "'],
    ['トップレベル数値', '9007199254740993'],
];

for (const [name, compact] of cases) {
    test(`${name}: 整形と圧縮を繰り返しても字句が変わらない`, () => {
        const source = ` \t\r\n${compact}\n `;
        const formatted = formatJson(source);
        assert.equal(formatJson(source, true), compact);
        assert.equal(formatJson(formatted, true), compact);
        assert.equal(formatJson(formatted), formatted);
        assert.deepEqual(JSON.parse(formatted), JSON.parse(compact));
    });
}

test('2スペースで整形し、空コンテナに余分な改行を入れない', () => {
    const source = ' { "list" : [ 1 , { "x" : [ ] } , { } ] , "n" : 1.2300E+003 } ';
    const expected = '{\n  "list": [\n    1,\n    {\n      "x": []\n    },\n    {}\n  ],\n  "n": 1.2300E+003\n}';
    assert.equal(formatJson(source), expected);
    assert.equal(formatJson(source, true), '{"list":[1,{"x":[]},{}],"n":1.2300E+003}');
});

const invalid = [
    '', ' \t\r\n', '{', '[', '}', ']', '{"a":1', '[1', '{"a":1}}',
    '[1,]', '{"a":1,}', '[,1]', '[1,,2]', '{,}', '{"a" 1}', '{"a":}',
    '{a:1}', "{'a':1}", 'undefined', 'NaN', 'Infinity', '-Infinity',
    '+1', '01', '-01', '.1', '1.', '1e', '1e+', '1e-', '0x10', '1_000',
    'true false', '{}[]', '[1 2]', '[1:2]', '{"a":1 "b":2}', 'TRUE',
    '// comment\n{}', '{/* comment */}', '"unterminated', '"bad\\x20"',
    '"bad\\u12"', '"bad\\q"', '"line\nbreak"', '"tab\tinside"', '"nul\0inside"',
    '\uFEFF{}', '\u00A0{}', '{\u00A0"a":1}',
];

for (const source of invalid) {
    test(`不正JSONを両モードで拒否する: ${JSON.stringify(source)}`, () => {
        assert.throws(() => formatJson(source), SyntaxError);
        assert.throws(() => formatJson(source, true), SyntaxError);
    });
}

test('深い配列でも独自の再帰呼び出しを使わない', () => {
    const source = '['.repeat(10000) + '9007199254740993' + ']'.repeat(10000);
    assert.equal(formatJson(source, true), source);
    const nested = '['.repeat(100) + '-0' + ']'.repeat(100);
    assert.equal(formatJson(formatJson(nested), true), nested);
});

test('多様な文字列と入れ子を含む400件のJSONが往復できる', () => {
    // 再現可能な疑似乱数で、引用符・バックスラッシュの連続も組み合わせる。
    let seed = 123456789;
    const random = (max) => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed % max;
    };
    const chars = [' ', '\t', '\n', '"', '\\', '[', ']', '{', '}', ':', ',', '日', '😀', '\0'];
    for (let i = 0; i < 400; i++) {
        const text = Array.from({ length: random(80) }, () => chars[random(chars.length)]).join('');
        const value = { [text]: [text, { n: i, empty: {}, list: [] }, null, true, false] };
        const source = JSON.stringify(value);
        const pretty = formatJson(source);
        assert.equal(pretty, JSON.stringify(value, null, 2));
        assert.equal(formatJson(pretty, true), source);
    }
});

test('UIはトップレベル値を処理し、失敗時の出力をクリアして再実行できる', (t) => {
    // DOM依存のない最小フィクスチャで、実際に登録されたボタン処理を呼び出す。
    const elements = new Map();
    const element = () => ({ value: '', textContent: '', className: '', remove() {}, addEventListener(type, fn) { this[type] = fn; } });
    const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    Object.defineProperty(globalThis, 'document', { configurable: true, value: {
        createElement: element,
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, element());
            return elements.get(id);
        },
        querySelector: () => null,
        body: { appendChild() {} },
    } });
    t.after(() => {
        if (documentDescriptor) Object.defineProperty(globalThis, 'document', documentDescriptor);
        else delete globalThis.document;
    });
    t.mock.method(globalThis, 'setTimeout', (callback) => { callback(); return 0; });
    render();
    const input = elements.get('json-input');
    const output = elements.get('json-output');
    const status = elements.get('json-status');
    const dot = elements.get('json-status-dot');
    for (const button of ['json-format', 'json-minify']) {
        for (const source of ['null', 'true', '"text"', '9007199254740993', '[1.2300E+003]']) {
            input.value = source;
            elements.get(button).click();
            assert.equal(formatJson(output.value, true), source);
            assert.equal(dot.className, 'status-dot');
            assert.doesNotMatch(status.textContent, /エラー/);
        }
        input.value = '{"a":1,}';
        elements.get(button).click();
        assert.equal(output.value, '');
        assert.equal(dot.className, 'status-dot error');
        assert.match(status.textContent, /エラー/);
        input.value = '{"id":9007199254740993}';
        elements.get(button).click();
        assert.equal(formatJson(output.value, true), input.value);
        assert.equal(dot.className, 'status-dot');
    }
    elements.get('json-clear').click();
    assert.equal(input.value, '');
    assert.equal(output.value, '');
    assert.equal(status.textContent, '準備完了');
    elements.get('json-sample').click();
    elements.get('json-format').click();
    assert.equal(JSON.parse(output.value).name, 'DevToolBox');
});

test('説明とFAQで機密情報の入力を避ける案内が揃っている', () => {
    assert.match(content.article, /機密情報や本番環境のAPIキー・トークンは入力しない/);
    const faq = content.faq.find(({ q }) => q.includes('サーバー'));
    assert.match(faq.a, /機密情報や本番環境のAPIキー・トークンは入力しない/);
    assert.doesNotMatch(content.article + faq.a, /安心して/);
    assert.match(content.article, /文字列の外側/);
});
