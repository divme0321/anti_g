// メタタグ生成（SEO / OGP） — ページコンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// article 内の HTML は h2/h3/p/ul/ol/table/code のみを使用し、style属性は使わないこと。
export default {
  slug: 'meta-tag-generator',
  name: 'メタタグ生成（SEO / OGP）',
  shortDesc: 'SEO・OGP・Twitterカードのメタタグを一括生成',
  title: 'メタタグ生成（SEO・OGP対応）｜無料オンラインツール - DevToolBox',
  description:
    'タイトルや説明文を入力するだけで、SEO用メタタグ・OGP・TwitterカードのHTMLを一括生成できる無料オンラインツール。Google検索とSNSでの表示プレビュー付き。処理はブラウザ内で完結します。',
  keywords: ['メタタグ 生成', 'OGP タグ', 'meta description', 'Twitterカード', 'SEO タグ', 'og:image'],
  category: 'web',
  icon: '🏷️',
  lead:
    'ページタイトル・説明文・URL・画像などを入力すると、SEO用メタタグとOGP・Twitterカードのタグを一括生成します。Google検索結果とSNSシェア時の見え方をプレビューしながら調整できます。',
  article: `
<h2>このツールの使い方</h2>
<ol>
  <li>ページタイトルと説明文（description）を入力します。文字数カウンターが60字・160字の目安を超えると警告色で表示されます。</li>
  <li>ページURL、SNSシェア用の画像URL、キーワード、著者名を必要に応じて入力します。</li>
  <li>robots（index/noindexなど）とOGタイプ（website / article / product / profile）、Twitterハンドルを選択・入力します。</li>
  <li>右側のGoogle検索プレビューとSNSプレビューで見え方を確認し、「HTMLをコピー」ボタンで生成されたタグ一式をコピーして、HTMLの <code>&lt;head&gt;</code> 内に貼り付けます。</li>
</ol>
<p>入力内容はすべてブラウザ内で処理され、サーバーに送信されることはありません。公開前のページ情報でも安心して利用できます。</p>

<h2>メタタグとは</h2>
<p>メタタグは、HTMLの <code>&lt;head&gt;</code> 内に記述してページの情報を検索エンジンやSNS、ブラウザに伝えるためのタグです。ページ本文には表示されませんが、検索結果に出るタイトルや説明文、SNSでシェアされたときのカード表示など、「ページの外での見え方」を決める重要な役割を持ちます。</p>
<p>特に重要なのは <code>&lt;title&gt;</code> と <code>meta description</code> です。titleは検索結果の見出しとしてクリック率に直結し、descriptionは検索結果の説明文として採用されることが多い要素です。Googleの検索結果ではタイトルはおおむね全角30字前後（半角60字程度）、説明文は120〜160字程度で省略されるため、本ツールのカウンターを目安に収めるのが実務的です。</p>

<h3>OGPとTwitterカード</h3>
<p>OGP（Open Graph Protocol）は、FacebookやLINE、SlackなどでURLがシェアされた際に表示されるタイトル・説明・画像を指定する仕組みで、<code>og:title</code> や <code>og:image</code> などの <code>property</code> 属性付きメタタグで記述します。X（旧Twitter）向けには <code>twitter:card</code> 系のタグを併用します。本ツールは画像URLの有無に応じて <code>summary_large_image</code>（大きな画像付きカード）と <code>summary</code> を自動で切り替えます。</p>

<h2>よくある利用シーン</h2>
<ul>
  <li><strong>新規ページの公開準備：</strong> ランディングページやブログ記事の公開前に、SEOタグとOGPをまとめて用意する。</li>
  <li><strong>SNSシェア表示の改善：</strong> シェア時にタイトルや画像が表示されないページに、OGP・Twitterカードのタグを追加する。</li>
  <li><strong>タイトル・説明文の文字数チェック：</strong> 検索結果で省略されない長さに収まっているかをカウンターとプレビューで確認する。</li>
  <li><strong>テスト環境のnoindex設定：</strong> 公開したくないページ用に <code>noindex, nofollow</code> のrobotsタグを生成する。</li>
</ul>

<h2>OGP画像の推奨サイズ</h2>
<p>OGP画像（<code>og:image</code>）は横1200×縦630ピクセル（アスペクト比1.91:1）が事実上の標準です。このサイズであればX・Facebook・LINEなど主要サービスで大きなカードとして綺麗に表示されます。最低でも横600ピクセル以上を確保し、ファイルサイズは軽量に保つのが望ましいでしょう。また、画像URLは相対パスではなく <code>https://</code> から始まる絶対URLで指定する必要がある点に注意してください。サイトのアイコン類をまだ用意していない場合は、<a href="/favicon-generator">ファビコン作成</a>と合わせて整備すると効率的です。</p>
`,
  faq: [
    {
      q: '生成したメタタグはどこに貼り付ければよいですか？',
      a: 'HTMLの<head>タグの内側に貼り付けます。生成されるコードにはcharsetとviewportも含まれているため、既存ページに追加する場合は重複するタグがないか確認してから貼り付けてください。',
    },
    {
      q: 'タイトルと説明文は何文字にすべきですか？',
      a: '検索結果での省略を避ける目安として、タイトルは半角60字（全角約30字）以内、説明文は160字以内が推奨されます。本ツールのカウンターはこの目安を超えると警告色に変わります。',
    },
    {
      q: 'OGP画像が反映されないのはなぜですか？',
      a: 'og:imageは https:// から始まる絶対URLで、外部からアクセスできる場所に置く必要があります。また、XやFacebookはシェア情報をキャッシュするため、タグ修正後は各サービスのカード確認ツールでキャッシュを更新すると反映されます。',
    },
    {
      q: '入力したページ情報はサーバーに送信されますか？',
      a: 'いいえ。プレビューの表示もHTMLの生成もすべてブラウザ内のJavaScriptで行われ、入力内容が外部に送信されることはありません。',
    },
  ],
  related: ['favicon-generator', 'word-counter', 'url-encoder', 'html-entities'],
};
