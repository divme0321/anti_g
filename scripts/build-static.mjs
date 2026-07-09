// vite build 後に実行し、全ルートの静的HTML・sitemap.xml・feed.xml を dist/ に生成する。
// 使い方: npm run build（vite build && node scripts/build-static.mjs）
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteConfig } from '../src/site-config.js';
import { tools } from '../src/content/tools/index.js';
import { posts } from '../src/content/blog/index.js';
import { headerHTML, footerHTML } from '../src/templates/layout.js';
import {
  homePage,
  toolPage,
  blogIndexPage,
  blogPostPage,
  aboutPage,
  contactPage,
  privacyPage,
  termsPage,
  notFoundPage,
} from '../src/templates/pages.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// ---- vite が出力した index.html からハッシュ付きアセットタグを抽出 ----
const builtIndex = readFileSync(join(dist, 'index.html'), 'utf8');
const assetTags = [
  ...builtIndex.matchAll(/<script type="module"[^>]*src="\/assets\/[^"]+"[^>]*><\/script>/g),
  ...builtIndex.matchAll(/<link rel="modulepreload"[^>]*>/g),
  ...builtIndex.matchAll(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+"[^>]*>/g),
]
  .map((m) => m[0])
  .join('\n  ');

if (!assetTags.includes('stylesheet') || !assetTags.includes('script')) {
  throw new Error('dist/index.html からアセットタグを抽出できませんでした。vite build の出力を確認してください。');
}

const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const jsonLdScript = (objects) =>
  (objects || [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`)
    .join('\n  ');

function documentHTML(page, { noindex = false } = {}) {
  const { meta, html } = page;
  const canonical = siteConfig.url + (meta.path === '/' ? '/' : meta.path);
  return `<!DOCTYPE html>
<html lang="ja" data-prerendered="1">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}" />
  ${noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${canonical}" />`}
  <meta property="og:site_name" content="${siteConfig.name}" />
  <meta property="og:title" content="${esc(meta.title)}" />
  <meta property="og:description" content="${esc(meta.description)}" />
  <meta property="og:type" content="${meta.ogType || 'website'}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${siteConfig.url}/og-image.png" />
  <meta property="og:locale" content="${siteConfig.locale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${siteConfig.url}/og-image.png" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="alternate" type="application/rss+xml" title="${siteConfig.name} ブログ" href="${siteConfig.url}/feed.xml" />
  <script>(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClient}" crossorigin="anonymous"></script>
  ${jsonLdScript(meta.jsonLd)}
  ${assetTags}
</head>
<body>
  <div id="app">${headerHTML()}<main>${html}</main>${footerHTML()}</div>
</body>
</html>
`;
}

function writePage(outPath, html) {
  const file = join(dist, outPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// ---- 全ルートを生成 ----
const routes = [];

const home = homePage();
writePage('index.html', documentHTML(home));
routes.push({ path: '/', priority: '1.0' });

for (const t of tools) {
  const page = toolPage(t.slug);
  writePage(`${t.slug}/index.html`, documentHTML(page));
  routes.push({ path: `/${t.slug}`, priority: '0.8' });
}

writePage('blog/index.html', documentHTML(blogIndexPage()));
routes.push({ path: '/blog', priority: '0.7' });

for (const p of posts) {
  const page = blogPostPage(p.slug);
  writePage(`blog/${p.slug}/index.html`, documentHTML(page));
  routes.push({ path: `/blog/${p.slug}`, priority: '0.7', lastmod: p.updated || p.date });
}

const staticPages = [
  ['about', aboutPage()],
  ['contact', contactPage()],
  ['privacy', privacyPage()],
  ['terms', termsPage()],
];
for (const [slug, page] of staticPages) {
  writePage(`${slug}/index.html`, documentHTML(page));
  routes.push({ path: `/${slug}`, priority: '0.3' });
}

writePage('404.html', documentHTML(notFoundPage(), { noindex: true }));

// ---- sitemap.xml ----
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${siteConfig.url}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${r.lastmod || today}</lastmod>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap);

// ---- feed.xml（RSS 2.0）----
const rssItems = posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${siteConfig.url}/blog/${p.slug}</link>
      <guid>${siteConfig.url}/blog/${p.slug}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00+09:00`).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`
  )
  .join('\n');
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${siteConfig.name} ブログ</title>
    <link>${siteConfig.url}/blog</link>
    <description>Web開発の現場で役立つ技術リファレンスと入門ガイド</description>
    <language>ja</language>
${rssItems}
  </channel>
</rss>
`;
writeFileSync(join(dist, 'feed.xml'), rss);

console.log(`✓ 静的HTML ${routes.length + 1}ページ（404含む）+ sitemap.xml + feed.xml を生成しました`);
