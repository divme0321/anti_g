// Base64リファレンス — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'base64-reference',
  title: 'Base64リファレンス: 変換の仕組み・パディング・Base64URLとの違い・コマンド例',
  description:
    'Base64の変換手順と変換表、末尾の「=」の意味、サイズが約33%増える理由、Base64URLとの違い、JavaScript・Python・コマンドラインでの変換例、よくあるエラーの原因を1ページにまとめます。',
  date: '2026-11-11',
  category: 'リファレンス',
  tags: ['Base64', 'エンコード', 'Web開発', 'コマンドライン'],
  relatedTools: ['base64', 'image-base64', 'url-encoder', 'jwt-decoder'],
  body: `<p>Base64は、バイナリデータを英数字と少数の記号だけで表す変換方式です。メールの添付ファイル、データURI、Basic認証、JWTなど、テキストしか通せない場所にバイナリを載せる場面で使われています。この記事では、変換の手順、末尾の<code>=</code>の意味、Base64URLとの違い、各言語とコマンドラインでの書き方、つまずきやすいエラーを早見表つきでまとめます。すぐに変換したい場合は<a href="/base64/">Base64エンコード・デコードツール</a>を使ってください。</p>

<h2>変換の仕組み: 3バイトを4文字にする</h2>
<p>Base64は、入力を3バイト（24ビット）ずつ取り出し、6ビットずつ4つに分け直して、それぞれを1文字に置き換えます。6ビットで表せる値は0から63の64通りなので、64種類の文字を使います。これが名前の由来です。</p>
<p>文字列<code>Man</code>を例にします。</p>
<table>
<thead><tr><th>段階</th><th>値</th></tr></thead>
<tbody>
<tr><td>文字</td><td>M / a / n</td></tr>
<tr><td>バイト（10進）</td><td>77 / 97 / 110</td></tr>
<tr><td>ビット列（8ビット×3）</td><td>01001101 01100001 01101110</td></tr>
<tr><td>6ビットに分け直す</td><td>010011 / 010110 / 000101 / 101110</td></tr>
<tr><td>値（10進）</td><td>19 / 22 / 5 / 46</td></tr>
<tr><td>Base64の文字</td><td>T / W / F / u</td></tr>
</tbody>
</table>
<p>結果は<code>TWFu</code>です。値と文字の対応は次のとおりです（RFC 4648）。</p>
<table>
<thead><tr><th>値</th><th>文字</th></tr></thead>
<tbody>
<tr><td>0〜25</td><td><code>A</code>〜<code>Z</code></td></tr>
<tr><td>26〜51</td><td><code>a</code>〜<code>z</code></td></tr>
<tr><td>52〜61</td><td><code>0</code>〜<code>9</code></td></tr>
<tr><td>62</td><td><code>+</code></td></tr>
<tr><td>63</td><td><code>/</code></td></tr>
</tbody>
</table>

<h2>末尾の「=」はパディング</h2>
<p>入力の長さが3の倍数でないとき、最後のブロックは1バイトか2バイトしかありません。足りないビットを0で補って変換し、出力が4文字の倍数になるように<code>=</code>で埋めます。</p>
<table>
<thead><tr><th>入力</th><th>バイト数</th><th>Base64</th><th>末尾の=</th></tr></thead>
<tbody>
<tr><td><code>Man</code></td><td>3</td><td><code>TWFu</code></td><td>なし</td></tr>
<tr><td><code>Ma</code></td><td>2</td><td><code>TWE=</code></td><td>1個</td></tr>
<tr><td><code>M</code></td><td>1</td><td><code>TQ==</code></td><td>2個</td></tr>
</tbody>
</table>
<p><code>=</code>が付くのは末尾だけで、個数は0・1・2のいずれかです。3個以上付いていたり、途中に現れたりする文字列は、正しいBase64ではありません。</p>

<h2>サイズは約33%増える</h2>
<p>3バイトが4文字になるので、変換後の長さは元の約4/3倍です。正確には、nバイトの入力に対してパディングありで<code>4 × ceil(n / 3)</code>文字になります。</p>
<table>
<thead><tr><th>元のサイズ</th><th>Base64後</th></tr></thead>
<tbody>
<tr><td>1バイト</td><td>4文字</td></tr>
<tr><td>100バイト</td><td>136文字</td></tr>
<tr><td>1KB（1,024バイト）</td><td>1,368文字</td></tr>
<tr><td>1MB（1,048,576バイト）</td><td>1,398,104文字（約1.33MB）</td></tr>
</tbody>
</table>
<p>画像をデータURIとしてHTMLやCSSに埋め込むと、リクエストの数は減りますが、転送量はこの分だけ増えます。数KB程度の小さなアイコンに限るのが目安です。画像の変換は<a href="/image-base64/">画像Base64変換ツール</a>でできます。なお、メール（MIME）で使われるBase64は76文字ごとに改行を入れる決まりがあり、その分さらに長くなります。</p>

<h2>Base64は暗号化ではない</h2>
<p>Base64は、鍵を使わずに誰でも元に戻せる変換です。内容を隠す効果はありません。Basic認証は<code>ユーザー名:パスワード</code>をBase64にしてヘッダーに載せますが、これは記号を含む値を安全に運ぶための変換であり、盗聴されればすぐに読み取られます。HTTPSと組み合わせて使うのが前提です。設定ファイルにBase64で書かれたパスワードも、平文と同じ扱いが必要です。</p>

<h2>Base64URLとの違い</h2>
<p>通常のBase64が使う<code>+</code>と<code>/</code>は、URLの中では特別な意味を持ちます。<code>+</code>はクエリ文字列で空白として解釈されることがあり、<code>/</code>はパスの区切りです。そのままURLやファイル名に入れると壊れるため、この2文字を置き換えた変種がBase64URLです。</p>
<table>
<thead><tr><th>項目</th><th>Base64</th><th>Base64URL</th></tr></thead>
<tbody>
<tr><td>値62の文字</td><td><code>+</code></td><td><code>-</code>（ハイフン）</td></tr>
<tr><td>値63の文字</td><td><code>/</code></td><td><code>_</code>（アンダースコア）</td></tr>
<tr><td>パディング</td><td>付ける</td><td>省略することが多い</td></tr>
<tr><td>主な用途</td><td>メール、データURI、Basic認証</td><td>JWT、URLのパラメータ、ファイル名</td></tr>
</tbody>
</table>
<p>JWTの3つのパートは、パディングなしのBase64URLです。JWTの一部を通常のBase64デコーダーに渡してエラーになるのは、この違いが原因です。相互に変換するには、<code>-</code>を<code>+</code>に、<code>_</code>を<code>/</code>に置き換え、長さが4の倍数になるまで末尾に<code>=</code>を足します。JWTの中身を見るだけなら<a href="/jwt-decoder/">JWTデコーダー</a>が手早く、仕組みは<a href="/blog/jwt-authentication-guide/">JWT認証の解説記事</a>で扱っています。</p>
<p>通常のBase64文字列をURLのパラメータに入れる必要がある場合は、<a href="/url-encoder/">URLエンコード</a>をかけて<code>+</code>を<code>%2B</code>に、<code>/</code>を<code>%2F</code>に、<code>=</code>を<code>%3D</code>にします。</p>

<h2>言語・コマンドごとの変換例</h2>
<p>どの例も、文字列<code>hello</code>を変換すると<code>aGVsbG8=</code>になります。</p>
<h3>コマンドライン（Linux・macOS）</h3>
<pre><code># エンコード（-n を付けないと末尾の改行も変換される）
echo -n 'hello' | base64

# デコード
echo 'aGVsbG8=' | base64 -d

# ファイルをエンコード
base64 image.png &gt; image.txt</code></pre>
<p><code>echo</code>に<code>-n</code>を付け忘れると、改行文字まで含めて変換され、結果が<code>aGVsbG8K</code>になります。「同じ文字列なのに他の環境と結果が合わない」ときは、まずここを疑ってください。</p>
<h3>JavaScript</h3>
<pre><code>// ブラウザ・Node.js 共通（ASCIIの範囲のみ）
btoa('hello');          // "aGVsbG8="
atob('aGVsbG8=');       // "hello"

// 日本語を含む文字列（UTF-8のバイト列にしてから変換）
const bytes = new TextEncoder().encode('こんにちは');
const b64 = btoa(String.fromCharCode(...bytes));   // "44GT44KT44Gr44Gh44Gv"

// デコード
const bin = atob(b64);
const text = new TextDecoder().decode(Uint8Array.from(bin, (c) =&gt; c.charCodeAt(0)));

// Node.js の Buffer
Buffer.from('こんにちは').toString('base64');       // 通常のBase64
Buffer.from('こんにちは').toString('base64url');    // Base64URL
Buffer.from('aGVsbG8=', 'base64').toString();       // "hello"</code></pre>
<p><code>btoa</code>は、1文字が1バイトに収まる文字（Latin-1）しか受け付けません。日本語をそのまま渡すと例外が発生します。上の例のように、先にUTF-8のバイト列へ変換します。大きなデータで<code>String.fromCharCode(...bytes)</code>を使うと引数の数の上限に達することがあるため、その場合は分割して処理します。</p>
<h3>Python</h3>
<pre><code>import base64

base64.b64encode(b'hello')                        # b'aGVsbG8='
base64.b64decode('aGVsbG8=')                      # b'hello'
base64.b64encode('こんにちは'.encode('utf-8'))     # b'44GT44KT44Gr44Gh44Gv'
base64.urlsafe_b64encode(b'hello')                # Base64URL（パディングあり）</code></pre>

<h2>よくあるエラーと原因</h2>
<table>
<thead><tr><th>症状</th><th>原因</th><th>対処</th></tr></thead>
<tbody>
<tr><td>デコードで「不正な文字」エラー</td><td>Base64URL（<code>-</code>や<code>_</code>）を通常のデコーダーに渡している</td><td>文字を置き換えるか、Base64URL用の関数を使う</td></tr>
<tr><td>「パディングが不正」「長さが不正」エラー</td><td>末尾の<code>=</code>が省略されている、または途中で切れている</td><td>長さが4の倍数になるまで<code>=</code>を足す。コピー漏れを確認する</td></tr>
<tr><td>デコード結果が文字化けする</td><td>元のデータがUTF-8以外の文字コード、またはテキストではなくバイナリ</td><td>文字コードを指定してデコードする。バイナリはファイルとして保存する</td></tr>
<tr><td>URL経由で受け取ると一部が空白になる</td><td><code>+</code>が空白として解釈された</td><td>送る側でURLエンコードするか、Base64URLを使う</td></tr>
<tr><td>環境によって結果が1〜2文字違う</td><td>入力の末尾に改行が含まれている</td><td><code>echo -n</code>を使う。ファイル末尾の改行を確認する</td></tr>
<tr><td><code>btoa</code>で例外が出る</td><td>Latin-1の範囲外の文字（日本語など）を渡している</td><td><code>TextEncoder</code>でバイト列にしてから変換する</td></tr>
</tbody>
</table>
<p>文字化けの原因が文字コードにあるかどうかは、<a href="/blog/character-encoding-guide/">文字コードの解説記事</a>も参考になります。</p>

<h2>早見表: 見分け方と使いどころ</h2>
<ul>
<li>使われる文字は<code>A-Z</code>・<code>a-z</code>・<code>0-9</code>・<code>+</code>・<code>/</code>と、末尾の<code>=</code>。<code>-</code>や<code>_</code>が含まれていればBase64URL。</li>
<li>パディングありなら、長さは必ず4の倍数。</li>
<li><code>eyJ</code>で始まる文字列は、<code>{"</code>で始まるJSONをBase64にしたもの。JWTはこの形になる。</li>
<li>サイズは約33%増える。大きなファイルの埋め込みには向かない。</li>
<li>秘密を守る効果はない。隠したいデータには暗号化を使う。</li>
</ul>`,
};
