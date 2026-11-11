// XSS対策としてのエスケープ — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'xss-escape-by-context',
  title: 'XSS対策のエスケープは出力先で変わる: HTML本文・属性・JavaScript・URLの違い',
  description:
    'HTMLエスケープだけではXSSを防げない場面があります。HTML本文、属性値、script内、URL、CSSという出力先ごとに必要な処理を表で整理し、innerHTMLやhref属性の落とし穴、CSPによる多層防御を解説します。',
  date: '2026-11-11',
  category: '入門ガイド',
  tags: ['セキュリティ', 'XSS', 'HTML', 'JavaScript', 'Web開発'],
  relatedTools: ['html-entities', 'url-encoder', 'json-formatter', 'markdown-preview'],
  body: `<p>クロスサイトスクリプティング（XSS）の対策として「HTMLエスケープをする」と覚えている人は多いと思います。これは正しいのですが、十分ではありません。必要な処理は<strong>値をどこに出力するか</strong>で変わり、HTML用のエスケープをしていても防げない出力先があります。この記事では、出力先ごとに何をすべきかを整理し、エスケープしたのに脆弱性が残る典型的なパターンを取り上げます。</p>

<h2>XSSが起きる仕組み</h2>
<p>XSSは、利用者が入力した値などの信頼できないデータが、ブラウザに<strong>データではなくコードとして</strong>解釈されることで起こります。たとえば、検索語をそのまま画面に出す処理があるとします。</p>
<pre><code>&lt;p&gt;「（ここに検索語）」の検索結果&lt;/p&gt;</code></pre>
<p>検索語として<code>&lt;script&gt;...&lt;/script&gt;</code>を含むURLを踏ませると、ブラウザはそれをページの一部として実行します。攻撃者は、そのページを見た人の権限で操作を行ったり、画面を書き換えて偽の入力欄を出したりできます。</p>
<p>対策の基本は、データがコードの区切りを越えないように、<strong>出力する直前に、出力先に合った方法で</strong>変換することです。</p>

<h2>出力先ごとの対策一覧</h2>
<table>
<thead><tr><th>出力先</th><th>例</th><th>必要な処理</th></tr></thead>
<tbody>
<tr><td>HTMLの本文</td><td><code>&lt;p&gt;値&lt;/p&gt;</code></td><td>HTMLエスケープ</td></tr>
<tr><td>HTMLの属性値</td><td><code>&lt;input value="値"&gt;</code></td><td>HTMLエスケープ ＋ 属性値を必ず引用符で囲む</td></tr>
<tr><td>URLを入れる属性</td><td><code>&lt;a href="値"&gt;</code></td><td>スキームの検証（<code>https:</code>などに限定）＋ HTMLエスケープ</td></tr>
<tr><td>URLのパラメータ</td><td><code>?q=値</code></td><td>URLエンコード（その後、属性に入れるならHTMLエスケープ）</td></tr>
<tr><td>script要素の中</td><td><code>var x = "値";</code></td><td>直接埋め込まない。JSONにして安全な方法で渡す</td></tr>
<tr><td>イベント属性</td><td><code>onclick="f('値')"</code></td><td>使わない</td></tr>
<tr><td>CSS</td><td><code>style="color: 値"</code></td><td>値を許可リストで検証する。自由な文字列は入れない</td></tr>
</tbody>
</table>

<h2>HTML本文: 5文字を置き換える</h2>
<p>HTMLの本文に出す場合は、次の5文字を置き換えます。</p>
<table>
<thead><tr><th>文字</th><th>置き換え後</th><th>理由</th></tr></thead>
<tbody>
<tr><td><code>&amp;</code></td><td><code>&amp;amp;</code></td><td>エンティティの開始文字。最初に処理する</td></tr>
<tr><td><code>&lt;</code></td><td><code>&amp;lt;</code></td><td>タグの開始</td></tr>
<tr><td><code>&gt;</code></td><td><code>&amp;gt;</code></td><td>タグの終了</td></tr>
<tr><td><code>"</code></td><td><code>&amp;quot;</code></td><td>属性値の区切り</td></tr>
<tr><td><code>'</code></td><td><code>&amp;#39;</code></td><td>属性値の区切り</td></tr>
</tbody>
</table>
<p><code>&amp;</code>を最初に置き換えるのは、後から処理すると<code>&amp;lt;</code>の<code>&amp;</code>まで再び変換されて<code>&amp;amp;lt;</code>になるためです。変換結果を確かめたいときは<a href="/html-entities/">HTMLエンティティ変換ツール</a>が使えます。</p>
<p>実際には、この処理を自分で書く機会は多くありません。ReactやVueなどのフレームワーク、各言語のテンプレートエンジンの多くは、値を出力するときに自動でエスケープします。重要なのは、<strong>自動エスケープを外す書き方を使う場面を把握しておく</strong>ことです。</p>

<h2>属性値: 引用符で囲まないとエスケープが効かない</h2>
<p>属性値を引用符で囲んでいないと、HTMLエスケープをしていても攻撃が成立します。</p>
<pre><code>&lt;input value=（値）&gt;</code></pre>
<p>値が<code>x onmouseover=alert(1)</code>だった場合、空白で属性値が終わり、続きが新しい属性として解釈されます。この文字列には<code>&lt;</code>も引用符も含まれないため、エスケープでは何も変わりません。属性値は必ず<code>"</code>で囲み、そのうえでエスケープします。</p>

<h2>URLを入れる属性: エスケープでは防げない</h2>
<p>見落とされやすいのが<code>href</code>や<code>src</code>です。利用者が入力したURLをリンクにする場合を考えます。</p>
<pre><code>&lt;a href="（値）"&gt;プロフィールのリンク&lt;/a&gt;</code></pre>
<p>値が<code>javascript:alert(1)</code>だと、リンクをクリックした時点でスクリプトが実行されます。この文字列にはHTMLの特殊文字が1つもなく、<strong>HTMLエスケープをしてもそのまま通ります。</strong>自動エスケープのあるフレームワークでも、この問題は防げないことがあります。</p>
<p>対策は、URLのスキームを検証することです。</p>
<pre><code>function safeUrl(input) {
  try {
    const url = new URL(input, location.origin);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : '#';
  } catch {
    return '#';
  }
}</code></pre>
<p>「<code>javascript:</code>で始まるものを弾く」という拒否リスト方式は、大文字小文字の混在や先頭の空白・制御文字で回避されることがあります。許可するスキームを列挙する方式にしてください。</p>

<h2>URLのパラメータ: URLエンコードとの二段構え</h2>
<p>値をクエリ文字列に入れる場合は、まずURLエンコードを行います。<code>&amp;</code>や<code>=</code>、<code>#</code>が含まれていると、パラメータの区切りとして解釈されてしまうためです。</p>
<pre><code>const url = '/search?q=' + encodeURIComponent(keyword);</code></pre>
<p>このURLをHTMLの属性に書き出すなら、さらにHTMLエスケープが必要です。<strong>内側の文脈から順に処理する</strong>と覚えてください。変換の挙動は<a href="/url-encoder/">URLエンコード・デコードツール</a>で確認できます。</p>

<h2>script要素の中: HTMLエスケープは逆効果</h2>
<p>サーバーの値をJavaScriptの変数に渡したい場面は多くあります。</p>
<pre><code>&lt;script&gt;
  var userName = "（値）";
&lt;/script&gt;</code></pre>
<p>ここにHTMLエスケープをかけても安全にはなりません。<code>script</code>要素の中ではエンティティが解釈されないため、<code>&amp;quot;</code>は文字どおりの6文字として変数に入り、表示が壊れます。一方で、値に<code>&lt;/script&gt;</code>が含まれていると、JavaScriptの文字列の途中であってもHTMLとしては<code>script</code>要素がそこで終わり、続きが別のタグとして解釈されます。</p>
<p>安全な渡し方は次のいずれかです。</p>
<ul>
<li><strong>data属性に入れて、スクリプトから読む。</strong>属性値としてHTMLエスケープすれば済み、文脈が1つになる。</li>
<li><strong>JSONとして出力し、<code>&lt;</code>をUnicodeエスケープ（<code>\\u003c</code>）に置き換える。</strong>種類を<code>application/json</code>にした<code>script</code>要素に入れ、<code>JSON.parse</code>で読む。</li>
<li><strong>APIから取得する。</strong>HTMLに埋め込まず、別のリクエストで受け取る。</li>
</ul>
<pre><code>&lt;div id="app" data-user-name="（HTMLエスケープした値）"&gt;&lt;/div&gt;
&lt;script&gt;
  const userName = document.getElementById('app').dataset.userName;
&lt;/script&gt;</code></pre>
<p><code>onclick</code>などのイベント属性は、HTMLの属性でありながら中身がJavaScriptという二重の文脈になり、正しい処理が複雑です。値を埋め込む用途では使わず、<code>addEventListener</code>でスクリプト側から登録します。</p>

<h2>JavaScriptからDOMに書き込むとき</h2>
<p>ブラウザ側のコードだけで起きるXSS（DOM-based XSS）もあります。原因のほとんどは、文字列をHTMLとして解釈するAPIに、信頼できない値を渡すことです。</p>
<table>
<thead><tr><th>危険な書き方</th><th>安全な代替</th></tr></thead>
<tbody>
<tr><td><code>el.innerHTML = value</code></td><td><code>el.textContent = value</code></td></tr>
<tr><td><code>el.insertAdjacentHTML('beforeend', value)</code></td><td><code>el.append(value)</code>（文字列はテキストとして追加される）</td></tr>
<tr><td><code>document.write(value)</code></td><td>使わない</td></tr>
<tr><td><code>el.setAttribute('href', value)</code></td><td>スキームを検証してから設定する</td></tr>
<tr><td><code>eval(value)</code>、<code>setTimeout(文字列)</code></td><td>使わない。関数を渡す</td></tr>
</tbody>
</table>
<p><code>textContent</code>は、渡した文字列をそのままテキストとして表示します。タグとして解釈されないため、エスケープを自分で行う必要がありません。フレームワークでは、Reactの<code>dangerouslySetInnerHTML</code>やVueの<code>v-html</code>が<code>innerHTML</code>に相当します。名前のとおり、信頼できない値には使いません。</p>

<h2>HTMLをそのまま表示したい場合</h2>
<p>ブログのコメント欄で装飾を許可する、Markdownを変換して表示する、といった場合は、タグを残したまま危険な部分だけを取り除く必要があります。この処理（サニタイズ）は、正規表現で自作すると抜け道が残ります。HTMLとして解析したうえで、許可したタグと属性だけを残す専用のライブラリ（DOMPurifyなど）を使ってください。Markdownの変換結果を確かめる際は、<a href="/markdown-preview/">Markdownプレビュー</a>のように生のHTMLを文字として表示する設定のものを選ぶと安全です。</p>

<h2>多層防御: 漏れがあっても被害を抑える</h2>
<p>エスケープは1か所でも漏れると成立するため、漏れた場合の被害を抑える仕組みも併用します。</p>
<ul>
<li><strong>Content Security Policy（CSP）。</strong>実行してよいスクリプトの出どころをレスポンスヘッダーで指定する。インラインスクリプトを禁止すれば、挿入されたスクリプトの多くは動かない。</li>
<li><strong>Cookieの<code>HttpOnly</code>属性。</strong>スクリプトからCookieを読めなくし、セッションの持ち出しを防ぐ。</li>
<li><strong>Trusted Types。</strong><code>innerHTML</code>などへの文字列の代入を制限する。対応ブラウザでは、危険な書き込みを仕組みとして防げる。</li>
</ul>
<p>これらは保険であり、エスケープの代わりにはなりません。認証トークンの置き場所とXSSの関係は<a href="/blog/jwt-authentication-guide/">JWT認証の解説記事</a>でも触れています。</p>

<h2>チェックリスト</h2>
<ul>
<li>テンプレートの自動エスケープが有効になっている</li>
<li>自動エスケープを外している箇所（<code>v-html</code>、<code>dangerouslySetInnerHTML</code>、生出力の記法）をすべて把握している</li>
<li>属性値をすべて引用符で囲んでいる</li>
<li>利用者が入力したURLを<code>href</code>や<code>src</code>に入れる前に、スキームを許可リストで検証している</li>
<li><code>script</code>要素の中に値を直接埋め込んでいない</li>
<li><code>innerHTML</code>に信頼できない値を渡していない</li>
<li>HTMLを許可する箇所では、専用のライブラリでサニタイズしている</li>
<li>CSPを設定している</li>
</ul>
<p>「エスケープしたかどうか」ではなく、「この値はどの文脈に出力されるのか」を毎回確認する習慣が、XSSを防ぐうえでもっとも効果があります。</p>`,
};
