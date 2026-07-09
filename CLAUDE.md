# DevToolBox — 開発ガイド（Claude向け）

日本語の開発者向けオンラインツール集 + 技術ブログ。https://devtoolbox.link で公開。
**サイトの言語はすべて日本語**（コード内コメントも日本語で統一）。

## アーキテクチャ

- Vite + Vanilla JS の静的サイト。`npm run build` で `vite build` → `scripts/build-static.mjs` が走り、**全ルートの完全な静的HTML**・`sitemap.xml`・`feed.xml` を `dist/` に生成する（SEO/AdSense対応の要。SPAではない）。
- `main` ブランチへの push で Cloudflare Pages が自動デプロイ（ビルド: `npm run build` / 出力: `dist`）。
- 本番ページは `<html data-prerendered="1">` 付きで配信され、`src/main.js` は共通UI初期化とツールのマウントだけを行う。開発サーバー（`npm run dev`）ではクライアントレンダリングにフォールバックする。
- テンプレート（`src/templates/*.js`）は **HTML文字列を返す純粋関数**。Node（ビルド時）とブラウザ（開発時）の両方から使われるため、**DOM API（document等）を使ってはいけない**。

## ディレクトリ

| パス | 役割 |
|---|---|
| `src/content/tools/<slug>.js` | ツールごとの記事コンテンツ（メタ情報・解説記事・FAQ・関連ツール） |
| `src/content/tools/index.js` | ツールレジストリ（カテゴリ定義・表示順） |
| `src/content/blog/<slug>.js` | ブログ記事 |
| `src/content/blog/index.js` | ブログレジストリ |
| `src/tools/<slug>.js` | ツールのインタラクティブUI。`export function render()` がウィジェットDOM要素を返す |
| `src/templates/layout.js` | ヘッダー・フッター |
| `src/templates/pages.js` | 各ページのHTML+メタ情報生成 |
| `src/main.js` | エントリ。ツールslug→動的importの対応表あり |
| `scripts/build-static.mjs` | 静的HTML/sitemap/RSS生成 |

## よくある作業

### ブログ記事を追加する（定期更新のメイン作業）
1. `src/content/blog/<slug>.js` を新規作成。既存記事（例: `http-status-codes.js`）と同じスキーマで書く:
   `{ slug, title, description, date: 'YYYY-MM-DD', category: 'リファレンス'|'入門ガイド', tags, relatedTools, body }`
2. `src/content/blog/index.js` に import と配列追加。
3. `npm run build` が通ることを確認して commit & push（sitemap/RSSは自動更新される）。

記事の品質基準: 2500字以上・です・ます調・table/codeを活用・検索意図に最短で答える・関連ツールへ内部リンク・「いかがでしたか」等の常套句禁止。使用タグは h2/h3/p/ul/ol/li/table/code/pre/strong/a のみ、style属性禁止、h1禁止（h1はテンプレートが出す）。

### ツールを追加する
1. `src/tools/<slug>.js` — `export function render()` でウィジェット要素を返す（既存ツール参照。UIは日本語）。
2. `src/content/tools/<slug>.js` — 記事コンテンツ（`base64.js` がスキーマの見本）。
3. `src/content/tools/index.js` と `src/main.js` の `toolLoaders` に追加。
4. `npm run build` で確認。

### 既存記事の更新
内容を編集し、ブログ記事なら `updated: 'YYYY-MM-DD'` フィールドを設定する。

## 検証

- `npm run build` — ビルドが通ること（コンテンツのスキーマ不備はここで落ちる）。
- `npx vite preview` + ブラウザ確認（Playwright: `executablePath: '/opt/pw-browsers/chromium'`）。
- 新ページは `dist/<slug>/index.html` に本文が静的に含まれているか確認する。

## 収益・SEOに関する約束事

- AdSense はサイト全体で自動広告（`index.html` と build-static.mjs 内の adsbygoogle スクリプト、client ID は `src/site-config.js`）。`public/ads.txt` を消さない。
- 運営者情報（合同会社me）・プライバシーポリシー・利用規約はAdSense審査要件。削除・简略化しない。
- canonical はトレイリングスラッシュなし（`https://devtoolbox.link/base64`）。URL構造を変えるときはリダイレクトを検討する。
- コンテンツは必ずオリジナルで正確な日本語。薄い記事を量産しない（審査落ちの原因になる）。
