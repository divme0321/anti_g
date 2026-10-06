// TypeScriptの型定義入門 — ブログ記事コンテンツ定義
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'typescript-type-basics',
  title: 'TypeScriptの型定義入門: interfaceとtypeの使い分け',
  description:
    'TypeScriptの型注釈の基本と、interfaceとtype aliasの違い（拡張・マージ・使い分け）を比較表で解説。fetchのAPIレスポンスに型を付ける実例、anyよりunknownを使う理由まで押さえる入門記事です。',
  date: '2026-07-18',
  category: '入門ガイド',
  tags: ['TypeScript', 'JavaScript', '型定義'],
  relatedTools: ['json-to-typescript', 'json-formatter'],
  body: `<p>TypeScriptを書き始めてまず戸惑うのが「<code>interface</code>と<code>type</code>のどちらで型を定義すべきか」という問題です。この記事では、基本の型注釈のおさらいから、interfaceとtype aliasの機能的な違いと使い分けの指針、ユニオン型・オプショナルプロパティ、そしてfetchで取得したAPIレスポンスに型を付ける実例までを解説します。APIレスポンスのJSONから型定義を起こす作業は<a href="/json-to-typescript/">JSON→TypeScript型生成ツール</a>で自動化できます。</p>

<h2>基本の型注釈</h2>
<p>TypeScriptでは変数名や引数名の後ろに<code>: 型</code>を書いて型を宣言します。まずはプリミティブ・配列・オブジェクトの3パターンを押さえます。</p>
<pre><code>// プリミティブ
const name: string = '田中';
const age: number = 28;
const active: boolean = true;

// 配列（2つの書き方は同じ意味）
const tags: string[] = ['css', 'html'];
const scores: Array&lt;number&gt; = [80, 92];

// オブジェクト
const user: { id: number; name: string } = { id: 1, name: '田中' };</code></pre>
<p>実際には、初期値から型が明らかな変数（<code>const age = 28</code>など）には型推論が働くため注釈は不要です。注釈が力を発揮するのは、<strong>関数の引数・戻り値</strong>と、<strong>オブジェクトの形を定義するとき</strong>です。オブジェクトの型をその場に書くと読みにくいので、名前を付けて切り出します。その手段がinterfaceとtypeです。</p>

<h2>interfaceとtype aliasの違い</h2>
<p>どちらもオブジェクトの形に名前を付けられ、多くの場面で交換可能ですが、機能に差があります。</p>
<pre><code>interface User {
  id: number;
  name: string;
}

type User = {
  id: number;
  name: string;
};</code></pre>
<table>
<thead><tr><th>観点</th><th>interface</th><th>type alias</th></tr></thead>
<tbody>
<tr><td>定義できるもの</td><td>オブジェクトの形（と関数型）のみ</td><td>ユニオン型・タプル・プリミティブの別名など任意の型</td></tr>
<tr><td>拡張方法</td><td><code>extends</code>で継承</td><td><code>&amp;</code>（交差型）で合成</td></tr>
<tr><td>同名定義のマージ</td><td>される（宣言マージ）</td><td>されない（同名はエラー）</td></tr>
<tr><td>向いている用途</td><td>クラスの実装契約、ライブラリの公開型</td><td>ユニオン型、関数型、既存型の組み合わせ</td></tr>
</tbody>
</table>
<h3>拡張方法の違い</h3>
<pre><code>// interface は extends
interface Admin extends User {
  role: string;
}

// type は交差型（&amp;）
type Admin = User &amp; { role: string };</code></pre>
<h3>宣言マージ — interfaceだけの挙動</h3>
<p>interfaceは同じ名前で複数回宣言すると自動的に1つに統合されます。ライブラリの型定義を利用側で拡張できる（例: <code>Window</code>にプロパティを追加する）便利な仕組みですが、裏を返せば「別の場所の宣言で型が変わりうる」ということでもあります。typeは同名定義がエラーになるため、意図しない拡張を防げます。</p>
<h3>使い分けの指針</h3>
<ul>
<li>ユニオン型や関数型・タプルなど、オブジェクト以外の型に名前を付けるなら<strong>typeしか選択肢がありません</strong>。</li>
<li>クラスに<code>implements</code>させる契約や、外部に公開して拡張を許したい型は<strong>interface</strong>が適します。</li>
<li>どちらでも書ける場面はチームでどちらかに統一すれば十分です。近年は「一貫してtypeを使い、必要な場面だけinterface」という方針のプロジェクトが増えています。</li>
</ul>

<h2>ユニオン型とオプショナルプロパティ</h2>
<p><strong>ユニオン型</strong>は「AまたはB」を表す型で、<code>|</code>でつなぎます。特定の文字列だけを許すリテラル型との組み合わせが頻出です。</p>
<pre><code>type Status = 'draft' | 'published' | 'archived';

function setStatus(s: Status) { /* ... */ }
setStatus('published'); // OK
setStatus('deleted');   // コンパイルエラー</code></pre>
<p><strong>オプショナルプロパティ</strong>はプロパティ名の後ろに<code>?</code>を付け、「あってもなくてもよい」ことを表します。</p>
<pre><code>type Profile = {
  name: string;
  bio?: string;        // string | undefined
};</code></pre>
<p>オプショナルなプロパティは<code>undefined</code>の可能性があるため、<code>profile.bio?.length</code>のようにオプショナルチェーンで安全にアクセスします。</p>

<h2>実例: fetchのAPIレスポンスに型を付ける</h2>
<p><code>fetch</code>の<code>response.json()</code>の戻り値は<code>any</code>相当で、そのままでは型チェックが働きません。レスポンスの型を定義し、取得関数の戻り値に付けるのが基本パターンです。</p>
<pre><code>type Article = {
  id: number;
  title: string;
  tags: string[];
  publishedAt: string | null;
};

async function fetchArticles(): Promise&lt;Article[]&gt; {
  const res = await fetch('https://api.example.com/articles');
  if (!res.ok) {
    throw new Error(\`HTTP error: \${res.status}\`);
  }
  return (await res.json()) as Article[];
}

const articles = await fetchArticles();
articles[0].title;   // string として補完・チェックが効く
articles[0].titel;   // タイポはコンパイルエラーで検出</code></pre>
<p>注意点として、<code>as Article[]</code>は「この形のはず」とコンパイラに伝えているだけで、実行時に検証しているわけではありません。外部APIの仕様変更に備えるなら、zodなどのスキーマ検証ライブラリで実行時チェックを組み合わせると堅牢になります。また、実際のレスポンスJSONから型定義を書き起こす作業は、<a href="/json-to-typescript/">JSON→TypeScript型生成ツール</a>にJSONを貼り付ければ一括生成できます。</p>

<h2>anyを避けてunknownを使う</h2>
<p><code>any</code>は型チェックを完全に無効化する型です。<code>any</code>の値はどんなプロパティにアクセスしてもメソッドを呼んでもエラーにならず、TypeScriptを使う意味がその部分だけ失われます。さらに<code>any</code>は代入先にも伝播し、汚染が広がります。</p>
<p>「型が分からない値」を受け取るときは<code>unknown</code>を使います。<code>unknown</code>はどんな値でも代入できる点はanyと同じですが、<strong>型を絞り込むまで一切の操作が許されない</strong>ため、チェック漏れをコンパイラが防いでくれます。</p>
<pre><code>function handle(value: unknown) {
  value.toUpperCase();            // エラー: 型が未確定のまま操作できない

  if (typeof value === 'string') {
    value.toUpperCase();          // OK: string に絞り込まれた
  }
}</code></pre>
<p><code>try/catch</code>のエラーオブジェクトや、外部から受け取るJSONなど「本当に何が来るか分からない」場面でこそ、anyではなくunknown＋絞り込みを使うのが安全です。</p>

<h2>まとめ</h2>
<ul>
<li>型注釈は関数の引数・戻り値とオブジェクトの形の定義で特に効果を発揮します。明らかな初期値には型推論で十分です。</li>
<li>interfaceは<code>extends</code>と宣言マージ、typeはユニオン型など任意の型に名前を付けられます。どちらでも書ける場面はチームで統一します。</li>
<li>ユニオン型（<code>'a' | 'b'</code>）とオプショナル（<code>?</code>）で「取りうる値」を正確に表現できます。</li>
<li>fetchの結果には<code>Promise&lt;T&gt;</code>で型を付け、必要なら実行時検証も併用します。型定義の作成は<a href="/json-to-typescript/">JSON→TypeScript型生成ツール</a>が便利です。</li>
<li>型が不明な値はanyではなくunknownで受け、絞り込んでから使います。</li>
</ul>`,
};
