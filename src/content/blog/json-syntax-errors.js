// JSONのよくある構文エラー — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'json-syntax-errors',
  title: 'JSONのよくある構文エラー7選と直し方',
  description:
    'JSONのパースエラーの原因を7パターンに整理。末尾カンマ・シングルクォート・コメント・未クオートキー・制御文字・BOM・数値形式について、エラーメッセージ例と修正前後のコードで直し方を解説します。',
  date: '2026-07-09',
  category: 'リファレンス',
  tags: ['JSON', 'デバッグ', 'Web開発'],
  relatedTools: ['json-formatter', 'diff-checker'],
  body: `<p>設定ファイルやAPIレスポンスを扱っていて「Unexpected token」というエラーに遭遇した経験は誰にでもあるはずです。JSONの構文は単純ですが、JavaScriptのオブジェクトリテラルより厳格なため、見た目が正しそうでもパースに失敗するケースが頻発します。この記事では、JSONの構文ルールを最初に整理し、実務で遭遇頻度の高い7つの構文エラーを、エラーメッセージ例と修正前後のコード付きで解説します。</p>

<h2>まず押さえるJSONの構文ルール</h2>
<p>JSON（RFC 8259）で許されている記法は、JavaScriptのオブジェクトより大幅に狭いことを覚えておくと、エラーの大半は予測できます。</p>
<ul>
<li>文字列は<strong>ダブルクォート</strong>のみ。シングルクォートは不可です。</li>
<li>オブジェクトのキーも必ずダブルクォートで囲みます。</li>
<li>配列・オブジェクトの<strong>末尾カンマは不可</strong>です。</li>
<li>コメントは書けません。</li>
<li>値に使えるのは文字列・数値・真偽値（<code>true</code>/<code>false</code>）・<code>null</code>・オブジェクト・配列のみ。<code>undefined</code>や<code>NaN</code>は不可です。</li>
<li>数値の先頭ゼロ（<code>012</code>）や<code>.5</code>のような省略記法は不可です。</li>
</ul>

<h2>エラー1：末尾カンマ（trailing comma）</h2>
<p>最後の要素の後ろにカンマを残してしまうミスで、発生頻度は圧倒的1位です。JavaScriptのオブジェクトでは許されるため、コピーや編集の際に紛れ込みます。エラーメッセージ例は <code>Unexpected token } in JSON at position 42</code> です。</p>
<pre><code>// NG
{ "name": "taro", "age": 30, }

// OK
{ "name": "taro", "age": 30 }</code></pre>
<p>要素を削除・並べ替えした直後に発生しやすいため、編集後は必ず検証する習慣をつけると安全です。</p>

<h2>エラー2：シングルクォート</h2>
<p>Pythonの<code>dict</code>やJavaScriptの文字列をそのまま貼り付けたときに起こります。エラーメッセージ例は <code>Unexpected token ' in JSON at position 2</code> です。</p>
<pre><code>// NG
{ 'name': 'taro' }

// OK
{ "name": "taro" }</code></pre>
<p>Pythonの場合は自分で置換するより、<code>json.dumps()</code>で出力し直すのが確実です。文字列内にダブルクォートを含む場合のエスケープも自動で処理されます。</p>

<h2>エラー3：コメント</h2>
<p>JSONにはコメント構文がありません。<code>//</code>や<code>/* */</code>を書くと <code>Unexpected token / in JSON at position 0</code> のようなエラーになります。</p>
<pre><code>// NG
{
  "port": 8080 // 開発用ポート
}

// OK
{ "port": 8080, "_comment": "開発用ポート" }</code></pre>
<p>どうしても注釈が必要なら、上記のように専用キーを設ける方法があります。なお、<code>tsconfig.json</code>やVS Codeの設定ファイルはコメント可能な拡張仕様（JSONC）であり、標準のJSONパーサーには通らない点に注意してください。</p>

<h2>エラー4：クオートなしのキー</h2>
<p>JavaScriptのオブジェクトリテラルではキーのクォートを省略できますが、JSONでは必須です。エラーメッセージ例は <code>Unexpected token n in JSON at position 2</code> です。</p>
<pre><code>// NG
{ name: "taro" }

// OK
{ "name": "taro" }</code></pre>
<p>JavaScriptの<code>console.log</code>出力やコード中のオブジェクトをコピーしたときに起こりがちです。<code>JSON.stringify()</code>で出力したものを使いましょう。</p>

<h2>エラー5：文字列中の制御文字・改行</h2>
<p>文字列の値に生の改行やタブを含めることはできません。エラーメッセージ例は <code>Bad control character in string literal in JSON at position 15</code> です。</p>
<pre><code>// NG
{ "message": "1行目
2行目" }

// OK
{ "message": "1行目\\n2行目" }</code></pre>
<p>改行は<code>\\n</code>、タブは<code>\\t</code>、ダブルクォートは<code>\\"</code>、バックスラッシュは<code>\\\\</code>とエスケープします。テキストエリアの入力値をそのままJSONに埋め込む実装で起こりやすく、手で組み立てず必ず<code>JSON.stringify()</code>を通すのが根本対策です。</p>

<h2>エラー6：BOM（バイトオーダーマーク）</h2>
<p>ファイルの先頭に不可視のBOM（<code>U+FEFF</code>）が付いていると、見た目は完全に正しいのにパースに失敗します。エラーメッセージ例は <code>Unexpected token \\ufeff in JSON at position 0</code> で、「position 0 でエラーなのにどこも間違っていないように見える」のが特徴です。Windowsのエディタや一部ツールが「UTF-8（BOM付き）」で保存した場合に発生します。エディタの保存設定を「UTF-8（BOMなし）」に変更して保存し直すのが正攻法です。プログラム側で受ける場合は、パース前に先頭の<code>\\uFEFF</code>を除去する防御も有効です。</p>

<h2>エラー7：数値形式の違反</h2>
<p>JSONの数値は書式が厳密に決まっており、次のような値はエラーになります。</p>
<table>
<thead><tr><th>NGな記述</th><th>理由</th><th>正しい書き方</th></tr></thead>
<tbody>
<tr><td><code>012</code></td><td>先頭ゼロは不可</td><td><code>12</code>（ゼロ埋めが必要なら文字列 <code>"012"</code>）</td></tr>
<tr><td><code>.5</code> / <code>5.</code></td><td>小数点の前後の数字は省略不可</td><td><code>0.5</code> / <code>5.0</code></td></tr>
<tr><td><code>+1</code></td><td>正の符号は不可</td><td><code>1</code></td></tr>
<tr><td><code>NaN</code> / <code>Infinity</code></td><td>JSONに存在しない値</td><td><code>null</code> にするか文字列で表現</td></tr>
<tr><td><code>0x1F</code></td><td>16進数表記は不可</td><td><code>31</code></td></tr>
</tbody>
</table>
<p>電話番号や郵便番号のような「先頭ゼロに意味があるデータ」を数値として持たせようとして壊れるケースが典型で、これらは最初から文字列として扱うのが正解です。</p>

<h2>エラーの位置を素早く特定するコツ</h2>
<p>エラーメッセージの <code>at position 42</code> は「先頭から42文字目（0始まり）」を意味しますが、1行に圧縮されたJSONでは目視で数えるのは非現実的です。<a href="/json-formatter">JSON整形・検証ツール</a>に貼り付ければ、整形と同時に構文チェックが行われ、問題の箇所を行単位で特定できます。エラーの実際の原因は、報告された位置の<strong>直前</strong>にあることが多い（余分なカンマの次のトークンで初めてエラーが検出されるため）ことも覚えておくと、原因に早くたどり着けます。</p>

<h2>まとめ</h2>
<ul>
<li>JSONはJavaScriptオブジェクトより厳格です。末尾カンマ・シングルクォート・コメント・クオートなしキーはすべて構文エラーになります。</li>
<li>文字列内の改行や制御文字は<code>\\n</code>などにエスケープが必要です。手動で組み立てず<code>JSON.stringify()</code>を使うのが根本対策です。</li>
<li>「position 0 のエラーで見た目は正常」ならBOMを疑い、BOMなしUTF-8で保存し直します。</li>
<li>先頭ゼロ付きの番号類は数値でなく文字列で持たせます。</li>
<li>エラー位置の特定には検証ツールを使い、報告位置の直前を重点的に確認します。</li>
</ul>`,
};
