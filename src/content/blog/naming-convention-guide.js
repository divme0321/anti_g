// 命名規則スタイルガイド — ブログ記事コンテンツ定義
// このファイルはビルド時の静的HTML生成とクライアント描画の両方から参照される。
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'naming-convention-guide',
  title: '命名規則スタイルガイド: camelCase・snake_case・kebab-caseの使い分け',
  description:
    'camelCase・PascalCase・snake_case・kebab-case・CONSTANT_CASEの違いを一覧表で整理し、JavaScript・Python・CSS・URLなど言語や場面ごとの命名慣習を具体例つきで解説します。',
  date: '2026-07-16',
  category: 'リファレンス',
  tags: ['命名規則', 'コーディング規約', 'プログラミング'],
  relatedTools: ['text-case-converter', 'regex-tester'],
  body: `<p>「この変数はcamelCase？ それともsnake_case？」「CSSのクラス名は何ケースで書くのが正解？」——複数の言語やフレームワークを行き来していると、命名規則の使い分けで迷う場面は少なくありません。この記事では、主要な命名規則（ケース）の種類を一覧表で整理し、言語・場面ごとの慣習を具体例つきでまとめます。チーム開発でコーディング規約を決める際のリファレンスとしても活用できる内容です。</p>

<h2>主要な命名規則一覧</h2>
<p>まず、プログラミングで使われる代表的な命名規則（ケース）を一覧表にまとめます。単語の区切り方と大文字・小文字の使い方の組み合わせで、それぞれ呼び名が異なります。</p>
<table>
<thead><tr><th>名称</th><th>表記例</th><th>単語の区切り方</th></tr></thead>
<tbody>
<tr><td>camelCase（キャメルケース）</td><td><code>userName</code></td><td>先頭は小文字、以降の単語の先頭を大文字にする</td></tr>
<tr><td>PascalCase（パスカルケース）</td><td><code>UserName</code></td><td>すべての単語の先頭を大文字にする</td></tr>
<tr><td>snake_case（スネークケース）</td><td><code>user_name</code></td><td>すべて小文字、単語をアンダースコアで区切る</td></tr>
<tr><td>kebab-case（ケバブケース）</td><td><code>user-name</code></td><td>すべて小文字、単語をハイフンで区切る</td></tr>
<tr><td>CONSTANT_CASE（定数ケース）</td><td><code>USER_NAME</code></td><td>すべて大文字、単語をアンダースコアで区切る</td></tr>
</tbody>
</table>
<p>名称が紛らわしいものもありますが、覚え方としては「大文字小文字の混在パターン」と「区切り文字（なし/アンダースコア/ハイフン）」の2軸で整理すると分かりやすくなります。手作業で書き換えるのは面倒なので、複数の命名規則の間で変換したい場合は<a href="/text-case-converter/">テキストケース変換ツール</a>を使うと一瞬で変換できます。</p>

<h2>言語・場面ごとの命名慣習</h2>
<p>命名規則は言語やコミュニティごとに強い慣習があり、その言語の標準スタイルから外れるとコードレビューで指摘されたり、リンターに警告されたりします。代表的な組み合わせを見ていきましょう。</p>

<h3>JavaScript / TypeScript — 変数・関数はcamelCase</h3>
<p>JavaScriptとTypeScriptでは、変数名・関数名・メソッド名にcamelCaseを使うのが標準です。クラス名や型名（インターフェース、型エイリアス）にはPascalCaseを使います。定数として扱う値（変更されないことが明確なプリミティブ値）にはCONSTANT_CASEを使う慣習もあります。</p>
<pre><code>const userName = "山田太郎";           // 変数: camelCase
function getUserProfile(id) { ... }    // 関数: camelCase
class UserRepository { ... }           // クラス: PascalCase
interface UserProfile { ... }          // 型: PascalCase
const MAX_RETRY_COUNT = 3;             // 定数: CONSTANT_CASE</code></pre>

<h3>Python — 変数・関数はsnake_case</h3>
<p>PythonにはPEP 8という公式のスタイルガイドがあり、変数名・関数名・モジュール名にはsnake_caseを、クラス名にはPascalCase（PEP 8では「CapWords」と呼ばれます）を使うことが明確に定められています。定数はJavaScriptと同様にCONSTANT_CASEです。</p>
<pre><code>user_name = "山田太郎"                 # 変数: snake_case
def get_user_profile(user_id):        # 関数: snake_case
    ...

class UserRepository:                 # クラス: PascalCase
    ...

MAX_RETRY_COUNT = 3                   # 定数: CONSTANT_CASE</code></pre>
<p>JavaScriptとPythonが混在するプロジェクト（フロントエンドとバックエンドでAPIのフィールド名をやり取りする場合など）では、この違いを意識してキー名を変換する処理が必要になることがよくあります。</p>

<h3>CSSクラス名・URL・ファイル名はkebab-case</h3>
<p>CSSのクラス名は伝統的にkebab-caseで書かれます（<code>BEM</code>記法の<code>.card__title--large</code>のような複合表記もハイフンとアンダースコアを組み合わせたケバブベースの派生です）。またURLのパス（スラッグ）やHTMLファイル名も、大文字小文字を区別しないファイルシステムとの相性やSEO上の慣習から、kebab-caseを使うのが一般的です。</p>
<pre><code>.user-profile-card { ... }            /* CSSクラス名 */
https://example.com/blog/naming-convention-guide  /* URLスラッグ */
user-profile-card.html                /* ファイル名 */</code></pre>
<p>反対に、CSSクラス名やURLにcamelCaseやsnake_caseのアンダースコアを使うことも技術的には可能ですが、コミュニティの慣習から外れるため推奨されません。</p>

<h3>定数はCONSTANT_CASE、クラス名はPascalCase</h3>
<p>言語を問わず広く共有されている慣習として、「変更されない値（定数）はCONSTANT_CASE」「クラスや型はPascalCase」という2つのルールがあります。これは可読性の観点から、コードを読んだ瞬間に「これは書き換えてはいけない値だ」「これは型・クラスだ」と判別できるようにするための工夫です。</p>
<table>
<thead><tr><th>対象</th><th>推奨ケース</th><th>例</th></tr></thead>
<tbody>
<tr><td>環境変数</td><td>CONSTANT_CASE</td><td><code>DATABASE_URL</code></td></tr>
<tr><td>Enumのメンバー</td><td>CONSTANT_CASE または PascalCase</td><td><code>STATUS_ACTIVE</code> / <code>Active</code></td></tr>
<tr><td>データベースのテーブル名・カラム名</td><td>snake_case</td><td><code>user_accounts</code>、<code>created_at</code></td></tr>
<tr><td>JSONのキー（API）</td><td>camelCase または snake_case（API仕様に依存）</td><td><code>userName</code> / <code>user_name</code></td></tr>
</tbody>
</table>
<p>データベースのカラム名にはsnake_caseを使うSQL系DBの慣習が根強く、これをそのままJSONで返すAPIとJavaScriptのフロントエンドをつなぐ際には、camelCaseへの変換処理が必要になることがよくあります。この変換ルールをチームであらかじめ決めておくと、実装時の迷いがなくなります。</p>

<h2>命名規則を統一するメリットと実践のコツ</h2>
<p>命名規則がプロジェクト内で統一されていないと、同じ意味の値が<code>userName</code>と<code>user_name</code>のように別名で存在してしまい、バグの温床になります。ESLintやRuboCopなど多くのリンターには命名規則をチェックするルールがあり、これを有効にしておくとレビューの負担を減らせます。既存のコードやAPIレスポンスのキー名を別の命名規則に一括変換したい場合は、正規表現で単語の区切りを検出しながら変換すると効率的です。正規表現のパターンを試したいときは<a href="/regex-tester/">正規表現テストツール</a>で動作を確認できます。</p>

<h2>まとめ</h2>
<ul>
<li>JavaScript/TypeScriptの変数・関数はcamelCase、クラス・型はPascalCaseが標準です。</li>
<li>Pythonの変数・関数はsnake_case、クラスはPascalCaseとPEP 8で定められています。</li>
<li>CSSクラス名・URLのスラッグ・ファイル名はkebab-caseが慣習です。</li>
<li>定数はCONSTANT_CASE、データベースのカラム名はsnake_caseが広く使われます。</li>
<li>API連携などで異なる命名規則を橋渡しする場合は、変換ルールをチームで事前に統一しておくことが重要です。</li>
</ul>`,
};
