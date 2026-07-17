// テキストケース変換 — ページコンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// article 内の HTML は h2/h3/p/ul/ol/table/code のみを使用し、style属性は使わないこと。
export default {
  slug: 'text-case-converter',
  name: 'テキストケース変換',
  shortDesc: 'camelCase・snake_case・kebab-caseなど命名規則を相互変換',
  title: 'テキストケース変換（camelCase・snake_case）｜無料オンラインツール - DevToolBox',
  description:
    'テキストをcamelCase・snake_case・kebab-case・PascalCase・CONSTANT_CASEなど主要な命名規則へ一括変換できる無料オンラインツール。入力形式は自動判定され、変換はすべてブラウザ内で完結します。',
  keywords: ['ケース変換', 'camelCase', 'snake_case', 'kebab-case', '命名規則', 'テキスト変換'],
  category: 'format',
  icon: '🔤',
  lead:
    '入力したテキストを camelCase・snake_case・kebab-case・PascalCase・CONSTANT_CASE・Title Case など主要な命名規則へ同時に変換します。入力形式は自動判定されるため、どのケースで入力しても正しく変換できます。',
  article: `
<h2>このツールの使い方</h2>
<ol>
  <li>入力欄に変換したいテキストを入力します。camelCase・snake_case・kebab-case・スペース区切りなど、どの形式で入力しても構いません。</li>
  <li>入力するとリアルタイムで単語に分割され、9種類のケースに一括変換されて一覧表示されます。</li>
  <li>必要な行の📋ボタンを押すと、その変換結果だけをクリップボードにコピーできます。</li>
  <li>「クリア」ボタンで入力欄を空にし、最初からやり直せます。</li>
</ol>
<p>入力したデータはサーバーに送信されず、すべてお使いのブラウザ内（JavaScript）で処理されます。社内システムの変数名やAPIの設計資料など、外部に出したくないテキストでも安心して利用できます。</p>

<h2>命名規則（ケース）とは</h2>
<p>プログラミングでは、変数名・関数名・ファイル名などを一定のルールで区切って表記する「命名規則（ネーミングコンベンション）」が言語やフレームワークごとに定められています。代表的なケースは次のとおりです。</p>
<table>
  <thead>
    <tr>
      <th>ケース名</th>
      <th>変換例</th>
      <th>主な使用場面</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>camelCase</td>
      <td>helloWorldExample</td>
      <td>JavaScript・Javaの変数名/関数名、JSONのキー名</td>
    </tr>
    <tr>
      <td>snake_case</td>
      <td>hello_world_example</td>
      <td>Pythonの変数名/関数名、Ruby、データベースのカラム名</td>
    </tr>
    <tr>
      <td>kebab-case</td>
      <td>hello-world-example</td>
      <td>HTMLのdata属性・CSSクラス名、URLスラッグ、ファイル名</td>
    </tr>
    <tr>
      <td>PascalCase</td>
      <td>HelloWorldExample</td>
      <td>クラス名、Reactのコンポーネント名、型名</td>
    </tr>
    <tr>
      <td>CONSTANT_CASE</td>
      <td>HELLO_WORLD_EXAMPLE</td>
      <td>定数名、環境変数名（SCREAMING_SNAKE_CASEとも呼ばれる）</td>
    </tr>
  </tbody>
</table>
<p>本ツールではこれらに加えて、<code>Title Case</code>（見出し用の単語区切り表記）、<code>lowercase</code> / <code>UPPERCASE</code>（区切りなしの全小文字・全大文字）、そしてスペース区切り（そのまま小文字で単語をスペース区切りにした表記）の合計9種類を同時に生成します。</p>

<h2>よくある利用シーン</h2>
<ul>
  <li><strong>JavaScriptとPythonの変数名変換：</strong> フロントエンド（camelCase）とバックエンド（snake_case）で言語をまたぐ際に、変数名を素早く揃える。</li>
  <li><strong>CSSクラス名⇄JS変数名：</strong> kebab-caseのCSSクラス名（例: <code>user-profile-card</code>）を、JavaScript側でcamelCaseの変数名（例: <code>userProfileCard</code>）として扱いたいときに変換する。</li>
  <li><strong>APIレスポンスのキー名変換：</strong> snake_caseで返ってくるAPIのJSONキーを、フロントエンドのcamelCaseな型定義やインターフェース名と突き合わせる。</li>
  <li><strong>環境変数名の作成：</strong> 設定項目名からCONSTANT_CASEの環境変数名（例: <code>DATABASE_URL</code>）を機械的に作る。</li>
  <li><strong>コンポーネント名・クラス名の作成：</strong> 機能名からPascalCaseのReact/Vueコンポーネント名やクラス名を組み立てる。</li>
</ul>

<h2>単語分割アルゴリズムについて</h2>
<p>本ツールは、入力テキストがどの命名規則で書かれていても同じ結果になるよう、まず入力を「単語」の集まりに分解してから各ケースへ再構築しています。具体的には、大文字と小文字の境界（camelCase/PascalCaseの単語区切り）、アンダースコア、ハイフン、スペースをすべて単語の区切りとして認識します。そのため <code>helloWorldExample</code> ・ <code>hello_world_example</code> ・ <code>Hello World Example</code> のいずれを入力しても、変換結果はすべて同じになります。</p>
<p>ただし、<code>XMLHttpRequest</code> のように大文字が連続する略語（アクロニム）を含む場合や、数字がどの単語に属するかが曖昧なケースでは、意図した単語区切りと異なる結果になることがあります。想定と違う結果になった場合は、あらかじめスペースやハイフンで単語を区切って入力すると、より正確に変換できます。</p>
`,
  faq: [
    {
      q: '入力形式を指定する必要はありますか？',
      a: 'いいえ。camelCase・snake_case・kebab-case・スペース区切りなど、どの形式で入力しても自動的に単語へ分割してから変換するため、事前に形式を意識する必要はありません。',
    },
    {
      q: 'lowercaseとスペース区切りの違いは何ですか？',
      a: 'lowercaseは単語をすべて小文字にしたうえで区切り文字を入れずに連結します（例: helloworldexample）。一方スペース区切りは単語をスペースで区切って小文字のまま並べます（例: hello world example）。用途に応じて使い分けてください。',
    },
    {
      q: 'CONSTANT_CASEとSCREAMING_SNAKE_CASEは同じものですか？',
      a: 'はい、同じ命名規則を指す別名です。すべての単語を大文字にし、アンダースコアで区切る形式で、主に定数名や環境変数名に使われます。',
    },
    {
      q: '入力したテキストはサーバーに送信されますか？',
      a: 'いいえ。変換処理はすべてお使いのブラウザ内（JavaScript）で完結し、入力したテキストが外部のサーバーに送信されることはありません。',
    },
  ],
  related: ['json-formatter', 'regex-tester', 'word-counter', 'css-minifier'],
};
