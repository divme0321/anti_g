// YAMLとJSON比較ガイド — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'yaml-vs-json',
  title: 'YAMLとJSON: 違いと使い分け完全ガイド',
  description:
    'YAMLとJSONの構文の違いを一覧表で比較し、インデントの落とし穴や自動型変換の罠、Kubernetes・Docker Compose・GitHub Actionsでの実例まで、実務で役立つ知識をまとめて解説します。',
  date: '2026-07-14',
  category: 'リファレンス',
  tags: ['YAML', 'JSON', '設定ファイル'],
  relatedTools: ['yaml-json-converter', 'json-formatter'],
  body: `<p>設定ファイルを書いていて「YAMLとJSON、結局どちらを使えばいいのか」「なぜこのYAMLだけパースエラーになるのか」と悩んだことはないでしょうか。この記事では、YAMLとJSONの構文上の違いを比較表で整理し、YAML特有のインデントルールや型解釈で起きやすいミスを具体例つきで解説します。さらにKubernetes・Docker Compose・GitHub Actionsという実務で頻出する3つのツールでの実例も取り上げ、どちらの形式をどう使い分けるべきかが分かる構成にしています。</p>

<h2>YAMLとJSONの基本的な違い</h2>
<p>JSONはJavaScriptのオブジェクトリテラルをベースにした、機械が読み書きしやすいデータ形式です。一方YAMLは「YAML Ain't Markup Language」の略で、人間が書きやすく読みやすいことを重視した形式であり、実はJSONの上位互換（有効なJSONはほぼそのまま有効なYAMLとして解釈できる）という関係にあります。構文上の主な違いを次の表にまとめます。</p>
<table>
<thead><tr><th>項目</th><th>JSON</th><th>YAML</th></tr></thead>
<tbody>
<tr><td>構造の表現</td><td><code>{}</code>と<code>[]</code>で明示</td><td>インデント（字下げ）で表現</td></tr>
<tr><td>クォート</td><td>キー・文字列値は必須</td><td>基本的に不要（省略可能）</td></tr>
<tr><td>コメント</td><td>書けない</td><td><code>#</code>で書ける</td></tr>
<tr><td>複数行文字列</td><td>非対応（<code>\\n</code>でエスケープ）</td><td><code>|</code>（改行保持）や<code>&gt;</code>（折り畳み）で対応</td></tr>
<tr><td>末尾カンマ</td><td>許可されない</td><td>該当なし（区切りは改行）</td></tr>
<tr><td>可読性</td><td>ネストが深いと読みにくい</td><td>人間が読み書きしやすい</td></tr>
<tr><td>主な用途</td><td>API通信、データ交換</td><td>設定ファイル（CI/CD、IaC等）</td></tr>
</tbody>
</table>
<p>API同士のデータ交換ではパースの厳密さとパフォーマンスに優れるJSONが好まれ、人間が直接編集する設定ファイルではコメントを書け、記述量も少なくて済むYAMLが好まれる傾向があります。相互に変換したい場合は<a href="/yaml-json-converter">YAML⇔JSON変換ツール</a>を使うと、手作業でのミスなくすぐに変換できます。</p>

<h2>YAMLのインデントルールで陥りやすいミス</h2>
<p>YAMLの構造は中括弧ではなくインデントの深さで決まるため、JSONにはない落とし穴があります。ここでは特に遭遇しやすい2つのミスを紹介します。</p>

<h3>タブ文字は使用禁止</h3>
<p>YAML仕様ではインデントに<strong>タブ文字を使うことが明確に禁止</strong>されています。エディタの設定によっては見た目上スペースと区別がつかず、次のようなエラーで初めて気づくケースが多いです。</p>
<pre><code>found character that cannot start any token
while scanning for the next token</code></pre>
<p>多くのエディタには「タブをスペースに自動変換する」設定があります。YAMLファイルを編集する際は、必ずこの設定を有効にしておきましょう。特にコピー＆ペーストでコードを貼り付けたときにタブが混入しやすいので注意が必要です。</p>

<h3>スペース数を統一する</h3>
<p>YAMLではインデント幅そのものに厳密な決まりはありませんが（2でも4でも構いません）、同じ階層内では必ず同じスペース数で揃える必要があります。次の例はインデントが不揃いなためエラーになります。</p>
<pre><code>services:
  web:
    image: nginx
   ports:      # インデントが1つズレている（3スペース）
    - "80:80"</code></pre>
<p>また、リストの階層とマップの階層でインデント幅の感覚が混同されがちです。次のように「同じ階層なのに親要素とインデントが揃っていない」ミスも典型的です。</p>
<pre><code># 誤り: environment の子要素がインデントされていない
environment:
- NODE_ENV=production
 - PORT=3000</code></pre>
<p>エディタの折り返し表示やインデントガイド機能を有効にし、常に半角スペースのみを使う運用に統一するのが最も確実な対策です。</p>

<h2>YAML特有の型解釈の罠</h2>
<p>YAMLはクォートなしで値を書けるぶん、パーサーが文字列を自動的に別の型（ブール値・数値・日付など）へ変換してしまうことがあります。これはYAML 1.1仕様に由来する挙動で、「Norway Problem（ノルウェー問題）」として広く知られています。</p>

<h3>yes/no/on/offが自動的にブール値になる</h3>
<p>YAML 1.1では、<code>true</code>/<code>false</code>だけでなく<code>yes</code>/<code>no</code>、<code>on</code>/<code>off</code>、<code>y</code>/<code>n</code>といった単語もブール値として解釈されます。国名の省略コードである「NO」（ノルウェー）が意図せず<code>false</code>になってしまう有名な事例から、この名前がついています。</p>
<pre><code>countries:
  - NO   # ノルウェーのつもりが false（真偽値）と解釈される
  - JP
  - US</code></pre>
<p>この問題を避けるには、文字列として扱いたい値には必ずダブルクォートまたはシングルクォートを付ける習慣をつけることが重要です。</p>
<pre><code>countries:
  - "NO"  # クォートで囲めば文字列として保持される
  - "JP"</code></pre>

<h3>日付らしき文字列が自動でDate型になる</h3>
<p>YAMLは<code>2026-07-14</code>のような<code>YYYY-MM-DD</code>形式の文字列を自動的にタイムスタンプ（Date型）として解釈します。バージョン番号やIDとして日付形式の値を使っている場合、意図せず型が変わってしまい、プログラム側で文字列比較や連結を行った際に想定外の挙動を引き起こすことがあります。</p>
<pre><code>release_id: 2026-07-14   # 文字列ではなく日付型になる
version: "2026-07-14"    # クォートで囲めば文字列として扱われる</code></pre>

<h3>数値に見える文字列の解釈にも注意</h3>
<p>先頭にゼロが付く郵便番号や電話番号、<code>1.20</code>のようなバージョン番号もクォートなしで書くと数値として解釈され、先頭のゼロが消えたり末尾のゼロが消えたりします。文字列として保持したい値は、迷ったら常にクォートで囲むのが安全です。</p>

<h2>Kubernetes・Docker Compose・GitHub ActionsでのYAML実例</h2>
<p>実務でYAMLに触れる機会が多いのが、インフラ・CI/CD周りの設定ファイルです。それぞれの現場でどのようにYAMLが使われているかを見てみましょう。</p>

<h3>Kubernetes</h3>
<p>KubernetesのマニフェストはすべてYAML（またはJSON）で記述します。<code>replicas</code>や<code>port</code>といった数値項目にクォートなしの値を書くケースが多く、前述の型解釈の罠に遭遇しやすい代表例です。</p>
<pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - containerPort: 80</code></pre>

<h3>Docker Compose</h3>
<p><code>docker-compose.yml</code>ではポート番号を<code>"80:80"</code>のように文字列として明示的にクォートするのが慣例です。クォートを省略すると、コロンを含む値の解釈でエラーになったり、意図しない型になったりします。</p>
<pre><code>services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: "0000"   # クォートなしだと数値の0になり先頭ゼロが消える
    ports:
      - "5432:5432"</code></pre>

<h3>GitHub Actions</h3>
<p>ワークフローファイル（<code>.github/workflows/*.yml</code>）でも同様の注意が必要です。特に<code>on:</code>キーはトリガー設定のためのキーですが、前述の「on/offがブール値になる」ルールと名前が衝突しやすく、YAMLパーサーによっては<code>on</code>が<code>true</code>キーとして解釈される事例が知られています。GitHub Actionsのパーサーはこれを特別扱いしていますが、自作のYAMLパーサーで同様の構造を扱う際は注意が必要です。</p>
<pre><code>on:
  push:
    branches: [main]
  pull_request:
    branches: [main]</code></pre>
<p>これらの設定ファイルをJSON形式で確認したい場合や、逆にJSONで受け取ったデータをYAML設定に落とし込みたい場合は<a href="/yaml-json-converter">YAML⇔JSON変換ツール</a>で変換すると、構造を保ったまま素早く確認できます。JSON側の構文チェックには<a href="/json-formatter">JSON整形ツール</a>も活用してください。</p>

<h2>まとめ</h2>
<ul>
<li>JSONは機械同士のデータ交換向き、YAMLは人間が編集する設定ファイル向きという住み分けが基本です。</li>
<li>YAMLのインデントにはタブ文字を使わず、同じ階層内ではスペース数を統一します。</li>
<li><code>yes</code>/<code>no</code>/<code>on</code>/<code>off</code>や日付形式の文字列は自動で型変換されるため、文字列として扱いたい値は必ずクォートで囲みます。</li>
<li>Kubernetes・Docker Compose・GitHub Actionsなど実務で使うYAMLほど、この型解釈の罠に遭遇しやすいので注意が必要です。</li>
</ul>`,
};
