import test from 'node:test';
import assert from 'node:assert/strict';
import { mountTool } from '../src/tool-loader.js';

function fixture(t) {
  class Element {
    constructor(tag) {
      this.tagName = tag;
      this.children = [];
      this.attributes = {};
      this.listeners = {};
      this.dataset = {};
      this.isConnected = true;
      this.disabled = false;
    }
    setAttribute(name, value) { this.attributes[name] = value; }
    append(...children) { this.children.push(...children); }
    appendChild(child) {
      if (!(child instanceof Element)) throw new TypeError('Expected a node');
      this.append(child);
    }
    replaceChildren(...children) { this.children = children; }
    addEventListener(type, listener) { this.listeners[type] = listener; }
  }
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let reloads = 0;
  const location = { pathname: '/json-formatter/', reload() { reloads++; } };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    createElement: tag => new Element(tag),
  } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location } });
  t.after(() => {
    for (const [name, descriptor] of [['document', documentDescriptor], ['window', windowDescriptor]]) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const root = new Element('div');
  root.dataset.tool = 'json-formatter';
  root.append(new Element('loading'));
  const article = new Element('article');
  article.textContent = '静的な使い方・FAQ';
  const page = new Element('main');
  page.append(root, article);
  return { root, article, page, location, Element, reloads: () => reloads };
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function assertFailure(f) {
  const panel = f.root.children[0];
  assert.equal(panel.className, 'tool-loading tool-load-error');
  const [message, button] = panel.children;
  assert.equal(message.attributes.role, 'alert');
  assert.match(message.textContent, /通信状況/);
  assert.match(message.textContent, /入力内容はリセット/);
  assert.equal(button.tagName, 'button');
  assert.equal(button.type, 'button');
  assert.equal(button.textContent, 'ページを再読み込み');
  assert.deepEqual(f.page.children, [f.root, f.article]);
  assert.equal(f.article.textContent, '静的な使い方・FAQ');
  assert.equal(f.reloads(), 0);
  return button;
}

test('import拒否は説明と手動再読込を表示し、自動再試行しない', async t => {
  const f = fixture(t);
  let calls = 0;
  await mountTool(f.root, () => { calls++; return Promise.reject(new Error('network')); });
  const button = assertFailure(f);
  assert.equal(calls, 1);
  button.listeners.click();
  button.listeners.click();
  assert.equal(button.disabled, true);
  assert.equal(f.reloads(), 1);
  assert.equal(calls, 1);
});

test('render例外は部分表示を置き換えて、静的説明を残す', async t => {
  const f = fixture(t);
  await mountTool(f.root, async () => ({ render() {
    f.root.append(new f.Element('partial'));
    throw new Error('render failed');
  } }));
  assertFailure(f);
});

test('正常表示は領域を空にしてrenderを一度だけ呼び、返されたwidgetをマウントする', async t => {
  const f = fixture(t);
  const widget = new f.Element('div');
  let renders = 0;
  await mountTool(f.root, async () => ({ render() {
    renders++;
    assert.deepEqual(f.root.children, []);
    return widget;
  } }));
  assert.deepEqual(f.root.children, [widget]);
  assert.equal(renders, 1);
  assert.equal(f.reloads(), 0);
});

for (const outcome of ['resolve', 'reject']) {
  for (const navigation of ['removed', 'path', 'slug']) {
    test(`移動後の古い${outcome}を破棄する: ${navigation}`, async t => {
      const f = fixture(t);
      const pending = deferred();
      let renders = 0;
      const original = [...f.root.children];
      const mounted = mountTool(f.root, () => pending.promise);
      if (navigation === 'removed') f.root.isConnected = false;
      if (navigation === 'path') f.location.pathname = '/about/';
      if (navigation === 'slug') f.root.dataset.tool = 'base64';
      if (outcome === 'resolve') pending.resolve({ render() { renders++; return new f.Element('div'); } });
      else pending.reject(new Error('late network failure'));
      await mounted;
      assert.deepEqual(f.root.children, original);
      assert.equal(renders, 0);
      assert.equal(f.reloads(), 0);
    });
  }
}

test('重複マウントの古い結果が新しい表示を上書きしない', async t => {
  const f = fixture(t);
  const pending = deferred();
  const old = mountTool(f.root, () => pending.promise);
  const widget = new f.Element('div');
  await mountTool(f.root, async () => ({ render: () => widget }));
  pending.resolve({ render() { assert.fail('stale render'); } });
  await old;
  assert.deepEqual(f.root.children, [widget]);
});

test('移動後に古い再読込ボタンを押してもページを再読込しない', async t => {
  const f = fixture(t);
  await mountTool(f.root, async () => { throw new Error('network'); });
  const button = assertFailure(f);
  f.location.pathname = '/about/';
  button.listeners.click();
  assert.equal(f.reloads(), 0);
});

test('未登録ツールは領域を変更しない', async t => {
  const f = fixture(t);
  const original = [...f.root.children];
  await mountTool(f.root, undefined);
  assert.deepEqual(f.root.children, original);
});
