# DevToolBox — 開発者のための無料オンラインツール

> 🚀 JSON整形からQRコード作成まで、46種類の開発者向けツールと技術ブログ。すべてブラウザ内で動作し、データは一切送信されません。

🔗 **公開サイト**: [https://devtoolbox.link](https://devtoolbox.link)

## 構成

- **46のオンラインツール** — 変換・整形 / エンコード・ハッシュ / ジェネレーター / Web制作 / 開発ユーティリティの5カテゴリ。各ツールに日本語の解説記事・FAQ付き。
- **技術ブログ** (`/blog`) — HTTPステータスコード一覧、正規表現入門、Gitコマンド逆引きなどのリファレンス記事。
- **完全静的生成** — ビルド時に全ルートのHTMLを生成（SEO・AdSense対応）。sitemap.xml と RSS (feed.xml) も自動生成。

## 開発

```bash
npm install
npm run dev      # 開発サーバー (http://localhost:5173)
npm run build    # dist/ に静的サイトを生成
npm run preview  # ビルド結果の確認
```

## デプロイ

`main` ブランチへの push で Cloudflare Pages が自動デプロイします。

- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`

## コンテンツの追加・更新

手順は [CLAUDE.md](./CLAUDE.md) を参照（ブログ記事の追加・ツールの追加・品質基準）。

## 技術スタック

- **Vite** — ビルド
- **Vanilla JS** — フレームワークなし。ツールUIは動的importでコード分割
- **自前SSG** — `scripts/build-static.mjs` が全ページの静的HTMLを生成
- **Cloudflare Pages** — ホスティング

## ライセンス

MIT
