// 安全なテストデータの作り方 — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'safe-test-data-guide',
  title: 'テストデータに使える予約済みの値一覧: example.com・ドキュメント用IPアドレス・ダミーテキスト',
  description:
    'テストやドキュメントに実在のドメインやIPアドレスを書くと、誤送信や情報漏えいの原因になります。example.comなどの予約済みドメイン、ドキュメント用IPアドレス、ダミーテキストやIDの作り方を一覧にまとめます。',
  date: '2026-12-02',
  category: 'リファレンス',
  tags: ['テスト', 'セキュリティ', 'ネットワーク', 'Web開発'],
  relatedTools: ['lorem-ipsum', 'uuid-generator', 'password-generator', 'cidr-calculator'],
  body: `<p>テストコードや設定例、ドキュメントに、思いついたドメインやメールアドレスを書いていないでしょうか。<code>test.com</code>や<code>aaa@aaa.com</code>は実在するドメインで、そこへテストメールが実際に送られてしまう事故は珍しくありません。インターネットの標準には、<strong>例示やテストのために予約され、実在の誰にも届かないことが保証された値</strong>が用意されています。この記事では、それらを用途別の一覧にまとめます。</p>

<h2>なぜ適当な値を使ってはいけないのか</h2>
<ul>
<li><strong>実在の相手に届く。</strong><code>test.com</code>・<code>abc.com</code>・<code>sample.jp</code>のような短いドメインは、ほぼ確実に誰かが所有している。テスト環境から送ったメールや通知が、その所有者に届く。</li>
<li><strong>今は存在しなくても、将来取得される。</strong>未登録のドメインは誰でも取得できる。ドキュメントに書いたドメインを第三者が取得し、利用者を誘導する例がある。</li>
<li><strong>本番データの流用は漏えいにつながる。</strong>本番の顧客データをテスト環境に複製すると、権限管理の緩い環境に個人情報が置かれることになる。</li>
<li><strong>スクリーンショットや資料に残る。</strong>実在の人物の名前やメールアドレスが、発表資料やマニュアルに写り込む。</li>
</ul>

<h2>予約済みドメイン</h2>
<p>例示用のドメインはRFC 2606とRFC 6761で予約されています。</p>
<table>
<thead><tr><th>ドメイン</th><th>種類</th><th>使いどころ</th></tr></thead>
<tbody>
<tr><td><code>example.com</code> / <code>example.net</code> / <code>example.org</code></td><td>例示用の第2レベルドメイン</td><td>ドキュメント、設定例、サンプルコード</td></tr>
<tr><td><code>.example</code></td><td>例示用のトップレベルドメイン</td><td>複数の組織を登場させる説明（<code>shop.example</code>と<code>bank.example</code>など）</td></tr>
<tr><td><code>.test</code></td><td>テスト用のトップレベルドメイン</td><td>テストコード、ローカルの開発環境</td></tr>
<tr><td><code>.invalid</code></td><td>必ず無効になるトップレベルドメイン</td><td>「名前解決に失敗する」ことを確かめるテスト</td></tr>
<tr><td><code>.localhost</code></td><td>自分自身を指すトップレベルドメイン</td><td>ローカルで動かすサービス（<code>app.localhost</code>など）</td></tr>
<tr><td><code>example.jp</code> / <code>example.co.jp</code> など</td><td>JPドメインの例示用</td><td>日本向けの文書・設定例</td></tr>
</tbody>
</table>
<p>メールアドレスが必要な場合は、<code>user@example.com</code>や<code>taro@example.jp</code>のように、これらのドメインを組み合わせます。サブドメインも自由に作れるので、<code>api.example.com</code>や<code>mail.example.org</code>といった書き方もできます。</p>
<h3>開発環境で避けたいドメイン</h3>
<p>ローカルの開発環境に<code>.dev</code>や<code>.app</code>を使うのは避けてください。これらは実在するトップレベルドメインで、ブラウザがHTTPS接続を強制するため、HTTPで動かしているローカル環境に接続できなくなります。<code>.local</code>は、ローカルネットワーク内の機器を探す仕組み（mDNS）のために予約されており、名前解決が遅くなったり競合したりします。開発環境には<code>.test</code>か<code>.localhost</code>が適しています。</p>

<h2>ドキュメント用のIPアドレス</h2>
<p>IPアドレスにも、文書と例示のために予約された範囲があります。インターネット上では使われないため、設定例に書いても実在の機器を指しません。</p>
<table>
<thead><tr><th>範囲</th><th>名前</th><th>根拠</th></tr></thead>
<tbody>
<tr><td><code>192.0.2.0/24</code></td><td>TEST-NET-1</td><td>RFC 5737</td></tr>
<tr><td><code>198.51.100.0/24</code></td><td>TEST-NET-2</td><td>RFC 5737</td></tr>
<tr><td><code>203.0.113.0/24</code></td><td>TEST-NET-3</td><td>RFC 5737</td></tr>
<tr><td><code>2001:db8::/32</code></td><td>IPv6のドキュメント用</td><td>RFC 3849</td></tr>
</tbody>
</table>
<p>「外部のIPアドレス」として例を示すときは、これらを使います。<code>1.2.3.4</code>や<code>8.8.8.8</code>は実在のアドレスなので、設定例には向きません。</p>
<p>混同しやすいのが、プライベートアドレスです。こちらは組織内のネットワークで実際に使うための範囲で、例示専用ではありません。</p>
<table>
<thead><tr><th>範囲</th><th>用途</th></tr></thead>
<tbody>
<tr><td><code>10.0.0.0/8</code></td><td>プライベートネットワーク</td></tr>
<tr><td><code>172.16.0.0/12</code></td><td>プライベートネットワーク</td></tr>
<tr><td><code>192.168.0.0/16</code></td><td>プライベートネットワーク</td></tr>
<tr><td><code>127.0.0.0/8</code></td><td>ループバック（自分自身）</td></tr>
<tr><td><code>169.254.0.0/16</code></td><td>リンクローカル（自動設定）</td></tr>
</tbody>
</table>
<p>社内ネットワークの構成を説明する文書ならプライベートアドレス、インターネット上の相手を表すならドキュメント用アドレス、と使い分けます。範囲に含まれるアドレスの数や境界は<a href="/cidr-calculator/">CIDR計算ツール</a>で確認でき、表記の読み方は<a href="/blog/cidr-subnet-guide/">CIDRとサブネットの解説記事</a>にまとめています。</p>

<h2>その他の予約済みの値</h2>
<table>
<thead><tr><th>種類</th><th>値</th><th>補足</th></tr></thead>
<tbody>
<tr><td>MACアドレス</td><td><code>00:00:5E:00:53:00</code>〜<code>00:00:5E:00:53:FF</code></td><td>RFC 7042でドキュメント用に予約</td></tr>
<tr><td>AS番号</td><td><code>64496</code>〜<code>64511</code></td><td>RFC 5398でドキュメント用に予約</td></tr>
<tr><td>UUID</td><td><code>00000000-0000-0000-0000-000000000000</code></td><td>Nil UUID。「未設定」を表す特別な値</td></tr>
</tbody>
</table>

<h2>ダミーの文章</h2>
<p>画面のレイアウトを確認するための文章には、意味のない文字列を使います。意味のある文章を入れると、レビューする人の注意が内容に向いてしまうためです。欧文では<a href="/lorem-ipsum/">Lorem Ipsum</a>が定番です。</p>
<p>日本語の画面では、欧文のダミーだけで確認すると問題を見落とします。次の点は日本語の文章で確かめてください。</p>
<ul>
<li><strong>文字の幅。</strong>全角文字は欧文より幅があり、同じ文字数でも収まらないことがある。</li>
<li><strong>折り返し。</strong>日本語は単語の間に空白がなく、どこでも折り返す。句読点が行頭に来ないかも確認する。</li>
<li><strong>長さの両極端。</strong>1文字の名前、非常に長い名前、長い英単語やURL（折り返されずにはみ出す）を混ぜる。</li>
<li><strong>特殊な文字。</strong>絵文字、半角カタカナ、旧字体、記号を含む値で表示が崩れないかを見る。</li>
</ul>

<h2>ダミーの個人情報</h2>
<p>氏名や住所、電話番号には、ドメインのような「標準で予約された値」がほとんどありません。次の方針で作ります。</p>
<table>
<thead><tr><th>項目</th><th>作り方</th></tr></thead>
<tbody>
<tr><td>氏名</td><td>「山田 太郎」「テスト 花子」など、明らかに例とわかる名前にする。実在の有名人や同僚の名前は使わない</td></tr>
<tr><td>メールアドレス</td><td><code>example.com</code>などの予約済みドメインを使う</td></tr>
<tr><td>住所</td><td>架空の番地にする。実在の個人宅を指さないようにする</td></tr>
<tr><td>電話番号</td><td>実在の番号に当たる可能性がある。テスト環境からSMSや自動音声が発信されない設定にしたうえで使う</td></tr>
<tr><td>クレジットカード番号</td><td>決済サービスが公開しているテスト用の番号を、テスト環境でのみ使う。実在のカード番号は入力しない</td></tr>
</tbody>
</table>
<p>電話番号やカード番号のように、値そのものの安全性を保証しにくい項目では、<strong>テスト環境から外部へ送信されない仕組み</strong>を作ることが本質的な対策です。メールは捕捉用のサーバーに向け、SMSや決済は各サービスのテストモードを使います。</p>

<h2>IDとパスワード</h2>
<p>テスト用のレコードのIDは、<a href="/uuid-generator/">UUID生成ツール</a>で作れば、他のデータと衝突する心配がありません。バージョンによる違いは<a href="/blog/uuid-v4-v7-guide/">UUID v4とv7の解説記事</a>を参照してください。</p>
<p>テスト用アカウントのパスワードに<code>password</code>や<code>test1234</code>を使うと、その環境がインターネットから見える状態になったときに真っ先に破られます。テスト用であっても<a href="/password-generator/">パスワード生成ツール</a>で作った値を使い、本番と同じ値を使い回さないでください。APIキーやトークンの例を文書に書くときは、<code>YOUR_API_KEY</code>のように、明らかに置き換えが必要だとわかる文字列にします。本物に似た形式の文字列を書くと、秘密情報の検出ツールが誤って反応したり、読み手が本物と勘違いしたりします。</p>

<h2>本番データを使いたくなったとき</h2>
<p>「現実的なデータでないと不具合を再現できない」という理由で、本番データをテスト環境に持ち込みたくなることがあります。その場合は、次の順に検討します。</p>
<ol>
<li><strong>生成したデータで再現できないか。</strong>件数や値の分布を本番に似せた架空のデータを作る。</li>
<li><strong>必要な列だけに絞れないか。</strong>不具合の再現に関係しない個人情報の列を除く。</li>
<li><strong>マスキングする。</strong>氏名・メールアドレス・電話番号などを、形式を保った別の値に置き換える。メールアドレスは予約済みドメインに置き換えると、誤送信も防げる。</li>
</ol>
<p>マスキングしたデータでも、複数の列を組み合わせると個人を特定できる場合があります。持ち込む範囲は最小限にしてください。</p>

<h2>早見表</h2>
<table>
<thead><tr><th>必要なもの</th><th>使う値</th></tr></thead>
<tbody>
<tr><td>例示用のドメイン</td><td><code>example.com</code>、<code>example.jp</code>、<code>.example</code></td></tr>
<tr><td>開発環境のドメイン</td><td><code>.test</code>、<code>.localhost</code></td></tr>
<tr><td>メールアドレス</td><td><code>user@example.com</code></td></tr>
<tr><td>外部のIPv4アドレス</td><td><code>192.0.2.1</code>、<code>198.51.100.1</code>、<code>203.0.113.1</code></td></tr>
<tr><td>IPv6アドレス</td><td><code>2001:db8::1</code></td></tr>
<tr><td>文章</td><td>Lorem Ipsum ＋ 日本語の長短を混ぜた文章</td></tr>
<tr><td>ID</td><td>生成したUUID</td></tr>
<tr><td>APIキーの例</td><td><code>YOUR_API_KEY</code>のような明示的な置き換え文字列</td></tr>
</tbody>
</table>`,
};
