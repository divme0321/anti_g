// JWT認証の仕組みと安全な実装 — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'jwt-authentication-guide',
  title: 'JWT認証の仕組みと安全な実装: 署名アルゴリズム・有効期限・保存場所の選び方',
  description:
    'JWTの3つのパートと標準クレームの意味、HS256・RS256・ES256の使い分け、検証で必ず確認する項目、alg=noneなどの典型的な脆弱性、トークンの保存場所と失効の設計までを整理します。',
  date: '2026-11-11',
  category: '入門ガイド',
  tags: ['JWT', 'セキュリティ', 'API', 'Web開発'],
  relatedTools: ['jwt-decoder', 'base64', 'hash-generator', 'timestamp-converter'],
  body: `<p>JWT（JSON Web Token、読みは「ジョット」）は、APIの認証で広く使われているトークン形式です。ライブラリを入れれば数行で発行と検証ができる一方、「署名されているから安全」という理解のまま実装すると、アルゴリズムの取り違えや有効期限の未検証といった事故につながります。この記事では、JWTの構造を確認したうえで、署名アルゴリズムの選び方、検証時に必ず見る項目、保存場所と失効の設計を順に整理します。</p>

<h2>JWTの構造: ドットで区切られた3つのパート</h2>
<p>JWTは、ヘッダー・ペイロード・署名の3つをドット（<code>.</code>）でつないだ1本の文字列です。仕様はRFC 7519で定められています。</p>
<pre><code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</code></pre>
<table>
<thead><tr><th>パート</th><th>中身</th><th>例（デコード後）</th></tr></thead>
<tbody>
<tr><td>ヘッダー</td><td>署名アルゴリズムとトークンの種類</td><td><code>{"alg":"HS256","typ":"JWT"}</code></td></tr>
<tr><td>ペイロード</td><td>利用者のIDや有効期限などの情報（クレーム）</td><td><code>{"sub":"1234567890","name":"John Doe","iat":1516239022}</code></td></tr>
<tr><td>署名</td><td>ヘッダーとペイロードが改ざんされていないことを示す値</td><td>バイナリ（そのままでは読めない）</td></tr>
</tbody>
</table>
<p>ヘッダーとペイロードは、JSONをBase64URLでエンコードしただけのものです。<strong>暗号化はされていません。</strong>トークンを手に入れた人は誰でも中身を読めるため、パスワードや個人情報のような秘密をペイロードに入れてはいけません。手元のトークンの中身は<a href="/jwt-decoder/">JWTデコーダー</a>で確認できます（確認にはテスト用のトークンを使ってください）。Base64URLと通常のBase64の違いは<a href="/blog/base64-reference/">Base64リファレンス</a>にまとめています。</p>

<h2>標準クレームの意味</h2>
<p>ペイロードのキーのうち、仕様で名前と意味が決められているものを登録済みクレームと呼びます。どれも必須ではありませんが、検証で使うものはほぼ決まっています。</p>
<table>
<thead><tr><th>クレーム</th><th>正式名</th><th>意味</th></tr></thead>
<tbody>
<tr><td><code>iss</code></td><td>Issuer</td><td>トークンの発行者。認証サーバーのURLなど</td></tr>
<tr><td><code>sub</code></td><td>Subject</td><td>トークンの主体。通常は利用者のID</td></tr>
<tr><td><code>aud</code></td><td>Audience</td><td>トークンの受け手。どのAPI向けに発行されたか</td></tr>
<tr><td><code>exp</code></td><td>Expiration Time</td><td>有効期限。この時刻以降は受け付けない</td></tr>
<tr><td><code>nbf</code></td><td>Not Before</td><td>有効開始時刻。この時刻より前は受け付けない</td></tr>
<tr><td><code>iat</code></td><td>Issued At</td><td>発行時刻</td></tr>
<tr><td><code>jti</code></td><td>JWT ID</td><td>トークンごとの一意なID。再利用の検出や失効リストに使う</td></tr>
</tbody>
</table>
<p><code>exp</code>・<code>nbf</code>・<code>iat</code>の値は、1970年1月1日（UTC）からの経過<strong>秒数</strong>です。JavaScriptの<code>Date.now()</code>はミリ秒を返すため、1000で割り忘れると有効期限が数万年先のトークンができあがります。値が正しいかどうかは<a href="/timestamp-converter/">UNIXタイムスタンプ変換</a>で日時に直すと確認できます。</p>

<h2>署名アルゴリズムの選び方</h2>
<p>ヘッダーの<code>alg</code>は、署名の作り方を示します。よく使われるのは次の3系統です。</p>
<table>
<thead><tr><th>alg</th><th>方式</th><th>鍵</th><th>向いている構成</th></tr></thead>
<tbody>
<tr><td><code>HS256</code></td><td>HMAC + SHA-256</td><td>発行側と検証側が同じ秘密鍵を共有</td><td>発行と検証を同じサービスが行う単純な構成</td></tr>
<tr><td><code>RS256</code></td><td>RSA署名 + SHA-256</td><td>秘密鍵で署名し、公開鍵で検証</td><td>認証サーバーと複数のAPIが分かれている構成</td></tr>
<tr><td><code>ES256</code></td><td>ECDSA（P-256）+ SHA-256</td><td>秘密鍵で署名し、公開鍵で検証</td><td>RS256と同じ構成で、署名を短くしたい場合</td></tr>
</tbody>
</table>
<p>判断の軸は「検証する側に、署名を作れる鍵を渡してよいか」です。HS256では検証する全サービスが秘密鍵を持つため、そのうち1つが侵害されると偽のトークンを発行されます。検証するサービスが複数ある、または外部に検証させる場合は、公開鍵だけを配れるRS256かES256を選びます。</p>
<p>HS256を使う場合、秘密鍵は人が考えた単語ではなく、暗号論的に安全な乱数で256ビット（32バイト）以上を用意します。短い文字列や辞書にある単語を鍵にすると、トークンを1つ入手しただけでオフラインの総当たりにかけられます。</p>

<h2>検証で必ず確認する項目</h2>
<p>トークンを受け取ったAPIは、署名が正しいことに加えて、次の項目を確認します。ライブラリによっては設定しないと確認されないものがあるため、既定の動作を一度確かめてください。</p>
<ol>
<li><strong>アルゴリズムを固定する。</strong>受け付ける<code>alg</code>をサーバー側で明示し、トークンのヘッダーに書かれた値をそのまま信用しない。</li>
<li><strong>署名を検証する。</strong>デコードしただけの値を認証の判断に使わない。</li>
<li><strong><code>exp</code>を確認する。</strong>期限切れのトークンを拒否する。サーバー間の時計のずれを見込む場合も、許容幅は数十秒から数分にとどめる。</li>
<li><strong><code>iss</code>を確認する。</strong>想定した発行者のトークンであること。</li>
<li><strong><code>aud</code>を確認する。</strong>自分のAPI向けに発行されたトークンであること。別のサービス向けのトークンを流用されるのを防ぐ。</li>
</ol>

<h2>典型的な脆弱性</h2>
<h3>alg=none を受け付けてしまう</h3>
<p>仕様には、署名を付けないことを示す<code>none</code>というアルゴリズムがあります。検証側がこれを受け付けると、攻撃者はヘッダーを<code>{"alg":"none"}</code>に書き換え、署名を空にした任意のトークンを通せます。受け付けるアルゴリズムを明示していれば起きません。</p>
<h3>RS256とHS256の取り違え</h3>
<p>RS256で運用しているサーバーが、ヘッダーの<code>alg</code>に従って検証方式を切り替える実装になっていると、攻撃者は<code>alg</code>を<code>HS256</code>に変え、<strong>公開鍵をHMACの秘密鍵として</strong>署名したトークンを作れます。公開鍵は誰でも入手できるため、これで検証を通過してしまいます。対策は同じく、アルゴリズムの固定です。</p>
<h3>デコードだけで信用する</h3>
<p>多くのライブラリには、署名を確認せずに中身を取り出す関数（<code>decode</code>など）と、署名を確認する関数（<code>verify</code>など）が別々にあります。前者の戻り値を認可の判断に使うと、署名がないのと同じ状態になります。</p>
<p>こうした注意点は、JWTの現行のベストプラクティスとしてRFC 8725にまとめられています。</p>

<h2>トークンをどこに保存するか</h2>
<p>ブラウザで動くアプリでは、保存場所によって受ける攻撃の種類が変わります。</p>
<table>
<thead><tr><th>保存場所</th><th>主なリスク</th><th>対策</th></tr></thead>
<tbody>
<tr><td><code>localStorage</code> / <code>sessionStorage</code></td><td>XSSがあると、スクリプトからトークンを読み出されて持ち出される</td><td>XSS対策の徹底、Content Security Policy、有効期限を短くする</td></tr>
<tr><td>Cookie（<code>HttpOnly</code>付き）</td><td>スクリプトからは読めないが、リクエストに自動で付くためCSRFの対象になる</td><td><code>SameSite</code>属性の指定、<code>Secure</code>属性、状態を変える操作でのCSRFトークン</td></tr>
<tr><td>メモリ上の変数のみ</td><td>ページを再読み込みすると消える</td><td>再取得の仕組み（リフレッシュトークンなど）と組み合わせる</td></tr>
</tbody>
</table>
<p>どの方法にも弱点があり、「これなら安全」という置き場所はありません。<code>HttpOnly</code>のCookieはトークンの持ち出しを防げますが、XSSがある状態では攻撃者がそのページ上から正規のリクエストを送れるため、XSS対策が不要になるわけではありません。</p>

<h2>有効期限と失効の設計</h2>
<p>JWTの利点は、APIがデータベースに問い合わせずにトークン単体で検証できることです。裏返すと、<strong>一度発行したトークンは、期限が来るまで取り消しにくい</strong>という欠点になります。ログアウトやパスワード変更の直後でも、発行済みのトークンは署名も期限も正しいままです。</p>
<p>よく採られる設計は次の組み合わせです。</p>
<ul>
<li><strong>アクセストークンの寿命を短くする。</strong>5分から15分程度にして、漏れた場合に使える時間を限る。</li>
<li><strong>リフレッシュトークンで再発行する。</strong>こちらはサーバー側で状態を持ち、失効させられるようにする。使うたびに新しいものへ交換し、古いものの再利用を検出したら一連のトークンを無効にする方式もある。</li>
<li><strong>即時の失効が必要なら失効リストを持つ。</strong><code>jti</code>を記録し、検証時に照合する。問い合わせが発生するため、JWTを使う利点は一部失われる。</li>
</ul>
<p>即時に失効させたい要件が強く、サービスが1つだけなら、サーバー側でセッションを管理する従来の方式のほうが単純で安全なことも少なくありません。JWTは、発行者と検証者が分かれている構成で力を発揮する道具です。</p>

<h2>実装前のチェックリスト</h2>
<ul>
<li>ペイロードに秘密の情報を入れていない</li>
<li>受け付けるアルゴリズムをサーバー側で固定している（<code>none</code>を受け付けない）</li>
<li>認可の判断には、署名を検証した結果だけを使っている</li>
<li><code>exp</code>・<code>iss</code>・<code>aud</code>を検証している</li>
<li><code>exp</code>の単位が秒になっている</li>
<li>HS256の鍵は乱数で256ビット以上、またはRS256・ES256で公開鍵を配布している</li>
<li>アクセストークンの寿命が短く、失効の方法が決まっている</li>
<li>鍵を交換する手順（ヘッダーの<code>kid</code>で鍵を識別するなど）が決まっている</li>
</ul>
<p>開発中に「なぜこのトークンが拒否されるのか」を調べるときは、まず<a href="/jwt-decoder/">JWTデコーダー</a>でヘッダーの<code>alg</code>とペイロードの<code>exp</code>・<code>aud</code>を確認すると、原因の切り分けが早くなります。署名に使われるハッシュ関数そのものの挙動は<a href="/hash-generator/">ハッシュ生成ツール</a>で確かめられます。</p>`,
};
