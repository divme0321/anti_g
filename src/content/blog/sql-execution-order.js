// SQLの実行順序 — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'sql-execution-order',
  title: 'SQLの実行順序を理解する: SELECT文が評価される順番とWHERE・HAVINGの違い',
  description:
    'SELECT文は書いた順ではなくFROMから評価されます。句ごとの評価順を表で整理し、WHEREで別名が使えない理由、WHEREとHAVINGの使い分け、LEFT JOINの条件をONとWHEREのどちらに書くかを例で解説します。',
  date: '2026-11-18',
  category: '入門ガイド',
  tags: ['SQL', 'データベース', 'デバッグ'],
  relatedTools: ['sql-formatter', 'diff-checker', 'csv-json-converter'],
  body: `<p>「SELECTで付けた別名がWHEREで使えない」「集計した結果で絞り込みたいのにエラーになる」——SQLを書き始めた頃につまずくこうした問題の多くは、<strong>SELECT文が書いた順番どおりには評価されない</strong>ことを知ると説明がつきます。この記事では、句が評価される論理的な順序を整理し、その順序から説明できる代表的なエラーと書き方を取り上げます。</p>

<h2>書く順番と評価される順番</h2>
<p>SELECT文は<code>SELECT</code>から書き始めますが、データベースが意味を解釈する順番は<code>FROM</code>からです。</p>
<table>
<thead><tr><th>評価順</th><th>句</th><th>やること</th></tr></thead>
<tbody>
<tr><td>1</td><td><code>FROM</code> / <code>JOIN</code> / <code>ON</code></td><td>対象のテーブルを決め、結合する</td></tr>
<tr><td>2</td><td><code>WHERE</code></td><td>行を絞り込む</td></tr>
<tr><td>3</td><td><code>GROUP BY</code></td><td>行をグループにまとめる</td></tr>
<tr><td>4</td><td><code>HAVING</code></td><td>グループを絞り込む</td></tr>
<tr><td>5</td><td><code>SELECT</code></td><td>出力する列と式を計算する（ウィンドウ関数もここ）</td></tr>
<tr><td>6</td><td><code>DISTINCT</code></td><td>重複した行を取り除く</td></tr>
<tr><td>7</td><td><code>ORDER BY</code></td><td>並べ替える</td></tr>
<tr><td>8</td><td><code>LIMIT</code> / <code>OFFSET</code></td><td>取り出す行数を制限する</td></tr>
</tbody>
</table>
<p>これは「結果がこの順で処理したのと同じになる」という<strong>論理的な順序</strong>です。実際の処理では、データベースのオプティマイザがインデックスや統計情報を見て、もっと効率のよい手順に組み替えます。実際にどう処理されるかは<code>EXPLAIN</code>で確認します。論理的な順序は「何が書けて何が書けないか」「結果がどうなるか」を理解するための道具だと考えてください。</p>
<p>長いクエリは、句ごとに改行されているだけで順序を追いやすくなります。1行につながったSQLは<a href="/sql-formatter/">SQL整形ツール</a>で整えてから読むと楽です。</p>

<h2>WHEREでSELECTの別名が使えない理由</h2>
<p>次のクエリは、多くのデータベースでエラーになります。</p>
<pre><code>SELECT price * quantity AS total
FROM order_items
WHERE total &gt; 10000;   -- エラー: total という列はない</code></pre>
<p><code>WHERE</code>は2番目、<code>SELECT</code>は5番目に評価されます。<code>WHERE</code>の時点では、まだ<code>total</code>という別名が存在しません。式をそのまま書くか、サブクエリやCTE（<code>WITH</code>句）で一段包みます。</p>
<pre><code>-- 式をそのまま書く
SELECT price * quantity AS total
FROM order_items
WHERE price * quantity &gt; 10000;

-- CTEで包む
WITH t AS (
  SELECT price * quantity AS total
  FROM order_items
)
SELECT total FROM t WHERE total &gt; 10000;</code></pre>
<p>一方、<code>ORDER BY</code>は<code>SELECT</code>より後なので、別名をそのまま使えます。</p>
<pre><code>SELECT price * quantity AS total
FROM order_items
ORDER BY total DESC;   -- 使える</code></pre>
<p>なお、MySQLなど一部のデータベースは<code>GROUP BY</code>や<code>HAVING</code>でSELECTの別名を使える拡張を持っています。別のデータベースへ移すと動かなくなることがあるため、移植性が必要なら頼らないほうが安全です。</p>

<h2>WHEREとHAVINGの違い</h2>
<p>どちらも絞り込みですが、対象が違います。<code>WHERE</code>はグループにまとめる<strong>前の行</strong>を、<code>HAVING</code>はまとめた<strong>後のグループ</strong>を絞り込みます。</p>
<pre><code>SELECT customer_id, SUM(amount) AS total
FROM orders
WHERE status = 'paid'          -- 集計の前に、支払い済みの行だけにする
GROUP BY customer_id
HAVING SUM(amount) &gt;= 50000;   -- 集計の後に、合計5万円以上の顧客だけにする</code></pre>
<p><code>WHERE</code>に<code>SUM(amount) &gt;= 50000</code>と書くとエラーになります。<code>WHERE</code>の時点ではまだグループが作られておらず、合計を計算できないためです。</p>
<p>逆に、集計を使わない条件を<code>HAVING</code>に書いても動くことはありますが、<code>WHERE</code>に書くべきです。先に行を減らしたほうが集計の対象が小さくなり、インデックスも使われやすくなります。</p>
<table>
<thead><tr><th>条件の種類</th><th>書く場所</th><th>例</th></tr></thead>
<tbody>
<tr><td>行ごとの値で絞る</td><td><code>WHERE</code></td><td><code>status = 'paid'</code></td></tr>
<tr><td>集計結果で絞る</td><td><code>HAVING</code></td><td><code>COUNT(*) &gt;= 3</code></td></tr>
</tbody>
</table>

<h2>GROUP BYを使うとSELECTに書ける列が限られる理由</h2>
<p><code>GROUP BY</code>は<code>SELECT</code>より前に評価されます。<code>SELECT</code>の時点で残っているのは「1グループにつき1行」のデータなので、書けるのは次の2種類だけです。</p>
<ul>
<li><code>GROUP BY</code>に指定した列（グループ内で値が1つに決まる）</li>
<li>集計関数の結果（<code>COUNT</code>・<code>SUM</code>・<code>MAX</code>など）</li>
</ul>
<pre><code>SELECT customer_id, order_date, SUM(amount)
FROM orders
GROUP BY customer_id;   -- order_date はグループ内で1つに決まらない</code></pre>
<p>1人の顧客に注文日が複数あるとき、どの日付を出すべきか決められないため、標準的な設定ではエラーになります。最新の日付が欲しいなら<code>MAX(order_date)</code>のように、どれを選ぶかを集計関数で明示します。</p>

<h2>LEFT JOINの条件はONとWHEREで結果が変わる</h2>
<p>評価順が結果に直接影響する代表例です。<code>ON</code>は結合の途中（1番目）、<code>WHERE</code>は結合が終わった後（2番目）に評価されます。</p>
<p>「全顧客と、その支払い済み注文」を出したいとします。注文のない顧客も残したい場面です。</p>
<pre><code>-- A: 条件をONに書く
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.id AND o.status = 'paid';

-- B: 条件をWHEREに書く
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.id
WHERE o.status = 'paid';</code></pre>
<p>Aは、支払い済み注文がない顧客も<code>o.id</code>がNULLの行として残ります。Bは、結合した後で<code>o.status = 'paid'</code>を満たさない行を捨てます。注文のない顧客は<code>o.status</code>がNULLなので条件を満たさず、消えてしまいます。結果として、Bは<code>INNER JOIN</code>と同じになります。</p>
<p>右側のテーブルに対する条件は<code>ON</code>に、左側のテーブルや結合後の結果に対する条件は<code>WHERE</code>に書く、と覚えておくと判断しやすくなります。</p>

<h2>ウィンドウ関数の結果で絞り込むとき</h2>
<p><code>ROW_NUMBER()</code>などのウィンドウ関数は<code>SELECT</code>の段階で計算されます。<code>WHERE</code>や<code>HAVING</code>より後なので、同じ階層では絞り込みに使えません。「顧客ごとの最新の注文1件」のような抽出は、一段包んでから絞ります。</p>
<pre><code>WITH ranked AS (
  SELECT
    o.*,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn
  FROM orders o
)
SELECT * FROM ranked WHERE rn = 1;</code></pre>

<h2>ORDER BYとLIMITの注意点</h2>
<p><code>LIMIT</code>は最後に評価されます。<code>ORDER BY</code>を書かずに<code>LIMIT 10</code>とした場合、どの10行が返るかは保証されません。テーブルに行を追加した順に見えることが多いものの、実行計画が変われば結果も変わります。</p>
<p><code>ORDER BY</code>を書いていても、並べ替えの列に同じ値の行があると、その中での順番は決まりません。ページ送りで同じ行が2回出たり、抜けたりする原因になります。主キーなど値が重複しない列を最後に加えて、順序が1通りに決まるようにします。</p>
<pre><code>SELECT id, created_at
FROM posts
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 40;</code></pre>

<h2>読みやすく書くための習慣</h2>
<ul>
<li><strong>句ごとに改行する。</strong><code>SELECT</code>・<code>FROM</code>・<code>WHERE</code>・<code>GROUP BY</code>を行頭にそろえると、評価順を目で追える。</li>
<li><strong>テーブルに短い別名を付け、列には必ず別名を添える。</strong>結合が増えたときに、どのテーブルの列かで迷わない。</li>
<li><strong>入れ子のサブクエリが深くなったらCTEに出す。</strong>上から順に読める形になり、途中の結果を個別に実行して確認しやすい。</li>
<li><strong><code>SELECT *</code>を避ける。</strong>列の追加で結果が変わるのを防ぎ、必要な列がひと目でわかる。</li>
<li><strong>変更前後のクエリは差分で比べる。</strong>整形してから<a href="/diff-checker/">テキスト差分ツール</a>にかけると、条件の変更箇所だけを確認できる。</li>
</ul>

<h2>まとめ: エラーに出会ったときの確認表</h2>
<table>
<thead><tr><th>症状</th><th>原因</th><th>対処</th></tr></thead>
<tbody>
<tr><td><code>WHERE</code>で別名が見つからない</td><td><code>WHERE</code>は<code>SELECT</code>より先に評価される</td><td>式を直接書くか、CTEで包む</td></tr>
<tr><td><code>WHERE</code>に集計関数を書いてエラー</td><td>グループ化の前に評価される</td><td><code>HAVING</code>に書く</td></tr>
<tr><td><code>GROUP BY</code>にない列を選んでエラー</td><td>グループ内で値が1つに決まらない</td><td>集計関数で選び方を明示する</td></tr>
<tr><td><code>LEFT JOIN</code>なのに行が消える</td><td>右側の条件を<code>WHERE</code>に書いている</td><td>条件を<code>ON</code>に移す</td></tr>
<tr><td>ウィンドウ関数で絞れない</td><td><code>SELECT</code>の段階で計算される</td><td>CTEで包んでから絞る</td></tr>
<tr><td>ページ送りで行が重複する</td><td>並び順が1通りに決まっていない</td><td><code>ORDER BY</code>に一意な列を足す</td></tr>
</tbody>
</table>
<p>文法エラーの多くは、「その句が評価される時点で、参照しようとしているものがすでに存在するか」を考えると原因がわかります。迷ったら、まずFROMから順に読み直してみてください。</p>`,
};
