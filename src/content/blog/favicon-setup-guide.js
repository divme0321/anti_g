// ファビコンの設定方法 — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'favicon-setup-guide',
  title: 'ファビコンの設定方法: 必要なサイズ・HTMLの書き方・表示されないときの確認手順',
  description:
    'ファビコンに必要なサイズとファイル形式、headに書くlinkタグ、apple-touch-iconとWebアプリマニフェストの設定、ダークモード対応、変更が反映されないときの確認手順を1ページにまとめます。',
  date: '2026-11-25',
  category: 'リファレンス',
  tags: ['HTML', 'Web制作', 'デザイン', '画像'],
  relatedTools: ['favicon-generator', 'meta-tag-generator', 'image-compressor', 'image-base64'],
  body: `<p>ファビコンは、ブラウザのタブ、ブックマーク、スマートフォンのホーム画面、検索結果などに表示されるサイトのアイコンです。設定自体は数行のHTMLで済みますが、表示される場所ごとに求められるサイズが違い、「設定したのに変わらない」というキャッシュの問題にもよく出会います。この記事では、現在の環境で用意すべきファイルと書き方、反映されないときの確認手順をまとめます。画像の用意がまだなら、<a href="/favicon-generator/">ファビコン作成ツール</a>で絵文字や文字から各サイズのPNGを作れます。</p>

<h2>最小構成: まずこの4つ</h2>
<p>多くのサイトでは、次の構成で主要な表示場所をカバーできます。</p>
<pre><code>&lt;link rel="icon" href="/favicon.ico" sizes="32x32"&gt;
&lt;link rel="icon" href="/icon.svg" type="image/svg+xml"&gt;
&lt;link rel="apple-touch-icon" href="/apple-touch-icon.png"&gt;
&lt;link rel="manifest" href="/manifest.webmanifest"&gt;</code></pre>
<table>
<thead><tr><th>ファイル</th><th>サイズ</th><th>使われる場所</th></tr></thead>
<tbody>
<tr><td><code>favicon.ico</code></td><td>32×32（16×16を同梱してもよい）</td><td>ブラウザのタブ、古いブラウザ、フィードリーダーなど</td></tr>
<tr><td><code>icon.svg</code></td><td>任意（ベクター）</td><td>SVGに対応したブラウザのタブ</td></tr>
<tr><td><code>apple-touch-icon.png</code></td><td>180×180</td><td>iPhone・iPadのホーム画面</td></tr>
<tr><td>マニフェスト内のアイコン</td><td>192×192、512×512</td><td>Androidのホーム画面、PWAのインストール画面</td></tr>
</tbody>
</table>
<p>SVGを用意しない場合は、PNGをサイズ別に指定します。</p>
<pre><code>&lt;link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"&gt;
&lt;link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"&gt;
&lt;link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"&gt;</code></pre>
<p>ブラウザは、指定された候補の中から表示する場所に合ったものを選びます。</p>

<h2>サイズと用途の一覧</h2>
<table>
<thead><tr><th>サイズ</th><th>主な用途</th></tr></thead>
<tbody>
<tr><td>16×16</td><td>ブラウザのタブ（標準の解像度）</td></tr>
<tr><td>32×32</td><td>ブラウザのタブ（高解像度の画面）、タスクバー</td></tr>
<tr><td>48×48</td><td>Windowsのサイトアイコン。Google検索の結果に表示するアイコンの基準サイズ</td></tr>
<tr><td>180×180</td><td>iOSのホーム画面（apple-touch-icon）</td></tr>
<tr><td>192×192</td><td>Androidのホーム画面</td></tr>
<tr><td>512×512</td><td>PWAの起動画面、インストール時の表示</td></tr>
</tbody>
</table>
<p>以前は、端末ごとに十数種類のサイズを並べる書き方が広まっていました。現在は、大きい画像を1つ指定すればブラウザが縮小して使うため、上の表の範囲で十分です。</p>

<h2>ルートに favicon.ico を置く理由</h2>
<p>ブラウザやクローラーの多くは、HTMLに指定がなくても<code>/favicon.ico</code>を取りに来ます。HTML以外のページ（PDFや画像を直接開いた場合）、RSSリーダー、一部の外部サービスは、この既定の場所だけを見ます。ファイルがないと、アクセスログに404が記録され続けます。<code>link</code>タグで別の画像を指定していても、ルートに<code>favicon.ico</code>を置いておくのが無難です。</p>
<p>ICO形式は、1つのファイルに複数のサイズを入れられる形式です。16×16と32×32を同梱しておくと、表示場所に合ったほうが使われます。</p>

<h2>SVGファビコンとダークモード対応</h2>
<p>SVGは拡大しても劣化せず、ファイルも小さくできます。さらに、SVGの中にCSSを書けるため、端末のダークモードに合わせて色を切り替えられます。</p>
<pre><code>&lt;svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"&gt;
  &lt;style&gt;
    path { fill: #1f2937; }
    @media (prefers-color-scheme: dark) {
      path { fill: #f9fafb; }
    }
  &lt;/style&gt;
  &lt;path d="M4 4h24v24H4z"/&gt;
&lt;/svg&gt;</code></pre>
<p>濃い色のロゴは、ダークモードのタブでは背景に溶け込んで見えなくなります。切り替えを入れるか、明暗どちらの背景でも見える配色にしておきます。</p>
<p>SVGファビコンへの対応はブラウザによって差があるため、SVGだけにせず、ICOまたはPNGを併記してください。対応していないブラウザは、併記したほうを使います。</p>

<h2>apple-touch-icon の注意点</h2>
<ul>
<li><strong>背景を透過にしない。</strong>iOSは透過部分を黒で塗りつぶす。背景色を付けた正方形の画像にする。</li>
<li><strong>角丸は自分で付けない。</strong>iOSが自動で角を丸める。四角いまま用意する。</li>
<li><strong>余白を取る。</strong>端まで絵柄を広げると、角丸で切れる。周囲に1割ほどの余白を残す。</li>
<li><strong>ファイル名は<code>apple-touch-icon.png</code>にしてルートに置く。</strong>指定がなくてもこの名前を探しに来るため、既定の場所に置いておくと確実。</li>
</ul>

<h2>Webアプリマニフェスト</h2>
<p>Androidのホーム画面やPWAで使うアイコンは、マニフェストファイルに書きます。</p>
<pre><code>{
  "name": "サイト名",
  "short_name": "短い名前",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}</code></pre>
<p><code>purpose</code>が<code>maskable</code>のアイコンは、端末が円形や角丸の形に切り抜いて表示するためのものです。切り抜かれても絵柄が欠けないように、中央の約80%の範囲に重要な部分を収めます。通常のアイコンと兼用すると余白が大きすぎて見えることがあるため、別の画像として用意するのが確実です。</p>
<p>マニフェストはJSONなので、末尾のカンマなどの文法エラーがあると全体が無視されます。<a href="/json-formatter/">JSON整形ツール</a>で確認しておくと安心です。</p>

<h2>Google検索の結果に表示するには</h2>
<p>検索結果のサイト名の横に表示されるアイコンも、ファビコンから取られます。Googleの案内では、おおむね次の条件が求められています。</p>
<ul>
<li>トップページの<code>head</code>に<code>link rel="icon"</code>などで指定する。</li>
<li>画像は正方形にする。48×48ピクセルの倍数（48、96、144など）が推奨される。SVGならサイズの制約はない。</li>
<li>ファビコンのファイルとトップページを、クローラーが取得できるようにする（<code>robots.txt</code>でブロックしない）。</li>
<li>URLを頻繁に変えない。</li>
</ul>
<p>設定してから検索結果に反映されるまでには、クロールを待つ必要があり、数日から数週間かかることがあります。条件を満たしていても表示が保証されるわけではありません。</p>

<h2>ファイル形式の選び方</h2>
<table>
<thead><tr><th>形式</th><th>長所</th><th>短所</th></tr></thead>
<tbody>
<tr><td>ICO</td><td>ほぼすべての環境で読める。複数サイズを同梱できる</td><td>作成に専用のツールが必要。大きいサイズには向かない</td></tr>
<tr><td>PNG</td><td>作りやすい。透過に対応</td><td>サイズごとにファイルが必要</td></tr>
<tr><td>SVG</td><td>劣化しない。軽い。ダークモードに対応できる</td><td>対応していないブラウザがある。複雑な絵柄には不向き</td></tr>
</tbody>
</table>
<p>PNGは、色数の少ないアイコンであれば<a href="/image-compressor/">画像圧縮ツール</a>でさらに小さくできます。</p>

<h2>デザインのコツ</h2>
<ul>
<li><strong>16×16で判別できるか確かめる。</strong>横長のロゴをそのまま縮小すると読めない。頭文字やシンボルだけにする。</li>
<li><strong>細い線を避ける。</strong>小さいサイズでは線が消える。太めの形にする。</li>
<li><strong>背景とのコントラストを取る。</strong>タブの背景は白にも黒にもなる。</li>
<li><strong>色数を絞る。</strong>2〜3色のほうが、小さくても形が伝わる。</li>
</ul>

<h2>変更が反映されないときの確認手順</h2>
<p>ファビコンはブラウザに強くキャッシュされ、ページを再読み込みしても更新されないことがあります。次の順に確認してください。</p>
<ol>
<li><strong>ファイルに直接アクセスする。</strong>アドレスバーに<code>/favicon.ico</code>などのURLを入れ、新しい画像が表示されるか、404になっていないかを見る。</li>
<li><strong>HTMLのソースを確認する。</strong><code>link</code>タグが<code>head</code>の中に出力されているか、パスが正しいか（相対パスだと下層ページで切れる。<code>/</code>から始める）。</li>
<li><strong>別の環境で開く。</strong>プライベートウィンドウや別のブラウザで開き、新しいアイコンになっていればキャッシュが原因。</li>
<li><strong>URLを変える。</strong>ファイル名を変えるか、<code>/favicon.ico?v=2</code>のようにパラメータを付けて、別のファイルとして読み込ませる。</li>
<li><strong>CDNやサーバーのキャッシュを確認する。</strong>配信側が古いファイルを返していないか。レスポンスヘッダーの<code>Cache-Control</code>と<code>Content-Type</code>も見る。</li>
</ol>
<p>レスポンスヘッダーは<code>curl -I https://example.com/favicon.ico</code>で確認できます。コマンドの使い方は<a href="/blog/curl-cheatsheet/">curlチートシート</a>を参照してください。</p>
<table>
<thead><tr><th>症状</th><th>よくある原因</th></tr></thead>
<tbody>
<tr><td>トップページでは出るが下層ページで出ない</td><td>パスが相対指定になっている</td></tr>
<tr><td>自分の環境だけ古いまま</td><td>ブラウザのキャッシュ</td></tr>
<tr><td>iPhoneのホーム画面で黒い背景になる</td><td>apple-touch-iconが透過PNGになっている</td></tr>
<tr><td>Androidでアイコンが小さく表示される</td><td>maskable用の画像がなく、通常のアイコンが縮小されている</td></tr>
<tr><td>検索結果に出ない</td><td>クロール待ち、サイズが条件を満たしていない、robots.txtでブロックしている</td></tr>
</tbody>
</table>
<p>ファビコンとあわせて、SNSで共有されたときの画像やタイトルを決めるOGPも設定しておくと、サイトの見え方がひととおり整います。タグの作成には<a href="/meta-tag-generator/">メタタグ生成ツール</a>が使えます。</p>`,
};
