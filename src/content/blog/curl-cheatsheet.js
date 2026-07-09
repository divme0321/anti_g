// curlコマンド実践チートシート — ブログ記事コンテンツ定義
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'curl-cheatsheet',
  title: 'curlコマンド実践チートシート【API開発でよく使う25例】',
  description:
    'API開発で頻出するcurlコマンドを目的別に25例まとめたチートシート。GET/POST/PUT/DELETE、JSON送信、Bearer認証、ファイルアップロード、タイムアウト設定などをコピペで使える形で解説します。',
  date: '2026-07-09',
  category: 'リファレンス',
  tags: ['curl', 'API', 'HTTP', 'コマンドライン'],
  relatedTools: ['json-formatter', 'jwt-decoder', 'base64'],
  body: `<p>curlはHTTPリクエストをコマンドラインから送信できる定番ツールで、APIの動作確認やデバッグに欠かせません。この記事では、API開発の現場でよく使うcurlコマンドを目的別に25例まとめました。「JSONをPOSTしたい」「Bearerトークンを付けたい」といった場面で、そのままコピーして使える形で紹介します。</p>

<h2>基本構文とよく使うオプション</h2>
<p>curlの基本構文は <code>curl [オプション] URL</code> です。まず頻出オプションを押さえておくと、以降の例が読みやすくなります。</p>
<table>
<thead><tr><th>オプション</th><th>意味</th></tr></thead>
<tbody>
<tr><td><code>-X</code></td><td>HTTPメソッドを指定（GET/POST/PUT/DELETEなど）</td></tr>
<tr><td><code>-H</code></td><td>リクエストヘッダーを追加</td></tr>
<tr><td><code>-d</code></td><td>リクエストボディを送信（指定時は自動的にPOSTになる）</td></tr>
<tr><td><code>-o</code> / <code>-O</code></td><td>レスポンスをファイルに保存</td></tr>
<tr><td><code>-i</code> / <code>-I</code></td><td>レスポンスヘッダーを表示 / ヘッダーのみ取得</td></tr>
<tr><td><code>-L</code></td><td>リダイレクトを追跡</td></tr>
<tr><td><code>-s</code> / <code>-v</code></td><td>進捗表示を消す / 詳細ログを表示</td></tr>
</tbody>
</table>

<h2>基本のHTTPメソッド</h2>
<h3>1. GETリクエスト</h3>
<pre><code>curl https://api.example.com/users</code></pre>
<p>メソッド省略時はGETになります。最もシンプルな形です。</p>
<h3>2. クエリパラメータ付きGET</h3>
<pre><code>curl "https://api.example.com/users?page=2&amp;limit=10"</code></pre>
<p><code>&amp;</code> をシェルに解釈させないため、URLは必ず引用符で囲みます。日本語などを含む値は<a href="/url-encoder">URLエンコードツール</a>で事前に変換しておくと安全です。</p>
<h3>3. POSTリクエスト</h3>
<pre><code>curl -X POST https://api.example.com/users -d "name=taro"</code></pre>
<p><code>-d</code> を付けるとPOSTになるため <code>-X POST</code> は省略可能ですが、明示すると意図が伝わりやすくなります。</p>
<h3>4. PUTリクエスト</h3>
<pre><code>curl -X PUT https://api.example.com/users/1 -d "name=jiro"</code></pre>
<p>リソースの更新にはPUTを使います。</p>
<h3>5. DELETEリクエスト</h3>
<pre><code>curl -X DELETE https://api.example.com/users/1</code></pre>
<p>削除APIの確認に使います。誤実行に注意してください。</p>

<h2>ヘッダーとJSONの送信</h2>
<h3>6. ヘッダーを付与する</h3>
<pre><code>curl -H "Accept: application/json" https://api.example.com/users</code></pre>
<p><code>-H</code> は複数回指定できます。</p>
<h3>7. JSONをPOSTする</h3>
<pre><code>curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "taro", "email": "taro@example.com"}'</code></pre>
<p>JSON送信時は <code>Content-Type: application/json</code> の指定が必須です。ボディはシングルクォートで囲むと内部のダブルクォートをそのまま書けます。</p>
<h3>8. JSONファイルを送信する</h3>
<pre><code>curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d @payload.json</code></pre>
<p><code>@ファイル名</code> でファイルの中身をボディとして送れます。長いJSONはファイル化すると管理しやすく、<a href="/json-formatter">JSONフォーマッター</a>で整形・検証してから送ると確実です。</p>
<h3>9. User-Agentを偽装する</h3>
<pre><code>curl -A "Mozilla/5.0" https://example.com</code></pre>
<p>User-Agentで挙動が変わるサーバーの確認に使います。</p>

<h2>認証</h2>
<h3>10. Bearerトークン認証</h3>
<pre><code>curl -H "Authorization: Bearer eyJhbGciOi..." https://api.example.com/me</code></pre>
<p>JWTなどのトークン認証で最も使う形です。トークンの中身は<a href="/jwt-decoder">JWTデコーダー</a>で確認できます。</p>
<h3>11. Basic認証</h3>
<pre><code>curl -u username:password https://api.example.com/admin</code></pre>
<p><code>-u</code> がユーザー名とパスワードを自動でBase64エンコードしてヘッダーに付与します。</p>
<h3>12. APIキーをヘッダーで送る</h3>
<pre><code>curl -H "X-API-Key: your-api-key" https://api.example.com/data</code></pre>
<p>ヘッダー名はAPIの仕様に合わせて変更してください。</p>
<h3>13. Cookieを送信する</h3>
<pre><code>curl -b "session_id=abc123" https://example.com/mypage</code></pre>
<p><code>-c cookie.txt</code> で保存し、<code>-b cookie.txt</code> で再利用するとログイン状態を維持できます。</p>

<h2>ファイルの送受信</h2>
<h3>14. ファイルをダウンロードする</h3>
<pre><code>curl -O https://example.com/files/archive.zip</code></pre>
<p><code>-O</code>（大文字）はURLのファイル名のまま保存、<code>-o 名前</code>（小文字）は任意の名前で保存します。</p>
<h3>15. ファイルをアップロードする（multipart/form-data）</h3>
<pre><code>curl -X POST https://api.example.com/upload -F "file=@photo.jpg"</code></pre>
<p><code>-F</code> はフォームのファイル送信に相当します。<code>-F "name=taro"</code> のように通常フィールドも同時に送れます。</p>
<h3>16. フォームを送信する（application/x-www-form-urlencoded）</h3>
<pre><code>curl -X POST https://example.com/login \\
  -d "username=taro" -d "password=secret"</code></pre>
<p><code>-d</code> を複数指定すると <code>&amp;</code> で連結されて送信されます。</p>
<h3>17. ダウンロードを再開する</h3>
<pre><code>curl -C - -O https://example.com/files/large.iso</code></pre>
<p><code>-C -</code> で中断したダウンロードを続きから再開します。</p>

<h2>レスポンスの確認とデバッグ</h2>
<h3>18. レスポンスヘッダーも表示する</h3>
<pre><code>curl -i https://api.example.com/users</code></pre>
<p>ステータスコードやヘッダーとボディをまとめて確認できます。</p>
<h3>19. ヘッダーだけ取得する</h3>
<pre><code>curl -I https://example.com</code></pre>
<p>HEADリクエストを送り、ボディを取得せずヘッダーのみ確認します。</p>
<h3>20. 詳細ログを表示する（verbose）</h3>
<pre><code>curl -v https://api.example.com/users</code></pre>
<p>TLSハンドシェイクや送受信ヘッダーの全容が表示され、接続トラブルの調査に最適です。</p>
<h3>21. ステータスコードだけ取得する</h3>
<pre><code>curl -s -o /dev/null -w "%{http_code}" https://example.com</code></pre>
<p>ヘルスチェックスクリプトなどで、200/404などのコードだけを取り出せます。</p>
<h3>22. リダイレクトを追跡する</h3>
<pre><code>curl -L https://example.com/old-page</code></pre>
<p>301/302が返ってもリダイレクト先まで自動で追跡します。短縮URLの展開確認にも便利です。</p>

<h2>タイムアウトとその他の実用例</h2>
<h3>23. タイムアウトを設定する</h3>
<pre><code>curl --connect-timeout 5 --max-time 30 https://api.example.com/slow</code></pre>
<p><code>--connect-timeout</code> は接続確立まで、<code>--max-time</code> は処理全体の上限秒数です。CIやバッチでは必ず設定しましょう。</p>
<h3>24. 失敗時に非ゼロ終了させる</h3>
<pre><code>curl -f -sS https://api.example.com/health</code></pre>
<p><code>-f</code> を付けると4xx/5xxで終了コードが非ゼロになり、シェルスクリプトでのエラー判定に使えます。</p>
<h3>25. 処理時間を計測する</h3>
<pre><code>curl -s -o /dev/null -w "total: %{time_total}s\\n" https://api.example.com/users</code></pre>
<p><code>-w</code> の変数でDNS解決時間や転送時間なども取得でき、簡易的なレイテンシ計測に役立ちます。</p>

<h2>まとめ</h2>
<ul>
<li>GETは省略形、POST/PUT/DELETEは <code>-X</code> でメソッドを明示するのが基本です。</li>
<li>JSON送信は <code>-H "Content-Type: application/json"</code> と <code>-d</code> のセットで覚えます。</li>
<li>認証はBearerなら <code>-H "Authorization: Bearer ..."</code>、Basicなら <code>-u</code> を使います。</li>
<li>デバッグには <code>-v</code>（詳細ログ）、<code>-i</code>（ヘッダー表示）、<code>-w</code>（計測）が有効です。</li>
<li>スクリプトに組み込む際は <code>-f</code> と <code>--max-time</code> を付けて安全に運用しましょう。</li>
</ul>`,
};
