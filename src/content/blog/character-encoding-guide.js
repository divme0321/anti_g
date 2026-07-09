// 文字コード入門 — ブログ記事コンテンツ定義
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'character-encoding-guide',
  title: '文字コード入門：UTF-8・Shift_JIS・文字化けの仕組み',
  description:
    'UTF-8とShift_JISの違い、文字化けが起こる原因と対処法を初心者向けに解説。ASCIIからUnicodeへの歴史、UTF-8の可変長エンコードの仕組み、BOMの正体、実務でのファイル保存・DB設定の注意点まで網羅します。',
  date: '2026-07-09',
  category: '入門ガイド',
  tags: ['文字コード', 'UTF-8', 'Shift_JIS', '文字化け'],
  relatedTools: ['base64', 'url-encoder', 'hash-generator'],
  body: `<p>「CSVを開いたら日本語が壊れていた」「メールの件名が記号の羅列になった」——文字化けは、文字コードの仕組みを知らないと原因の見当すら付きません。この記事では、文字コードとは何かという基本から、UTF-8とShift_JISの違い、文字化けが起こる典型パターンと実務での対処法までを、初心者にも分かる順序で解説します。</p>

<h2>文字コードとは何か</h2>
<p>コンピュータが扱えるのは数値（バイト列）だけです。そこで「あ」という文字を <code>0xE3 0x81 0x82</code> のような数値に対応付けるルールが必要になります。この<strong>文字と数値の対応ルールが文字コード</strong>です。</p>
<p>重要なのは、対応ルールが1種類ではないことです。同じ「あ」でも、UTF-8では <code>E3 81 82</code>、Shift_JISでは <code>82 A0</code> と、まったく異なるバイト列になります。<strong>書いたときのルールと読むときのルールが食い違うと、文字化けが起こります</strong>。</p>

<h2>ASCIIからUnicodeへ</h2>
<h3>ASCII：すべての出発点</h3>
<p>1960年代に定められたASCIIは、英数字と記号あわせて128文字を7ビット（実質1バイト）で表す規格です。<code>A</code> は65、<code>a</code> は97という対応は現在もほぼすべての文字コードに引き継がれています。</p>
<h3>各国語対応と乱立の時代</h3>
<p>ASCIIには日本語がないため、日本では JIS（ISO-2022-JP）、Shift_JIS、EUC-JP といった独自の文字コードが作られました。国や言語ごとに別々の文字コードが乱立した結果、「異なる言語の文書を同時に扱えない」「変換のたびに文字化けする」という問題が深刻化します。</p>
<h3>Unicode：世界の文字をひとつの表に</h3>
<p>そこで登場したのがUnicodeです。世界中の文字に一意な番号（コードポイント）を割り当てる規格で、「あ」は <code>U+3042</code>、「A」は <code>U+0041</code> と表されます。ただしUnicodeは「番号表」であり、その番号を実際にどうバイト列にするかは、UTF-8・UTF-16などの<strong>エンコード方式</strong>が担います。</p>

<h2>UTF-8の仕組み：可変長エンコード</h2>
<p>UTF-8は、Unicodeのコードポイントを<strong>1〜4バイトの可変長</strong>でバイト列に変換する方式です。文字の種類によって使うバイト数が変わります。</p>
<table>
<thead><tr><th>文字の範囲</th><th>バイト数</th><th>例</th></tr></thead>
<tbody>
<tr><td>ASCII（U+0000〜U+007F）</td><td>1バイト</td><td>A → <code>41</code></td></tr>
<tr><td>ラテン拡張・ギリシャ文字など</td><td>2バイト</td><td>é → <code>C3 A9</code></td></tr>
<tr><td>日本語の大半（ひらがな・漢字）</td><td>3バイト</td><td>あ → <code>E3 81 82</code></td></tr>
<tr><td>絵文字・追加漢字など</td><td>4バイト</td><td>😀 → <code>F0 9F 98 80</code></td></tr>
</tbody>
</table>
<p>この設計の巧妙な点は、<strong>ASCII部分が従来とまったく同じバイト列になる</strong>ことです。英語だけのファイルはASCIIとしてもUTF-8としても正しく読めるため、既存システムと互換性を保ちながら世界へ普及しました。現在ではWebページの95%以上がUTF-8を採用しています。</p>

<h2>Shift_JISとの違い</h2>
<p>Shift_JISは日本で広く使われてきた文字コードで、日本語を1文字2バイト（半角カナは1バイト)で表します。WindowsではCP932という拡張版が長く標準でした。UTF-8との主な違いは次のとおりです。</p>
<ul>
<li><strong>扱える文字数：</strong>Shift_JISは日本語中心の約1万字。UTF-8はUnicode全体（14万字以上、絵文字含む）を表せます。</li>
<li><strong>日本語のサイズ：</strong>日本語1文字はShift_JISで2バイト、UTF-8で3バイトです。日本語主体のデータはShift_JISのほうが小さくなります。</li>
<li><strong>互換性の罠：</strong>Shift_JISでは「表」「能」「ソ」などの2バイト目に <code>0x5C</code>（バックスラッシュ、円記号）が現れることがあり、プログラムがエスケープ文字と誤認して壊れる「ダメ文字」問題が有名です。</li>
</ul>
<p>新規開発でShift_JISを選ぶ理由はほぼなく、レガシーシステムや官公庁向けCSVとの連携時に読み書きする存在と考えてよいでしょう。</p>

<h2>文字化けが起こる原因パターン</h2>
<p>文字化けの正体は「書いた文字コードと違う文字コードで読むこと」です。化け方から原因を推測できます。</p>
<table>
<thead><tr><th>症状の例</th><th>典型的な原因</th></tr></thead>
<tbody>
<tr><td>「縺薙s縺ォ縺｡縺ｯ」のような漢字の羅列</td><td>UTF-8のデータをShift_JISとして読んだ</td></tr>
<tr><td>「�������」（同じ記号の連続）</td><td>Shift_JISのデータをUTF-8として読んだ（不正バイトが置換文字�になる）</td></tr>
<tr><td>「??????」に置き換わる</td><td>変換先の文字コードに存在しない文字を変換した（DB保存時など）</td></tr>
<tr><td>先頭に「&amp;#65279;」や「ï»¿」が付く</td><td>BOM付きUTF-8をBOM非対応の処理で読んだ</td></tr>
<tr><td>一部の文字（①、髙、～など）だけ化ける</td><td>機種依存文字やCP932とShift_JISの差異</td></tr>
</tbody>
</table>
<p>なお、Base64デコード後に文字化けする場合も、元データの文字コードがUTF-8以外だったことが原因のケースが大半です。<a href="/base64">Base64変換ツール</a>はUTF-8前提で復元するため、化けるときは元データの文字コードを疑ってください。URLの <code>%E3%81%82</code> のような表記も文字コードに基づく変換で、<a href="/url-encoder">URLエンコードツール</a>でどのバイト列になるかを確認できます。</p>

<h2>BOMとは</h2>
<p>BOM（Byte Order Mark）は、ファイル先頭に付けられる目印のバイト列です。UTF-8では <code>EF BB BF</code> の3バイトで、「このファイルはUTF-8です」と示す役割を果たします。</p>
<p>厄介なのは、<strong>BOMの要不要が用途によって逆転する</strong>ことです。</p>
<ul>
<li><strong>BOMが必要な場面：</strong>ExcelでUTF-8のCSVを開く場合。BOMがないとShift_JISと誤認され文字化けします。</li>
<li><strong>BOMが有害な場面：</strong>シェルスクリプト、PHP、JSONなど。先頭の見えない3バイトが「不正な文字」としてエラーや表示崩れの原因になります。</li>
</ul>
<p>プログラムが読むファイルはBOMなし、Excel向けCSVはBOM付き、と使い分けるのが実務の定石です。</p>

<h2>実務での対処法</h2>
<h3>ファイル保存時</h3>
<p>エディタの既定文字コードを<strong>UTF-8（BOMなし）</strong>に統一します。VS Codeなら <code>files.encoding</code> 設定で指定でき、ステータスバーから現在の文字コードを確認・変換できます。既存ファイルの文字コードは <code>file</code> コマンドや <code>nkf --guess</code> で調べられます。</p>
<h3>HTMLのmeta charset</h3>
<pre><code>&lt;meta charset="UTF-8"&gt;</code></pre>
<p><code>head</code> 内のできるだけ先頭（1024バイト以内）に記述します。ファイル自体の保存コードとmeta宣言が一致していないと文字化けするため、必ずセットで確認してください。サーバーの <code>Content-Type</code> ヘッダーでの指定はmetaより優先されます。</p>
<h3>データベースの文字コードと照合順序</h3>
<p>MySQLでは <code>utf8mb4</code> を選びます。旧来の <code>utf8</code>（utf8mb3）は3バイトまでしか格納できず、<strong>絵文字などの4バイト文字が保存時にエラーまたは欠落します</strong>。照合順序（collation）は比較・ソートのルールで、<code>utf8mb4_bin</code> は完全一致、<code>utf8mb4_general_ci</code> や <code>utf8mb4_0900_ai_ci</code> は大文字小文字を区別しない、といった挙動の違いがあります。「ハハとパパが同一視される」ような予期しない一致は照合順序の設定が原因です。加えて、DB本体・テーブル・接続（<code>SET NAMES</code>）の3か所の文字コードを揃えることが文字化け防止の要点です。</p>

<h2>まとめ</h2>
<ul>
<li>文字コードは「文字とバイト列の対応ルール」であり、書き込み時と読み取り時のルール不一致が文字化けの原因です。</li>
<li>UTF-8はASCII互換の可変長エンコードで、日本語は3バイト、絵文字は4バイトで表現されます。</li>
<li>Shift_JISはレガシー連携用と割り切り、新規開発はUTF-8一択です。</li>
<li>BOMはExcel向けCSVでは必要、プログラムが読むファイルでは有害と使い分けます。</li>
<li>DBはutf8mb4を採用し、接続・テーブル・照合順序まで含めて設定を揃えることが重要です。</li>
</ul>`,
};
