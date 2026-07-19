// JSON → TypeScript型定義 生成 — ページコンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// article 内の HTML は h2/h3/p/ul/ol/li/table/code/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'json-to-typescript',
  name: 'JSON → TypeScript型定義 生成',
  shortDesc: 'JSONからTypeScriptのinterfaceを自動生成',
  title: 'JSON TypeScript 型生成｜interface自動作成ツール - DevToolBox',
  description:
    'JSONを貼り付けるだけでTypeScriptのinterface定義を自動生成する無料オンラインツール。ネストしたオブジェクトや配列も再帰的に型推論。処理はすべてブラウザ内で完結し、データは送信されません。',
  keywords: ['JSON', 'TypeScript', '型定義', 'interface', '自動生成', '変換'],
  category: 'format',
  icon: '🧩',
  lead:
    'APIレスポンスなどのJSONを貼り付けると、TypeScriptのinterface定義を自動生成します。ネストしたオブジェクトや配列も再帰的に型推論し、変換はすべてブラウザ内で完結します。',
  article: `
<h2>このツールの使い方</h2>
<ol>
  <li>左側の入力欄に、型定義を起こしたいJSON（APIレスポンスやモックデータなど）を貼り付けます。</li>
  <li>「ルート型名」に最上位のinterface名を入力します（省略時は <code>Root</code>。自動的にPascalCaseへ整形されます）。</li>
  <li>「型を生成」ボタンを押すと、右側にTypeScriptのinterface定義が出力されます。</li>
  <li>コピーボタンで結果をクリップボードにコピーし、<code>.ts</code> / <code>.d.ts</code> ファイルにそのまま貼り付けられます。</li>
</ol>
<p>ネストしたオブジェクトは子interfaceとして分割され、配列は要素の型を推論して <code>T[]</code> 形式で出力します。要素の型が混在する配列は <code>(string | number)[]</code> のようなユニオン型に、空配列は <code>unknown[]</code> になります。ハイフンを含むキーなど、JavaScriptの識別子として不正なプロパティ名は <code>"avatar-url"</code> のようにクォート付きで出力されるため、生成結果はそのままコンパイルが通る形になっています。</p>
<p>入力したJSONはサーバーに送信されず、すべてお使いのブラウザ内で処理されます。社内APIのレスポンスなど、外部に出せないデータでも安心して利用できます。</p>

<h2>JSONから型定義を起こすメリット</h2>
<p>TypeScriptプロジェクトでAPIレスポンスを扱うとき、型定義がないとレスポンスは <code>any</code> として扱われがちです。<code>any</code> はどんなプロパティアクセスも許してしまうため、キー名のタイプミスやAPI仕様の変更にコンパイラが気づけず、実行時エラーになって初めて発覚します。レスポンスの実データから型定義を起こしておくだけで、この種のバグの多くをコンパイル時に検出できるようになります。</p>
<ul>
  <li><strong>型安全性の向上：</strong> 存在しないプロパティへのアクセスや型の取り違えを、実行前にコンパイルエラーとして検出できます。</li>
  <li><strong>anyの撲滅：</strong> 「とりあえずany」で放置されがちなAPIレスポンスに正確な型を与え、コードベース全体の型カバレッジを引き上げられます。</li>
  <li><strong>エディタ補完の効果：</strong> VS Codeなどでプロパティ名が自動補完され、ネストの深いレスポンスでもドキュメントを見ずに書き進められます。リネームや参照検索などのリファクタリング支援も効くようになります。</li>
  <li><strong>仕様のドキュメント化：</strong> interface定義そのものが「このAPIは何を返すか」の読みやすいドキュメントとして機能します。</li>
</ul>
<p>手作業で型を書き起こすと、キーの数が多いレスポンスでは時間がかかるうえに転記ミスも起こりがちです。実データからの自動生成をたたき台にすれば、数十キーのレスポンスでも数秒で正確な骨組みが手に入ります。</p>

<h2>よくある利用シーン</h2>
<ul>
  <li><strong>外部APIのレスポンス型作成：</strong> 公式の型定義が提供されていないREST APIを使うとき、実際のレスポンスJSONから <code>fetch</code> の戻り値に付ける型を起こす。</li>
  <li><strong>モックデータからの型起こし：</strong> フロントエンド先行で開発する際、先に用意したモックJSONから型を生成し、実装とモックの整合性を保つ。</li>
  <li><strong>バックエンドとフロントの型共有の第一歩：</strong> サーバー側のレスポンス例から共通のinterfaceを作り、OpenAPIなどの本格的なスキーマ駆動開発へ移行する前の暫定的な型共有として使う。</li>
  <li><strong>ローカルJSONファイルの型付け：</strong> 設定ファイルや <code>i18n</code> の辞書JSONなど、プロジェクト内のJSONを <code>import</code> して使う箇所に型を付ける。</li>
</ul>

<h2>自動生成された型を使うときの注意点</h2>
<p>自動生成される型は、あくまで「貼り付けた1つのサンプルデータ」から推論したものです。実運用に組み込む前に、次の観点で人間によるレビューを行うことをおすすめします。</p>
<ul>
  <li><strong>null許容の判断：</strong> サンプルでたまたま <code>null</code> だったフィールドは <code>null</code> 型と推論されますが、実際には <code>string | null</code> のようなユニオン型が正しいケースがほとんどです。API仕様を確認して修正してください。</li>
  <li><strong>オプショナルの判断：</strong> レスポンスによって存在したりしなかったりするキーは、サンプル1件からは判定できません。必要に応じて <code>name?: string</code> のように <code>?</code> を付けて調整してください。</li>
  <li><strong>リテラル型・enumの検討：</strong> <code>status: "active"</code> のような値は <code>string</code> と推論されますが、取りうる値が決まっているなら <code>"active" | "inactive"</code> のようなユニオン型にするとより安全です。</li>
</ul>
<p>また、TypeScriptの型はコンパイル時にしか存在しないため、実行時に「本当にこの型どおりのデータが来たか」までは保証できません。信頼できない外部APIを扱う場合は、生成したinterfaceをたたき台に <code>zod</code> や <code>valibot</code> などのスキーマ検証ライブラリでランタイムバリデーションを足すと、型と実データの食い違いを実行時にも検出できます。JSONの構造確認や整形には<a href="/json-formatter">JSONフォーマッター</a>もご利用ください。</p>
`,
  faq: [
    {
      q: 'ネストしたJSONオブジェクトはどのように変換されますか？',
      a: 'ネストしたオブジェクトは、キー名から導出したPascalCaseの型名（例: profile → Profile）を持つ子interfaceとして分割して生成されます。型名が重複する場合は連番が付いて一意になります。',
    },
    {
      q: '配列はどんな型になりますか？',
      a: '要素の型を推論して string[] のような配列型になります。要素がオブジェクトの場合はinterface化され、複数の型が混在する場合は (string | number)[] のようなユニオン型、空配列は unknown[] になります。',
    },
    {
      q: '生成された型をそのまま本番コードで使えますか？',
      a: 'たたき台としては使えますが、サンプルデータ1件からの推論のため、null許容（string | null）やオプショナルプロパティ（?）の判断は含まれていません。API仕様と照らし合わせて調整してから利用してください。',
    },
    {
      q: '入力したJSONはサーバーに送信されますか？',
      a: 'いいえ。パースと型生成はすべてお使いのブラウザ内（JavaScript）で完結し、入力データが外部に送信されることはありません。機密性の高いAPIレスポンスでも安心して利用できます。',
    },
  ],
  related: ['json-formatter', 'yaml-json-converter', 'csv-json-converter', 'text-case-converter'],
};
