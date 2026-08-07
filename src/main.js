// エントリーポイント。
// - 本番（プリレンダー済みHTML）: 共通UIの初期化とツール本体のマウントのみを行う
// - 開発サーバー / フォールバック: ルートに応じてページ全体をクライアント側で描画する
import './styles/index.css';
import { initSiteUI } from './site-ui.js';

// ツールslug → 動的import（コード分割される）
const toolLoaders = {
  'json-formatter': () => import('./tools/json-formatter.js'),
  'sql-formatter': () => import('./tools/sql-formatter.js'),
  'css-minifier': () => import('./tools/css-minifier.js'),
  'markdown-preview': () => import('./tools/markdown-preview.js'),
  'markdown-to-text': () => import('./tools/markdown-to-text.js'),
  'diff-checker': () => import('./tools/diff-checker.js'),
  'csv-json-converter': () => import('./tools/csv-json-converter.js'),
  'markdown-table-generator': () => import('./tools/markdown-table-generator.js'),
  base64: () => import('./tools/base64.js'),
  'url-encoder': () => import('./tools/url-encoder.js'),
  'html-entities': () => import('./tools/html-entities.js'),
  'image-base64': () => import('./tools/image-base64.js'),
  'jwt-decoder': () => import('./tools/jwt-decoder.js'),
  'hash-generator': () => import('./tools/hash-generator.js'),
  'uuid-generator': () => import('./tools/uuid-generator.js'),
  'password-generator': () => import('./tools/password-generator.js'),
  'password-strength-checker': () => import('./tools/password-strength-checker.js'),
  'lorem-ipsum': () => import('./tools/lorem-ipsum.js'),
  'qr-code-generator': () => import('./tools/qr-code-generator.js'),
  'css-gradient': () => import('./tools/css-gradient.js'),
  'box-shadow-generator': () => import('./tools/box-shadow-generator.js'),
  'meta-tag-generator': () => import('./tools/meta-tag-generator.js'),
  'favicon-generator': () => import('./tools/favicon-generator.js'),
  'image-compressor': () => import('./tools/image-compressor.js'),
  'color-converter': () => import('./tools/color-converter.js'),
  'color-palette-generator': () => import('./tools/color-palette-generator.js'),
  'regex-tester': () => import('./tools/regex-tester.js'),
  'cron-parser': () => import('./tools/cron-parser.js'),
  'cron-next-run': () => import('./tools/cron-next-run.js'),
  'timestamp-converter': () => import('./tools/timestamp-converter.js'),
  'timezone-converter': () => import('./tools/timezone-converter.js'),
  'word-counter': () => import('./tools/word-counter.js'),
  'text-case-converter': () => import('./tools/text-case-converter.js'),
  'yaml-json-converter': () => import('./tools/yaml-json-converter.js'),
  'number-base-converter': () => import('./tools/number-base-converter.js'),
  'slug-generator': () => import('./tools/slug-generator.js'),
  'cidr-calculator': () => import('./tools/cidr-calculator.js'),
  'json-to-typescript': () => import('./tools/json-to-typescript.js'),
  'px-rem-converter': () => import('./tools/px-rem-converter.js'),
  'aspect-ratio-calculator': () => import('./tools/aspect-ratio-calculator.js'),
  'chmod-calculator': () => import('./tools/chmod-calculator.js'),
  'date-calculator': () => import('./tools/date-calculator.js'),
  'line-sorter': () => import('./tools/line-sorter.js'),
  'zenkaku-hankaku': () => import('./tools/zenkaku-hankaku.js'),
  'qr-code-reader': () => import('./tools/qr-code-reader.js'),
  'hex-dump-viewer': () => import('./tools/hex-dump-viewer.js'),
};

async function mountTool(rootEl) {
  const loader = toolLoaders[rootEl.dataset.tool];
  if (!loader) return;
  const mod = await loader();
  rootEl.innerHTML = '';
  rootEl.appendChild(mod.render());
}

async function hydrate() {
  initSiteUI();
  const toolRoot = document.getElementById('tool-root');
  if (toolRoot) await mountTool(toolRoot);
}

// 開発サーバー用のクライアントレンダリング（本番は静的HTMLが配信されるため通らない）
async function clientRender() {
  const [{ headerHTML, footerHTML }, pages] = await Promise.all([
    import('./templates/layout.js'),
    import('./templates/pages.js'),
  ]);

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  let page = null;
  if (path === '/') page = pages.homePage();
  else if (path === '/blog') page = pages.blogIndexPage();
  else if (path.startsWith('/blog/')) page = pages.blogPostPage(path.slice('/blog/'.length));
  else if (path === '/about') page = pages.aboutPage();
  else if (path === '/contact') page = pages.contactPage();
  else if (path === '/privacy') page = pages.privacyPage();
  else if (path === '/terms') page = pages.termsPage();
  else page = pages.toolPage(path.slice(1)) || pages.notFoundPage();

  document.title = page.meta.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', page.meta.description);

  const app = document.getElementById('app');
  app.innerHTML = `${headerHTML()}<main>${page.html}</main>${footerHTML()}`;
  await hydrate();
}

if (document.documentElement.hasAttribute('data-prerendered')) {
  hydrate();
} else {
  clientRender();
}
