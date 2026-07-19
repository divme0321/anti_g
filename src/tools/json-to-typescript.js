import { copyToClipboard, showToast } from '../utils.js';

// サンプルJSON（ネストしたオブジェクトと配列を含むユーザー情報風データ）
const SAMPLE_JSON = `{
  "id": 101,
  "name": "山田 太郎",
  "email": "taro@example.com",
  "is_active": true,
  "profile": {
    "age": 29,
    "bio": null,
    "avatar-url": "https://example.com/avatar.png"
  },
  "tags": ["typescript", "frontend"],
  "posts": [
    { "id": 1, "title": "はじめての投稿", "likes": 12 },
    { "id": 2, "title": "TypeScript入門", "likes": 34 }
  ]
}`;

// JS識別子としてそのまま書けるキーかどうか
const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// 任意の文字列をPascalCaseの型名に整形する（例: "avatar-url" → "AvatarUrl"）
export function toPascalCase(str) {
  const parts = String(str)
    // camelCaseの境界に区切りを入れてから記号で分割する
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  let name = parts.join('');
  if (!name) name = 'Root';
  if (/^[0-9]/.test(name)) name = '_' + name; // 数字始まりは識別子にならないため
  return name;
}

// JSON文字列からTypeScriptのinterface定義群を生成する（純粋関数・Nodeでもテスト可能）
export function generateTypeScript(jsonText, rootNameRaw) {
  const value = JSON.parse(jsonText);
  const rootName = toPascalCase(rootNameRaw || 'Root');
  const usedNames = new Set();
  const interfaces = []; // { name, lines } を発見順に保持する

  // 名前衝突時は連番を付けて一意にする
  function uniqueName(base) {
    let name = base;
    let i = 2;
    while (usedNames.has(name)) name = base + i++;
    usedNames.add(name);
    return name;
  }

  function propKey(key) {
    return IDENT_RE.test(key) ? key : JSON.stringify(key);
  }

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

  // オブジェクトからinterfaceを生成し、その型名を返す
  function buildInterface(obj, nameHint) {
    const name = uniqueName(toPascalCase(nameHint));
    const iface = { name, lines: [] };
    interfaces.push(iface); // 先にpushして親→子の順で出力する
    for (const [k, v] of Object.entries(obj)) {
      iface.lines.push(`  ${propKey(k)}: ${inferType(v, k)};`);
    }
    return name;
  }

  // 配列の要素型を推論する。オブジェクト要素はキーをマージして1つのinterfaceにまとめる
  function inferArrayType(arr, nameHint) {
    if (arr.length === 0) return 'unknown[]';
    const types = [];
    let objectDone = false;
    for (const item of arr) {
      if (isPlainObject(item)) {
        if (!objectDone) {
          const merged = Object.assign({}, ...arr.filter(isPlainObject));
          types.push(buildInterface(merged, nameHint));
          objectDone = true;
        }
        continue;
      }
      const t = inferType(item, nameHint);
      if (!types.includes(t)) types.push(t);
    }
    return types.length === 1 ? `${types[0]}[]` : `(${types.join(' | ')})[]`;
  }

  // 値から型表現を再帰的に推論する
  function inferType(val, nameHint) {
    if (val === null) return 'null';
    if (Array.isArray(val)) return inferArrayType(val, nameHint);
    switch (typeof val) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'object':
        return buildInterface(val, nameHint);
      default:
        return 'unknown';
    }
  }

  let output;
  if (isPlainObject(value)) {
    buildInterface(value, rootName);
    output = '';
  } else {
    // ルートが配列やプリミティブの場合はtypeエイリアスとして出力する
    output = `export type ${rootName} = ${inferType(value, rootName + 'Item')};\n\n`;
  }
  output += interfaces
    .map((i) => `export interface ${i.name} {\n${i.lines.join('\n')}\n}`)
    .join('\n\n');
  return { code: output.trim() + '\n', interfaceCount: interfaces.length, rootName };
}

// インタラクティブなツール部分のみを描画する（ページの見出し・記事はテンプレート側が担当）
export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">JSON入力</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="j2t-sample">サンプル</button>
          <button class="btn btn-secondary" id="j2t-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="j2t-input" placeholder='ここにJSONを貼り付けてください...&#10;&#10;{"id": 1, "name": "example"}'></textarea>
      </div>
      <div class="tool-actions">
        <label class="pane-title" for="j2t-root-name">ルート型名</label>
        <input type="text" id="j2t-root-name" value="Root" placeholder="Root">
        <button class="btn btn-primary" id="j2t-generate">型を生成 →</button>
      </div>
    </div>
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">TypeScript出力</span>
        <div class="pane-actions">
          <button class="btn-icon" id="j2t-copy" title="コピー">📋</button>
        </div>
      </div>
      <div class="pane-body">
        <textarea id="j2t-output" readonly placeholder="生成されたinterface定義がここに表示されます..."></textarea>
      </div>
      <div class="status-bar">
        <span class="status-dot" id="j2t-status-dot"></span>
        <span id="j2t-status">準備完了</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('j2t-input');
    const output = document.getElementById('j2t-output');
    const rootNameInput = document.getElementById('j2t-root-name');
    const status = document.getElementById('j2t-status');
    const statusDot = document.getElementById('j2t-status-dot');

    function setStatus(msg, isError = false) {
      status.textContent = msg;
      statusDot.className = isError ? 'status-dot error' : 'status-dot';
    }

    document.getElementById('j2t-generate').addEventListener('click', () => {
      if (!input.value.trim()) {
        setStatus('JSONを入力してください', true);
        return;
      }
      try {
        const result = generateTypeScript(input.value, rootNameInput.value);
        rootNameInput.value = result.rootName; // PascalCaseに自動整形した結果を反映
        output.value = result.code;
        setStatus(`生成完了 — interface ${result.interfaceCount} 個`);
      } catch (e) {
        output.value = '';
        setStatus(`エラー: ${e.message}`, true);
        showToast('JSONのパースに失敗しました', 'error');
      }
    });

    document.getElementById('j2t-sample').addEventListener('click', () => {
      input.value = SAMPLE_JSON;
      rootNameInput.value = 'User';
      setStatus('サンプルを読み込みました');
    });

    document.getElementById('j2t-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });

    document.getElementById('j2t-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      setStatus('準備完了');
    });
  }, 0);

  return widget;
}
