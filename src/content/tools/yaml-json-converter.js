// YAML ⇔ JSON 変換 — ページコンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// article 内の HTML は h2/h3/p/ul/ol/table/code のみを使用し、style属性は使わないこと。
export default {
  slug: 'yaml-json-converter',
  name: 'YAML ⇔ JSON 変換',
  shortDesc: 'YAMLとJSONを相互に変換できるツール',
  title: 'YAML JSON変換｜無料オンラインツール - DevToolBox',
  description:
    'YAML形式とJSON形式を相互に変換できる無料オンラインツール。Kubernetes・Docker Compose・GitHub Actionsの設定ファイル確認に便利。データはブラウザ内で処理され、サーバーには送信されません。',
  keywords: ['YAML', 'JSON', '変換', 'Kubernetes', 'Docker Compose', 'オンラインツール'],
  category: 'format',
  icon: '📄',
  lead:
    'YAML形式とJSON形式を相互に変換します。Kubernetesのマニフェストやdocker-compose.yml、GitHub Actionsのワークフローファイルの確認・編集に便利で、変換はすべてブラウザ内で完結します。',
  article: `
<h2>このツールの使い方</h2>
<ol>
  <li>左側の入力欄に変換したいYAMLを貼り付け、「YAML→JSON」ボタンを押すとJSON形式に変換されます。</li>
  <li>右側にJSONを貼り付けて「JSON→YAML」ボタンを押せば、逆にYAML形式へ変換できます。</li>
  <li>「サンプル」ボタンでネストした構造や配列を含むサンプルYAMLを読み込み、動作を確認できます。</li>
  <li>変換結果はコピーボタンでワンクリックでクリップボードにコピーできます。</li>
</ol>
<p>入力したデータはサーバーに送信されず、すべてお使いのブラウザ内で処理されます。設定ファイルに含まれる社内情報や認証情報などを含む場合でも安心して変換できます。</p>

<h2>YAMLとは</h2>
<p>YAML（YAML Ain't Markup Language）は、インデント（字下げ）によって階層構造を表現するデータ記述形式です。JSONと同じく構造化データを表現できますが、コメントが書けたり、クォートなしで文字列を書けたりと、人間が読み書きしやすいことを重視して設計されています。JSONとの主な違いは次のとおりです。</p>
<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>YAML</th>
      <th>JSON</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>コメント</td>
      <td><code>#</code> で記述可能</td>
      <td>不可</td>
    </tr>
    <tr>
      <td>構文</td>
      <td>インデントで階層を表現</td>
      <td><code>{}</code> と <code>[]</code> で階層を表現</td>
    </tr>
    <tr>
      <td>可読性</td>
      <td>括弧やクォートが少なく人間に読みやすい</td>
      <td>厳格な構文で機械的に処理しやすい</td>
    </tr>
    <tr>
      <td>主な用途</td>
      <td>設定ファイル（人が編集する前提）</td>
      <td>API通信・データ交換（プログラムが処理する前提）</td>
    </tr>
  </tbody>
</table>

<h2>よくある利用シーン</h2>
<ul>
  <li><strong>Kubernetes：</strong> Pod・Deployment・Serviceなどのマニフェストファイルの多くはYAMLで記述されます。</li>
  <li><strong>Docker Compose：</strong> <code>docker-compose.yml</code> で複数コンテナの構成をYAML形式で定義します。</li>
  <li><strong>GitHub Actions：</strong> <code>.github/workflows/</code> 以下のワークフロー定義ファイルはYAML形式です。</li>
  <li><strong>CI/CD設定：</strong> CircleCIやGitLab CI、Azure Pipelinesなど多くのCI/CDツールがYAMLを設定言語として採用しています。</li>
  <li><strong>静的サイトジェネレーターのフロントマター：</strong> Jekyll・Hugo・Astroなどでは、Markdownファイル冒頭の <code>---</code> で囲まれた領域にYAML形式でメタデータを記述します。</li>
</ul>

<h2>YAMLのインデントでハマりやすい点</h2>
<p>YAMLは階層構造をインデントで表現するため、記述ミスがそのまま構文エラーやデータ構造の崩れにつながります。特に次の点に注意してください。</p>
<ul>
  <li><strong>タブ文字は禁止：</strong> YAML仕様ではインデントにタブ文字を使うことが認められておらず、エディタの自動補完でタブが混入するとパースエラーになります。必ずスペースを使用してください。</li>
  <li><strong>スペース数を統一する：</strong> 同じ階層のキーはすべて同じ数のスペースでインデントする必要があります。2スペースまたは4スペースなど、ファイル内で統一しましょう。</li>
  <li><strong>配列とオブジェクトの混在：</strong> <code>- key: value</code> のようにハイフンの後にオブジェクトを続けられますが、インデントを誤ると意図しない親子関係になりがちです。</li>
</ul>

<h2>YAMLの特殊な型解釈に注意</h2>
<p>YAMLはクォートなしで書いた値を自動的に型推論するため、意図しない型に変換されてしまうことがあります。代表的な例が <code>true</code>・<code>false</code>・<code>yes</code>・<code>no</code>・<code>on</code>・<code>off</code> といった単語で、これらはクォートで囲まないとブール値として解釈されます。例えば国コードの「NO（ノルウェー）」をクォートなしで書くと <code>false</code> と誤解釈される、いわゆる「Norway Problem」として知られる有名な落とし穴です。同様に、数値に見える文字列（バージョン番号の <code>1.0</code> など）や日付形式の文字列も自動変換の対象になるため、文字列として扱いたい値は必ずダブルクォートまたはシングルクォートで囲むことをおすすめします。</p>
`,
  faq: [
    {
      q: 'YAMLとJSONはどちらを使うべきですか？',
      a: '人間が手で編集する設定ファイル（Kubernetesのマニフェストやdocker-compose.ymlなど）にはコメントが書けて読みやすいYAMLが向いています。一方、プログラム同士でデータをやり取りするAPI通信などには、構文が厳格で処理しやすいJSONが向いています。',
    },
    {
      q: 'YAMLのインデントはスペース何個にすればよいですか？',
      a: '仕様上は2スペースでも4スペースでも構いませんが、同じ階層では必ず同じ数のスペースに統一する必要があります。またYAMLの仕様上、インデントにタブ文字を使うことはできません。',
    },
    {
      q: '変換時に「true」や「false」に自動的に変わってしまう値があるのはなぜですか？',
      a: 'YAMLはクォートなしの値を自動的に型推論するため、true/false/yes/no/on/offといった単語はブール値として解釈されます。文字列として扱いたい場合は、値をダブルクォートまたはシングルクォートで囲んでください。',
    },
    {
      q: '入力したデータはサーバーに送信されますか？',
      a: 'いいえ。変換処理はすべてお使いのブラウザ内（JavaScript）で完結し、入力データが外部に送信されることはありません。',
    },
  ],
  related: ['json-formatter', 'csv-json-converter', 'diff-checker', 'markdown-preview'],
};
