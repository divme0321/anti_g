// アスペクト比早見表とCSS aspect-ratio — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'aspect-ratio-css-guide',
  title: 'アスペクト比早見表とCSS aspect-ratioの使い方【16:9・黄金比】',
  description:
    '16:9・4:3・黄金比など代表的なアスペクト比の早見表と、OGP・YouTube・InstagramなどSNS画像の推奨サイズ一覧、CSS aspect-ratioプロパティの実践的な使い方をコード例付きでまとめたリファレンスです。',
  date: '2026-07-25',
  category: 'リファレンス',
  tags: ['CSS', 'デザイン', '画像'],
  relatedTools: ['aspect-ratio-calculator', 'image-compressor', 'meta-tag-generator'],
  body: `<p>アスペクト比（縦横比）は、動画埋め込み・サムネイル・OGP画像・バナーなど、Web制作のあらゆる場面で登場します。この記事では、16:9や黄金比など代表的な比率の早見表、SNS・広告画像の推奨サイズ一覧、そしてCSSの<code>aspect-ratio</code>プロパティを使った実装方法までをまとめます。「幅800pxで16:9なら高さは何px？」のような個別の計算は<a href="/aspect-ratio-calculator">アスペクト比計算機</a>で一発で求められます。</p>

<h2>代表的なアスペクト比の早見表</h2>
<p>まず、実務で頻出する比率とその用途、代表的な解像度を一覧にします。</p>
<table>
<thead><tr><th>比率</th><th>小数</th><th>主な用途</th><th>代表的な解像度</th></tr></thead>
<tbody>
<tr><td><strong>16:9</strong></td><td>約1.78</td><td>動画・PCモニター・スライドの標準</td><td>1920×1080、1280×720</td></tr>
<tr><td><strong>4:3</strong></td><td>約1.33</td><td>旧来のモニター・書類・タブレット</td><td>1024×768、800×600</td></tr>
<tr><td><strong>1:1</strong></td><td>1.00</td><td>アイコン・プロフィール画像・SNS正方形投稿</td><td>1080×1080、512×512</td></tr>
<tr><td><strong>3:2</strong></td><td>1.50</td><td>デジタルカメラ写真・35mmフィルム</td><td>3000×2000、1620×1080</td></tr>
<tr><td><strong>21:9</strong></td><td>約2.33</td><td>ウルトラワイドモニター・シネマスコープ</td><td>2560×1080、3440×1440</td></tr>
<tr><td><strong>9:16</strong></td><td>約0.56</td><td>スマホ縦動画（ショート・リール・ストーリーズ）</td><td>1080×1920</td></tr>
<tr><td><strong>黄金比（1:1.618）</strong></td><td>約1.62</td><td>ロゴ・カード・レイアウトの比率設計</td><td>1000×618 など</td></tr>
</tbody>
</table>
<p>黄金比は16:9（1.78）と3:2（1.50）の中間にあたる比率で、名刺やカードUIなど「横長すぎず安定して見える」形状を作りたいときの目安になります。</p>

<h2>SNS・広告画像の推奨サイズ一覧</h2>
<p>SNSやOGPの画像は、プラットフォームごとに推奨サイズが決まっています。サイズが合わないと自動トリミングで重要な部分が切れるため、書き出し時点で合わせておくのが確実です。</p>
<table>
<thead><tr><th>用途</th><th>推奨サイズ</th><th>比率</th></tr></thead>
<tbody>
<tr><td>OGP画像（X・Facebook等のリンクカード）</td><td><strong>1200×630</strong></td><td>約1.91:1</td></tr>
<tr><td>YouTubeサムネイル</td><td><strong>1280×720</strong></td><td>16:9</td></tr>
<tr><td>Instagramフィード（正方形）</td><td>1080×1080</td><td>1:1</td></tr>
<tr><td>Instagramフィード（縦長）</td><td>1080×1350</td><td>4:5</td></tr>
<tr><td>Instagramリール / TikTok / ショート動画</td><td>1080×1920</td><td>9:16</td></tr>
<tr><td>X（旧Twitter）ヘッダー</td><td>1500×500</td><td>3:1</td></tr>
<tr><td>ディスプレイ広告（レクタングル）</td><td>300×250</td><td>6:5</td></tr>
</tbody>
</table>
<p>OGP画像のサイズはメタタグの<code>og:image</code>とあわせて設定します。メタタグ一式の生成には<a href="/meta-tag-generator">メタタグ生成ツール</a>が使えます。また、大きな画像はそのまま置くと表示速度に響くため、書き出し後に<a href="/image-compressor">画像圧縮ツール</a>でファイルサイズを落としておくとよいでしょう。</p>

<h2>CSS aspect-ratioプロパティの使い方</h2>
<p>かつて縦横比の維持には後述のpadding-topハックが必要でしたが、現在は<code>aspect-ratio</code>プロパティ一発で指定できます。主要ブラウザはすべて対応済みです。</p>
<h3>基本の書き方</h3>
<p><code>幅 / 高さ</code>の形式で指定します。幅だけ決めれば高さが自動計算されます。</p>
<pre><code>.thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
}

/* 正方形は 1 でもOK */
.avatar {
  aspect-ratio: 1;
}</code></pre>
<h3>レスポンシブな動画埋め込み</h3>
<p>YouTubeなどの<code>iframe</code>は、そのままだと固定サイズで埋め込まれます。<code>aspect-ratio</code>を使えば、親要素の幅に追従しながら16:9を維持できます。</p>
<pre><code>.video-embed iframe {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border: 0;
}</code></pre>
<h3>画像のトリミング（object-fitとの組み合わせ）</h3>
<p>カード一覧などで元画像の比率がバラバラでも、<code>aspect-ratio</code>で枠の比率を固定し、<code>object-fit: cover</code>で中身を切り抜けば整然と並びます。</p>
<pre><code>.card img {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;   /* 比率を保ったまま枠を満たすように切り抜く */
  object-position: center; /* 切り抜きの基準位置 */
}</code></pre>
<p><code>object-fit: contain</code>にすると切り抜かずに全体を収め、余白ができます。写真は<code>cover</code>、ロゴや図版は<code>contain</code>が使い分けの目安です。</p>

<h2>旧来のpadding-topハックとの比較</h2>
<p><code>aspect-ratio</code>登場以前は、「paddingのパーセント値は親要素の幅を基準に計算される」仕様を利用したハックが定番でした。</p>
<pre><code>/* 旧: padding-topハック（16:9 = 9÷16 = 56.25%） */
.video-wrapper {
  position: relative;
  padding-top: 56.25%;
}
.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}</code></pre>
<p>両者の違いを整理します。</p>
<table>
<thead><tr><th>項目</th><th>aspect-ratio</th><th>padding-topハック</th></tr></thead>
<tbody>
<tr><td>記述量</td><td>1行</td><td>ラッパー要素＋絶対配置が必要</td></tr>
<tr><td>HTML構造</td><td>変更不要</td><td>ラッパー<code>div</code>の追加が必要</td></tr>
<tr><td>比率の指定</td><td><code>16 / 9</code>と直感的</td><td>百分率への換算が必要（56.25%）</td></tr>
<tr><td>コンテンツによる高さ超過</td><td>中身が大きければ自然に伸びる</td><td>はみ出すか、追加の対処が必要</td></tr>
<tr><td>対応ブラウザ</td><td>2021年以降の主要ブラウザ</td><td>ほぼすべて（レガシー含む）</td></tr>
</tbody>
</table>
<p>新規実装で<code>padding-top</code>ハックを選ぶ理由はもうありません。既存コードでハックを見つけたら、リファクタリングの際に<code>aspect-ratio</code>へ置き換えると、HTML構造ごとシンプルにできます。</p>

<h2>まとめ</h2>
<ul>
<li>動画・モニターの標準は16:9、スマホ縦動画は9:16、写真は3:2が基本の比率です。</li>
<li>OGPは1200×630、YouTubeサムネは1280×720、Instagram正方形は1080×1080で書き出します。</li>
<li>縦横比の維持は<code>aspect-ratio: 16 / 9</code>の1行で完結します。</li>
<li>比率の揃わない画像は<code>aspect-ratio</code>＋<code>object-fit: cover</code>で枠に合わせて切り抜けます。</li>
<li>padding-topハックはレガシー対応以外では不要。見つけたら置き換えを検討しましょう。</li>
<li>個別の寸法計算は<a href="/aspect-ratio-calculator">アスペクト比計算機</a>で素早く求められます。</li>
</ul>`,
};
