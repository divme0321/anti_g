// 正規表現入門 — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'regex-basics',
  title: '正規表現入門：基本パターンとよく使う実例30',
  description:
    '正規表現のメタ文字・量指定子・文字クラス・アンカー・グループを表で整理し、メールアドレス・電話番号・郵便番号・URL・日付・全角カナなど実務でよく使うパターンを解説付きで紹介する入門リファレンスです。',
  date: '2026-07-09',
  category: '入門ガイド',
  tags: ['正規表現', 'JavaScript', 'テキスト処理'],
  relatedTools: ['regex-tester', 'word-counter', 'diff-checker'],
  body: `<p>正規表現（Regular Expression）は、文字列のパターンを記号で表現し、検索・抽出・置換・入力チェックを行うための記法です。この記事では、最初に覚えるべき基本要素（メタ文字・量指定子・文字クラス・アンカー・グループ）を表で整理し、後半ではメールアドレスや電話番号、郵便番号など、実務でそのままコピーして使えるパターンを解説付きで紹介します。読みながら<a href="/regex-tester">正規表現テスター</a>で実際に動かすと理解が早まります。</p>

<h2>基本要素1：メタ文字</h2>
<p>メタ文字は、それ自体ではなく特別な意味を持つ文字です。メタ文字そのものを検索したい場合は<code>\\.</code>のようにバックスラッシュでエスケープします。</p>
<table>
<thead><tr><th>記号</th><th>意味</th><th>例</th></tr></thead>
<tbody>
<tr><td><code>.</code></td><td>改行以外の任意の1文字</td><td><code>a.c</code> は abc、a1c にマッチ</td></tr>
<tr><td><code>|</code></td><td>OR（いずれか）</td><td><code>cat|dog</code> は cat または dog</td></tr>
<tr><td><code>\\d</code></td><td>数字1文字（<code>[0-9]</code>と同じ）</td><td><code>\\d\\d</code> は 42 にマッチ</td></tr>
<tr><td><code>\\w</code></td><td>英数字とアンダースコア</td><td><code>\\w+</code> は user_name にマッチ</td></tr>
<tr><td><code>\\s</code></td><td>空白文字（スペース、タブ、改行）</td><td><code>a\\sb</code> は「a b」にマッチ</td></tr>
<tr><td><code>\\D</code> <code>\\W</code> <code>\\S</code></td><td>それぞれの否定（数字以外など）</td><td><code>\\D+</code> は abc にマッチ</td></tr>
</tbody>
</table>

<h2>基本要素2：量指定子</h2>
<p>直前の要素を「何回繰り返すか」を指定します。</p>
<table>
<thead><tr><th>記号</th><th>意味</th><th>例</th></tr></thead>
<tbody>
<tr><td><code>*</code></td><td>0回以上</td><td><code>ab*</code> は a、ab、abbb にマッチ</td></tr>
<tr><td><code>+</code></td><td>1回以上</td><td><code>ab+</code> は ab、abbb にマッチ（a は不可）</td></tr>
<tr><td><code>?</code></td><td>0回または1回</td><td><code>colou?r</code> は color と colour</td></tr>
<tr><td><code>{n}</code></td><td>ちょうどn回</td><td><code>\\d{4}</code> は 2026 にマッチ</td></tr>
<tr><td><code>{n,m}</code></td><td>n回以上m回以下</td><td><code>\\d{2,4}</code> は 12〜1234</td></tr>
<tr><td><code>*?</code> <code>+?</code></td><td>最短マッチ（非貪欲）</td><td><code>&lt;.+?&gt;</code> はタグ1個ずつにマッチ</td></tr>
</tbody>
</table>
<p>量指定子は標準では<strong>できるだけ長くマッチする（貪欲マッチ）</strong>点に注意してください。HTMLタグの抽出で<code>&lt;.+&gt;</code>と書くと行全体を飲み込んでしまうため、<code>?</code>を付けて最短マッチにするのが定石です。</p>

<h2>基本要素3：文字クラス</h2>
<p>角括弧<code>[ ]</code>で「この中のどれか1文字」を表します。</p>
<ul>
<li><code>[abc]</code> — a、b、c のいずれか1文字</li>
<li><code>[a-z]</code> — 小文字アルファベットのいずれか（ハイフンで範囲指定）</li>
<li><code>[0-9a-fA-F]</code> — 16進数で使う文字（範囲は複数並べられます）</li>
<li><code>[^abc]</code> — a、b、c <strong>以外</strong>の1文字（先頭の<code>^</code>は否定）</li>
</ul>

<h2>基本要素4：アンカー</h2>
<p>アンカーは文字ではなく「位置」にマッチします。入力チェックでは必須の要素です。</p>
<ul>
<li><code>^</code> — 行（文字列）の先頭</li>
<li><code>$</code> — 行(文字列)の末尾</li>
<li><code>\\b</code> — 単語の境界。<code>\\bcat\\b</code> は cat にマッチし、category にはマッチしません</li>
</ul>
<p>フォームのバリデーションで<code>^</code>と<code>$</code>を付け忘れると、「文字列の一部だけ条件を満たす」入力を通してしまいます。たとえば<code>\\d{4}</code>だけでは「abc1234def」も通るため、<code>^\\d{4}$</code>と書く必要があります。</p>

<h2>基本要素5：グループ</h2>
<ul>
<li><code>(abc)</code> — グループ化。量指定子をまとめて適用（<code>(ab)+</code>）したり、マッチ結果を後から参照したりできます。</li>
<li><code>(?:abc)</code> — キャプチャしないグループ。参照が不要ならこちらの方が高速で意図も明確です。</li>
<li><code>(?&lt;name&gt;abc)</code> — 名前付きグループ。<code>match.groups.name</code>のように名前で取り出せます。</li>
</ul>

<h3>あわせて覚えるフラグ</h3>
<p>パターン本体に加え、動作を変えるフラグも頻繁に使います。JavaScriptでは<code>/pattern/gi</code>のように末尾に付けます。<code>g</code>は最初の1件で止めず全件マッチ（置換なら全置換）、<code>i</code>は大文字小文字を区別しない、<code>m</code>は複数行モードで<code>^</code>と<code>$</code>が各行の先頭・末尾にマッチするようになります。「置換が1件しか効かない」ときは<code>g</code>の付け忘れをまず疑ってください。</p>

<h2>実務でよく使うパターン実例</h2>
<p>ここからは日本の実務でよく使う実例です。いずれもJavaScript想定で、入力チェック用に<code>^</code>と<code>$</code>を付けています。</p>

<h3>メールアドレス</h3>
<pre><code>^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$</code></pre>
<p>実用上十分な簡易チェックです。RFC完全準拠の正規表現は極端に複雑になるため、フォームでは「形式をざっくり確認し、確認メール送信で実在を検証する」方針が現実的です。</p>

<h3>電話番号（日本・ハイフンあり）</h3>
<pre><code>^0\\d{1,4}-\\d{1,4}-\\d{3,4}$</code></pre>
<p>固定電話と携帯電話の両方に対応します。ハイフンなしも許容するなら<code>^0\\d{9,10}$</code>を<code>|</code>で組み合わせます。</p>

<h3>郵便番号（日本）</h3>
<pre><code>^\\d{3}-?\\d{4}$</code></pre>
<p><code>-?</code>によりハイフンの有無どちらも受け付けます。「123-4567」「1234567」の両方にマッチします。</p>

<h3>URL</h3>
<pre><code>^https?://[\\w!?/+\\-_~=;.,*&amp;@#$%()'\\[\\]]+$</code></pre>
<p><code>https?</code>の<code>?</code>で http と https の両方を許容します。本文からURLを抽出する用途では、先頭の<code>^</code>と末尾の<code>$</code>を外して使います。</p>

<h3>日付（YYYY-MM-DD）</h3>
<pre><code>^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$</code></pre>
<p>月は01〜12、日は01〜31に制限しています。「2月30日」のような暦上あり得ない日付までは検出できないため、厳密な検証はDateオブジェクトと併用します。</p>

<h3>全角カタカナのみ</h3>
<pre><code>^[ァ-ヶー]+$</code></pre>
<p>フリガナ欄の検証によく使います。長音記号「ー」を忘れると「サーバー」が弾かれるので注意してください。ひらがなのみは<code>^[ぁ-んー]+$</code>です。</p>

<h3>半角英数字のみ（ユーザーID等）</h3>
<pre><code>^[a-zA-Z0-9_]{4,20}$</code></pre>
<p>文字種と文字数（4〜20文字）を同時に検証できます。要件に合わせて<code>{n,m}</code>を調整してください。</p>

<p>これらのパターンは、対象文字列によっては意図しないマッチが起きることがあります。実データを<a href="/regex-tester">正規表現テスター</a>に貼り付けて、マッチ範囲を目視確認してから本番コードに組み込むことをおすすめします。</p>

<h2>まとめ</h2>
<ul>
<li>正規表現は「メタ文字・量指定子・文字クラス・アンカー・グループ」の5要素の組み合わせです。</li>
<li>入力チェックでは<code>^</code>と<code>$</code>を必ず付け、部分一致のすり抜けを防ぎます。</li>
<li>量指定子は標準で貪欲マッチのため、抽出用途では<code>+?</code>などの最短マッチを検討します。</li>
<li>完璧な1本を目指すより、簡潔なパターン+別手段の検証（Dateや確認メール）の併用が実務的です。</li>
</ul>`,
};
