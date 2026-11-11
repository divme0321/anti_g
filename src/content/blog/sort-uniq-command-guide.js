// sort・uniqコマンド実践ガイド — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'sort-uniq-command-guide',
  title: 'sort・uniqコマンド実践ガイド: 並べ替え・重複削除・出現回数の集計',
  description:
    'sortとuniqの主要オプションを早見表で整理し、数値順・列指定の並べ替え、重複削除、出現回数ランキング、2つのファイルの比較までを実例で解説します。uniqだけでは重複が消えない理由も説明します。',
  date: '2026-11-18',
  category: 'リファレンス',
  tags: ['コマンドライン', 'Linux', 'テキスト処理'],
  relatedTools: ['line-sorter', 'diff-checker', 'word-counter', 'regex-tester'],
  body: `<p>ログからアクセスの多いIPアドレスを調べる、メールアドレスのリストから重複を取り除く、2つのファイルに共通する行を探す。こうした行単位のテキスト処理は、<code>sort</code>と<code>uniq</code>の組み合わせでほとんど片付きます。この記事では、主要なオプションと定番の組み合わせを、すぐ使える形でまとめます。コマンドを使えない環境や、少量のテキストをその場で処理したい場合は、ブラウザで動く<a href="/line-sorter/">行ソート・重複削除ツール</a>が手軽です。</p>

<h2>sortの主要オプション</h2>
<table>
<thead><tr><th>オプション</th><th>意味</th><th>例</th></tr></thead>
<tbody>
<tr><td>（なし）</td><td>文字列として昇順に並べる</td><td><code>sort file.txt</code></td></tr>
<tr><td><code>-r</code></td><td>降順にする</td><td><code>sort -r file.txt</code></td></tr>
<tr><td><code>-n</code></td><td>数値として比較する</td><td><code>sort -n numbers.txt</code></td></tr>
<tr><td><code>-h</code></td><td>単位付きの数値（1K、2M、3G）として比較する</td><td><code>du -h | sort -h</code></td></tr>
<tr><td><code>-V</code></td><td>バージョン番号として比較する</td><td><code>sort -V versions.txt</code></td></tr>
<tr><td><code>-u</code></td><td>重複した行を1つにする</td><td><code>sort -u file.txt</code></td></tr>
<tr><td><code>-f</code></td><td>大文字と小文字を区別しない</td><td><code>sort -f names.txt</code></td></tr>
<tr><td><code>-k</code></td><td>並べ替えの基準にする列を指定する</td><td><code>sort -k2 file.txt</code></td></tr>
<tr><td><code>-t</code></td><td>列の区切り文字を指定する</td><td><code>sort -t, -k3 data.csv</code></td></tr>
<tr><td><code>-s</code></td><td>安定ソート（同順位の行は元の順序を保つ）</td><td><code>sort -s -k1,1 file.txt</code></td></tr>
<tr><td><code>-o</code></td><td>結果をファイルに書き出す</td><td><code>sort -o file.txt file.txt</code></td></tr>
<tr><td><code>-c</code></td><td>並べ替え済みかどうかを確認する</td><td><code>sort -c file.txt</code></td></tr>
</tbody>
</table>

<h2>数値の並べ替えには -n が必要</h2>
<p><code>sort</code>は、何も指定しないと行を文字列として比較します。数字も1文字ずつ左から比べるため、10が2より前に来ます。</p>
<pre><code>$ printf '10\\n9\\n100\\n2\\n' | sort
10
100
2
9

$ printf '10\\n9\\n100\\n2\\n' | sort -n
2
9
10
100</code></pre>
<p>ファイルサイズのように単位が付いた値は<code>-h</code>、<code>1.9.0</code>と<code>1.10.0</code>のようなバージョン番号は<code>-V</code>を使います。<code>-n</code>でバージョン番号を並べると、最初の小数点までしか数値として読まれず、期待した順になりません。</p>

<h2>列を指定して並べ替える</h2>
<p><code>-k</code>で基準にする列を、<code>-t</code>で区切り文字を指定します。区切り文字を指定しない場合は、空白が区切りになります。</p>
<pre><code># カンマ区切りの3列目を、数値として降順に
sort -t, -k3,3nr data.csv

# 2列目で並べ、同じなら1列目の数値で並べる
sort -k2,2 -k1,1n file.txt</code></pre>
<p><code>-k3</code>と書くと「3列目から行末まで」が基準になります。3列目だけを基準にしたい場合は、<code>-k3,3</code>と開始と終了の両方を書いてください。列ごとの<code>n</code>（数値）や<code>r</code>（降順）は、列番号の直後に付けられます。</p>
<p>注意点として、<code>sort</code>はCSVの引用符を理解しません。<code>"Tokyo, Japan"</code>のように値の中にカンマがあると、そこで列が分かれてしまいます。引用符を含むCSVは、表計算ソフトやCSVを解釈できる専用のツールで扱います。CSVの落とし穴は<a href="/blog/csv-json-conversion-pitfalls/">CSVとJSONの変換の記事</a>でも取り上げています。</p>

<h2>uniqは「隣り合う重複」しか消さない</h2>
<p><code>uniq</code>で重複が消えない、という疑問の原因はほぼこれです。<code>uniq</code>は、<strong>連続して並んでいる同じ行</strong>を1つにまとめるコマンドです。離れた位置にある同じ行は、別のものとして残ります。</p>
<pre><code>$ printf 'a\\nb\\na\\n' | uniq
a
b
a

$ printf 'a\\nb\\na\\n' | sort | uniq
a
b</code></pre>
<p>そのため、<code>uniq</code>の前には<code>sort</code>を置くのが定番です。単に重複を消すだけなら、<code>sort -u</code>の1つで同じ結果になります。</p>
<table>
<thead><tr><th>オプション</th><th>意味</th></tr></thead>
<tbody>
<tr><td>（なし）</td><td>連続する重複を1行にまとめる</td></tr>
<tr><td><code>-c</code></td><td>各行の出現回数を先頭に付ける</td></tr>
<tr><td><code>-d</code></td><td>重複している行だけを表示する</td></tr>
<tr><td><code>-u</code></td><td>重複していない行だけを表示する</td></tr>
<tr><td><code>-i</code></td><td>大文字と小文字を区別しない</td></tr>
</tbody>
</table>
<p><code>sort -u</code>と<code>uniq -u</code>は名前が似ていますが、意味が違います。前者は「重複を1つにまとめる」、後者は「1回しか出てこない行だけを残す」です。</p>

<h2>出現回数のランキングを作る</h2>
<p>もっともよく使う組み合わせです。</p>
<pre><code>sort file.txt | uniq -c | sort -rn | head -10</code></pre>
<ol>
<li><code>sort</code>で同じ行を隣り合わせにする。</li>
<li><code>uniq -c</code>で、行ごとの出現回数を数える。</li>
<li><code>sort -rn</code>で、回数の多い順に並べる。</li>
<li><code>head -10</code>で、上位10件を取り出す。</li>
</ol>
<p>アクセスログから、リクエストの多いIPアドレスを調べる例です。</p>
<pre><code>awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10</code></pre>
<p>ステータスコード別の件数なら、取り出す列を変えるだけです（一般的なログ形式では9列目）。</p>
<pre><code>awk '{print $9}' access.log | sort | uniq -c | sort -rn</code></pre>
<p>ステータスコードの意味は<a href="/blog/http-status-codes/">HTTPステータスコード一覧</a>で確認できます。</p>

<h2>元の順序を保ったまま重複を消す</h2>
<p><code>sort -u</code>は並べ替えを伴うため、元の順序が失われます。最初に出てきた行を残し、順序を変えずに重複だけを消したい場合は<code>awk</code>を使います。</p>
<pre><code>awk '!seen[$0]++' file.txt</code></pre>
<p>行の内容をキーにして出現回数を数え、初めて出てきたとき（数える前の値が0のとき）だけ出力する、という仕組みです。</p>

<h2>2つのファイルを比べる</h2>
<p>並べ替え済みの2つのファイルを行単位で比べるには<code>comm</code>を使います。出力は3列で、1列目が「1つ目だけにある行」、2列目が「2つ目だけにある行」、3列目が「両方にある行」です。数字のオプションで、その列を非表示にします。</p>
<table>
<thead><tr><th>目的</th><th>コマンド</th></tr></thead>
<tbody>
<tr><td>両方にある行</td><td><code>comm -12 a.txt b.txt</code></td></tr>
<tr><td>a.txtだけにある行</td><td><code>comm -23 a.txt b.txt</code></td></tr>
<tr><td>b.txtだけにある行</td><td><code>comm -13 a.txt b.txt</code></td></tr>
</tbody>
</table>
<p><code>comm</code>は、入力が並べ替え済みであることを前提にしています。並べ替えていないファイルを渡すと、結果が正しくなりません。先に<code>sort</code>してから渡します。行の中のどこが違うかまで見たい場合は、<a href="/diff-checker/">テキスト差分ツール</a>のような差分表示が向いています。</p>

<h2>日本語の並び順とロケール</h2>
<p><code>sort</code>の並び順は、環境変数のロケール設定に左右されます。同じファイルでも、サーバーと手元のPCで結果が違うことがあります。</p>
<pre><code># バイト順で並べる（どの環境でも同じ結果になり、速い）
LC_ALL=C sort file.txt</code></pre>
<p><code>LC_ALL=C</code>を付けると、文字コードのバイト順で比較します。結果が環境に依存しなくなり、処理も速くなるため、スクリプトの中では付けておくのが無難です。<code>comm</code>に渡すファイルは、<code>sort</code>と<code>comm</code>で同じロケールを使う必要があります。</p>
<p>日本語を並べる場合、バイト順では「ひらがな、カタカナ、漢字」の順になり、漢字は読みの順にはなりません。漢字を五十音順に並べるには、読みがなの列を別に用意して、その列を基準にします。全角と半角が混ざっていると別の文字として扱われるため、先に<a href="/zenkaku-hankaku/">全角・半角変換</a>でそろえておきます。</p>

<h2>うまくいかないときの確認点</h2>
<table>
<thead><tr><th>症状</th><th>原因</th><th>対処</th></tr></thead>
<tbody>
<tr><td><code>uniq</code>で重複が消えない</td><td>同じ行が隣り合っていない</td><td>先に<code>sort</code>する</td></tr>
<tr><td>同じに見える行が別扱いになる</td><td>行末の空白、改行コードの違い（CRLF）</td><td><code>tr -d '\\r'</code>でCRを除く。行末の空白を除く</td></tr>
<tr><td>10が2より前に来る</td><td>文字列として比較している</td><td><code>-n</code>を付ける</td></tr>
<tr><td>環境によって順序が違う</td><td>ロケールの違い</td><td><code>LC_ALL=C</code>を付ける</td></tr>
<tr><td>同じファイルに書き戻すと空になる</td><td><code>sort f &gt; f</code>はシェルが先にファイルを空にする</td><td><code>sort -o f f</code>を使う</td></tr>
<tr><td>列の指定が効かない</td><td>区切り文字が違う、<code>-k</code>の終了位置がない</td><td><code>-t</code>を指定し、<code>-k2,2</code>の形で書く</td></tr>
</tbody>
</table>
<p>Windowsで作ったファイルは改行コードがCRLFになっていることが多く、最後の行だけ改行がない場合と合わせて、「見た目は同じなのに重複と判定されない」原因になります。</p>

<h2>よく使う組み合わせ早見表</h2>
<table>
<thead><tr><th>やりたいこと</th><th>コマンド</th></tr></thead>
<tbody>
<tr><td>重複を消して並べる</td><td><code>sort -u file.txt</code></td></tr>
<tr><td>順序を保って重複を消す</td><td><code>awk '!seen[$0]++' file.txt</code></td></tr>
<tr><td>出現回数の多い順に並べる</td><td><code>sort file.txt | uniq -c | sort -rn</code></td></tr>
<tr><td>重複している行だけを見る</td><td><code>sort file.txt | uniq -d</code></td></tr>
<tr><td>種類の数を数える</td><td><code>sort -u file.txt | wc -l</code></td></tr>
<tr><td>数値の大きい順に上位5件</td><td><code>sort -rn file.txt | head -5</code></td></tr>
<tr><td>行をランダムに並べる</td><td><code>shuf file.txt</code></td></tr>
<tr><td>行を逆順にする</td><td><code>tac file.txt</code></td></tr>
<tr><td>空行を除く</td><td><code>grep -v '^$' file.txt</code></td></tr>
</tbody>
</table>
<p><code>shuf</code>と<code>tac</code>はGNU coreutilsのコマンドで、macOSには標準で入っていません。macOSでは<code>sort -R</code>（ランダム）や<code>tail -r</code>（逆順）で代用できます。<code>grep</code>に渡すパターンの書き方は<a href="/blog/regex-basics/">正規表現入門</a>を参照してください。</p>`,
};
