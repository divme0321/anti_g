// ビルド済みHTMLと検索向けURLの整合性を検証する。使い方: npm run test:seo
// 本番のHTTP応答・検索エンジンのインデックス登録状況は検証対象外。
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig } from '../src/site-config.js';
import { tools } from '../src/content/tools/index.js';
import { posts } from '../src/content/blog/index.js';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const read = (path) => readFileSync(join(dist, path), 'utf8');
const expectedPaths = [
  '/', ...tools.map((tool) => `/${tool.slug}/`), '/blog/',
  ...posts.map((post) => `/blog/${post.slug}/`),
  '/about/', '/contact/', '/privacy/', '/terms/',
];
const expectedUrls = expectedPaths.map((path) => siteConfig.url + path);
assert.equal(new Set(expectedUrls).size, expectedUrls.length, '公開ルートが重複しています');

const sitemap = read('sitemap.xml');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(locations).size, locations.length, 'sitemapに重複URLがあります');
assert.deepEqual([...locations].sort(), [...expectedUrls].sort(), 'sitemapと公開ルートが一致しません');

// サイトマップから欠落したHTMLも検出するため、生成されたファイル一覧も照合する。
function htmlFiles(directory = '') {
  return readdirSync(join(dist, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
  });
}
const expectedFiles = expectedPaths.map((path) => join(path.slice(1), 'index.html'));
assert.deepEqual(htmlFiles().sort(), [...expectedFiles, '404.html'].sort(), '公開ルートと生成HTMLが一致しません');

for (const [index, path] of expectedPaths.entries()) {
  const html = read(expectedFiles[index]);
  const canonical = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  const ogUrl = [...html.matchAll(/<meta\b[^>]*property="og:url"[^>]*content="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  assert.deepEqual(canonical, [siteConfig.url + path], `${path}: canonicalが一致しません`);
  assert.deepEqual(ogUrl, canonical, `${path}: og:urlがcanonicalと一致しません`);
  assert.ok(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html), `${path}: 公開ページにnoindexがあります`);
}

const notFound = read('404.html');
assert.match(notFound, /<meta name="robots" content="noindex"\s*\/>/, '404にnoindexがありません');
assert.doesNotMatch(notFound, /rel="canonical"/, '404にcanonicalが含まれています');

// 現行の全体公開ポリシーを固定し、意図しないクロール禁止や別ホストを検出する。
const robotsLines = read('robots.txt').split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
assert.deepEqual(robotsLines, ['User-agent: *', 'Allow: /', `Sitemap: ${siteConfig.url}/sitemap.xml`], 'robots.txtが公開ポリシーと一致しません');

console.log(`✓ SEO整合性: 公開${expectedPaths.length}ページ + 404 + sitemap.xml + robots.txt`);
