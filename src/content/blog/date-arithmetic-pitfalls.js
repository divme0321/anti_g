// プログラムでの日付計算の落とし穴 — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'date-arithmetic-pitfalls',
  title: 'プログラムでの日付計算の落とし穴: 月の加算・日数の差・うるう年の正しい扱い方',
  description:
    '1月31日の1か月後は何日か、日数の差を24時間で割ってよいか。JavaScript・Python・SQLで日付を計算するときに間違えやすい点を、月末の加算、文字列の解釈、うるう年判定、期間の数え方に分けて解説します。',
  date: '2026-11-25',
  category: '入門ガイド',
  tags: ['日付', 'JavaScript', 'Python', 'SQL', 'デバッグ'],
  relatedTools: ['date-calculator', 'timestamp-converter', 'timezone-converter', 'cron-next-run'],
  body: `<p>日付の計算は単純に見えて、月の長さがそろっていないこと、うるう年があること、タイムゾーンによって「今日」が変わることから、思わぬ不具合の原因になります。月末にだけ失敗するバッチ、1日ずれる有効期限、うるう年にだけ落ちるテストは、どれもよくある話です。この記事では、言語をまたいで共通する落とし穴と、JavaScript・Python・SQLそれぞれの挙動を整理します。手元で結果を確かめたいときは<a href="/date-calculator/">日付計算ツール</a>が使えます。</p>

<h2>「1か月後」は言語によって答えが違う</h2>
<p>1月31日の1か月後は何日でしょうか。2月31日は存在しないため、処理系が何らかの方法で調整します。その方法が統一されていません。</p>
<table>
<thead><tr><th>環境</th><th>書き方</th><th>2026年1月31日 + 1か月</th><th>調整の方法</th></tr></thead>
<tbody>
<tr><td>JavaScript</td><td><code>d.setMonth(d.getMonth() + 1)</code></td><td>3月3日</td><td>あふれた日数を翌月へ繰り越す</td></tr>
<tr><td>Python</td><td><code>d + relativedelta(months=1)</code></td><td>2月28日</td><td>月末に丸める</td></tr>
<tr><td>MySQL</td><td><code>DATE_ADD(d, INTERVAL 1 MONTH)</code></td><td>2月28日</td><td>月末に丸める</td></tr>
<tr><td>PostgreSQL</td><td><code>d + INTERVAL '1 month'</code></td><td>2月28日</td><td>月末に丸める</td></tr>
</tbody>
</table>
<p>JavaScriptの<code>Date</code>は、存在しない日付を「2月31日 = 2月28日の3日後」と解釈して3月3日にします。2月を飛び越えるため、「毎月の請求日」のような処理に使うと2月分が抜けます。月末に丸めたい場合は、自分で調整します。</p>
<pre><code>function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);                         // いったん1日にして、あふれを防ぐ
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));       // 元の日か、その月の末日の早いほう
  return d;
}</code></pre>
<p><code>new Date(年, 月 + 1, 0)</code>は「翌月の0日」、つまりその月の末日を返します。月末の日付を得る定番の書き方です。</p>

<h2>月の加算は元に戻らない</h2>
<p>月末に丸める方式には、別の落とし穴があります。足してから引いても、元の日付に戻りません。</p>
<pre><code>1月31日 + 1か月 = 2月28日
2月28日 - 1か月 = 1月28日   （1月31日には戻らない）</code></pre>
<p>同じ理由で、「1か月ずつ12回足す」と「12か月を1回足す」は結果が変わることがあります。1月31日から1か月ずつ足していくと、2月28日になった時点で日が28に変わり、以降ずっと28日になります。繰り返しの日付を作るときは、<strong>前回の結果に足すのではなく、最初の日付に「n か月」を足す</strong>ようにします。</p>

<h2>日数の差を24時間で割ってはいけない場合</h2>
<p>2つの日付の差を求めるとき、ミリ秒の差を86,400,000（24時間）で割る書き方がよく使われます。</p>
<pre><code>const days = (end - start) / 86400000;</code></pre>
<p>この方法は、<strong>夏時間のある地域で1日が23時間や25時間になる日</strong>をまたぐと、結果が整数になりません。日本には夏時間がありませんが、海外の利用者の端末で動くコードや、サーバーのタイムゾーンが海外に設定されている場合には影響します。</p>
<p>日付だけの差を求めるなら、両方をUTCの0時にそろえてから計算します。UTCには夏時間がないため、差は必ず24時間の倍数になります。</p>
<pre><code>function diffDays(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86400000);
}</code></pre>
<p>Pythonの<code>date</code>型どうしの引き算は、時刻を持たないためこの問題が起きません。</p>
<pre><code>from datetime import date
(date(2026, 3, 1) - date(2026, 2, 1)).days   # 28</code></pre>

<h2>JavaScriptの日付文字列は書き方で意味が変わる</h2>
<p>JavaScriptでは、文字列から<code>Date</code>を作るときの解釈が形式によって異なります。</p>
<table>
<thead><tr><th>書き方</th><th>解釈</th><th>日本時間での結果</th></tr></thead>
<tbody>
<tr><td><code>new Date('2026-03-01')</code></td><td>UTCの0時</td><td>3月1日 9:00</td></tr>
<tr><td><code>new Date('2026-03-01T00:00:00')</code></td><td>ローカル時刻の0時</td><td>3月1日 0:00</td></tr>
<tr><td><code>new Date(2026, 2, 1)</code></td><td>ローカル時刻の0時</td><td>3月1日 0:00</td></tr>
<tr><td><code>new Date('2026/03/01')</code></td><td>仕様で決まっていない</td><td>実装によって異なる</td></tr>
</tbody>
</table>
<p>日付だけの形式（<code>YYYY-MM-DD</code>）はUTCとして解釈されます。日本では9時間進んだ時刻になるだけですが、UTCより西の地域（アメリカなど）では<strong>前日の日付</strong>になります。「海外の利用者だけ日付が1日ずれる」という不具合の典型的な原因です。</p>
<p>あわせて、<code>Date</code>の月は<strong>0から始まります。</strong><code>new Date(2026, 2, 1)</code>は3月1日です。<code>getMonth()</code>の戻り値も同様で、表示するときは1を足します。</p>
<p>こうした問題を避けるために、日付と時刻を型として分けて扱える<code>Temporal</code>というAPIの標準化が進んでいます。対応していない環境では、日付操作のライブラリを使うか、上のように解釈を明示して書きます。</p>

<h2>うるう年の判定</h2>
<p>「4で割り切れる年がうるう年」という判定は不完全です。正しい規則は3段階あります。</p>
<ol>
<li>4で割り切れる年はうるう年。</li>
<li>ただし、100で割り切れる年は平年。</li>
<li>ただし、400で割り切れる年はうるう年。</li>
</ol>
<pre><code>const isLeap = (y) =&gt; (y % 4 === 0 &amp;&amp; y % 100 !== 0) || y % 400 === 0;</code></pre>
<table>
<thead><tr><th>年</th><th>判定</th><th>理由</th></tr></thead>
<tbody>
<tr><td>2024</td><td>うるう年</td><td>4で割り切れる</td></tr>
<tr><td>2026</td><td>平年</td><td>4で割り切れない</td></tr>
<tr><td>2000</td><td>うるう年</td><td>400で割り切れる</td></tr>
<tr><td>2100</td><td>平年</td><td>100で割り切れ、400で割り切れない</td></tr>
</tbody>
</table>
<p>2000年がたまたまうるう年だったため、簡略化した判定でも長く問題が表面化しませんでした。自分で判定を書くより、言語の日付機能に任せるのが確実です。</p>
<p>うるう年に関連して、<strong>2月29日の1年後</strong>も環境によって結果が違います。2月28日にするものと、3月1日にするものがあります。誕生日や契約の更新日を扱う場合は、どちらにするかを仕様として決めておきます。また、1年を「365日」として加算すると、うるう年をまたいだときに1日ずれます。「1年後」は日数ではなく年の単位で加算してください。</p>

<h2>期間の数え方: 片端を含むか、両端を含むか</h2>
<p>「3月1日から3月5日まで」は何日間でしょうか。引き算をすると4ですが、カレンダーで数えると5日あります。</p>
<table>
<thead><tr><th>数え方</th><th>3月1日〜3月5日</th><th>使われる場面</th></tr></thead>
<tbody>
<tr><td>差（初日を含めない）</td><td>4日</td><td>「あと何日」、経過日数</td></tr>
<tr><td>両端を含む</td><td>5日</td><td>イベントの開催日数、休暇の日数</td></tr>
</tbody>
</table>
<p>不具合になりやすいのは、仕様を書いた人と実装した人で数え方が食い違う場合です。「30日間有効」は、開始日を1日目とするのか、開始日の翌日から数えるのかで、終了日が1日変わります。仕様には具体的な日付の例を添えると食い違いを防げます。</p>
<p>プログラムで期間を表すときは、<strong>開始を含み、終了を含まない</strong>形（半開区間）にすると扱いやすくなります。</p>
<pre><code>-- 2026年3月のデータを取り出す
WHERE created_at &gt;= '2026-03-01'
  AND created_at &lt;  '2026-04-01'</code></pre>
<p><code>BETWEEN '2026-03-01' AND '2026-03-31'</code>と書くと、列が日時型の場合に3月31日の0時0分0秒より後のデータが漏れます。<code>'2026-03-31 23:59:59'</code>と書いても、秒未満の値を持つデータが漏れます。翌月の1日「未満」と書けば、月の日数もうるう年も気にする必要がありません。</p>

<h2>「今日」はタイムゾーンで変わる</h2>
<p>サーバーがUTCで動いている場合、日本時間の午前0時から9時までは、サーバーにとってまだ「昨日」です。日次の集計や、当日限りのクーポンの判定を、サーバーの現在日付で行うと9時間ずれます。日付を判定する前に、対象とするタイムゾーンへ変換してください。保存はUTC、表示と日付の判定は利用者のタイムゾーン、という分け方が基本です。詳しくは<a href="/blog/timezone-utc-basics/">タイムゾーンとUTCの解説記事</a>で扱っています。時刻の換算は<a href="/timezone-converter/">タイムゾーン変換ツール</a>で確認できます。</p>

<h2>テストに入れておきたい日付</h2>
<table>
<thead><tr><th>日付</th><th>確かめられること</th></tr></thead>
<tbody>
<tr><td>1月31日、3月31日、5月31日</td><td>翌月に同じ日がない場合の月の加算</td></tr>
<tr><td>2月28日、2月29日</td><td>うるう年と平年の境界</td></tr>
<tr><td>12月31日、1月1日</td><td>年をまたぐ処理、年の繰り上がり</td></tr>
<tr><td>うるう年の2月29日の1年後</td><td>存在しない日付の調整方法</td></tr>
<tr><td>日本時間の0時〜9時</td><td>UTCとの日付のずれ</td></tr>
<tr><td>夏時間の切り替え日（海外向けの場合）</td><td>1日が24時間でない日の差分計算</td></tr>
</tbody>
</table>
<p>現在時刻に依存するコードは、時刻を引数として渡せるようにしておくと、これらの日付を固定してテストできます。</p>

<h2>まとめ</h2>
<ul>
<li>月の加算は、あふれを繰り越す環境（JavaScript）と月末に丸める環境がある。</li>
<li>繰り返しの日付は、最初の日付に対して計算する。</li>
<li>日数の差は、UTCにそろえるか、時刻を持たない日付型で計算する。</li>
<li>JavaScriptの<code>YYYY-MM-DD</code>形式の文字列はUTCとして解釈される。月は0始まり。</li>
<li>うるう年は言語の機能に任せ、「1年 = 365日」と書かない。</li>
<li>期間は「開始以上・終了未満」で表す。</li>
<li>「今日」を判定する前に、タイムゾーンを決める。</li>
</ul>`,
};
