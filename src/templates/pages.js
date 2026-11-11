// 各ページの本文HTMLとメタ情報を生成するテンプレート（文字列生成のみ・DOM非依存）
// 戻り値: { meta: { title, description, path, ogType, jsonLd }, html }
import { siteConfig } from '../site-config.js';
import { tools, categories, categoryMap, toolMap, toolsByCategory } from '../content/tools/index.js';
import { posts, postMap } from '../content/blog/index.js';

const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function breadcrumb(items) {
  const links = items
    .map((it, i) =>
      it.href && i < items.length - 1
        ? `<a href="${it.href}">${esc(it.label)}</a>`
        : `<span>${esc(it.label)}</span>`
    )
    .join('<span class="bc-sep" aria-hidden="true">/</span>');
  return `<nav class="breadcrumb" aria-label="パンくずリスト">${links}</nav>`;
}

function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: siteConfig.url + it.href } : {}),
    })),
  };
}

function toolCard(t) {
  return `
    <a class="tool-card" href="/${t.slug}/" data-name="${esc(t.name)} ${esc(t.shortDesc)} ${t.slug}">
      <span class="tool-card-icon" aria-hidden="true">${t.icon}</span>
      <span class="tool-card-body">
        <span class="tool-card-name">${esc(t.name)}</span>
        <span class="tool-card-desc">${esc(t.shortDesc)}</span>
      </span>
    </a>`;
}

function postCard(p) {
  return `
    <a class="post-card" href="/blog/${p.slug}/">
      <span class="post-card-meta"><span class="post-card-cat">${esc(p.category)}</span><time datetime="${p.date}">${formatDate(p.date)}</time></span>
      <span class="post-card-title">${esc(p.title)}</span>
      <span class="post-card-desc">${esc(p.description)}</span>
    </a>`;
}

// ブログのカテゴリ表示順（一覧ページの見出し順）
const blogCategories = [
  { id: 'reference', label: 'リファレンス', desc: '手元に置いて何度も引く早見表・チートシート' },
  { id: 'guide', label: '入門ガイド', desc: '仕組みと考え方を基礎から理解するための解説' },
];

// あるツールを relatedTools に挙げている記事（新しい順）
function postsForTool(slug) {
  return posts.filter((p) => (p.relatedTools || []).includes(slug));
}

// あるツールカテゴリに関連する記事（カテゴリ内のツールを relatedTools に挙げている記事）
function postsForCategory(categoryId) {
  const slugs = new Set(toolsByCategory(categoryId).map((t) => t.slug));
  return posts.filter((p) => (p.relatedTools || []).some((s) => slugs.has(s)));
}

// 関連記事: タグ・関連ツールの重なりでスコアを付け、不足分は新着で補う
function relatedPosts(p, limit = 3) {
  const tags = new Set(p.tags || []);
  const rel = new Set(p.relatedTools || []);
  const scored = posts
    .filter((o) => o.slug !== p.slug)
    .map((o) => ({
      post: o,
      score:
        (o.tags || []).filter((t) => tags.has(t)).length * 2 +
        (o.relatedTools || []).filter((t) => rel.has(t)).length * 2 +
        (o.category === p.category ? 1 : 0),
    }));
  // sort は安定なので、同点の場合は posts の並び（新しい順）が保たれる
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}

// 記事本文の h2 に id を振り、目次HTMLを作る（文字列処理のみ・DOM非依存）
function withToc(body) {
  const items = [];
  const html = body.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
    const id = `sec-${items.length + 1}`;
    items.push({ id, label: inner.replace(/<[^>]+>/g, '') });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  if (items.length < 3) return { toc: '', html: body };
  const toc = `
      <nav class="toc" aria-labelledby="toc-heading">
        <p class="toc-title" id="toc-heading">目次</p>
        <ol>${items.map((it) => `<li><a href="#${it.id}">${it.label}</a></li>`).join('')}</ol>
      </nav>`;
  return { toc, html };
}

function categoryNav() {
  return `<div class="category-nav">${categories
    .map(
      (cat) =>
        `<a class="category-chip" href="/category/${cat.id}/"><span class="category-chip-name">${esc(cat.label)}</span><span class="category-chip-count">${toolsByCategory(cat.id).length}種類</span></a>`
    )
    .join('')}</div>`;
}

// ---------------- ホーム ----------------
export function homePage() {
  const categorySections = categories
    .map((cat) => {
      const cards = toolsByCategory(cat.id).map(toolCard).join('');
      return `
      <section class="tool-category" aria-labelledby="cat-${cat.id}">
        <span class="eyebrow" aria-hidden="true">${cat.id}</span>
        <h3 id="cat-${cat.id}"><a href="/category/${cat.id}/">${esc(cat.label)}</a></h3>
        <p class="tool-category-desc">${esc(cat.desc)}</p>
        <div class="tool-grid">${cards}</div>
      </section>`;
    })
    .join('');

  const latestPosts = posts.slice(0, 6).map(postCard).join('');

  const html = `
  <div class="home">
    <section class="hero">
      <h1>${esc(siteConfig.tagline)}</h1>
      <p class="hero-sub">JSON整形からQRコード作成まで、開発と制作の「ちょっと面倒」を一瞬で片付ける${tools.length}種類の無料ツール。登録不要、すべてブラウザ内で動作します。</p>
      <div class="hero-search">
        <input type="search" id="tool-search" placeholder="ツールを検索（例: JSON、パスワード、QR）" aria-label="ツールを検索" autocomplete="off" />
      </div>
      <div class="hero-badges">
        <span class="badge">✓ 完全無料</span>
        <span class="badge">✓ 登録不要</span>
        <span class="badge">✓ ブラウザで利用</span>
      </div>
    </section>

    <section class="home-categories" aria-labelledby="categories-heading">
      <span class="eyebrow" aria-hidden="true">Categories</span>
      <h2 id="categories-heading">目的から探す</h2>
      ${categoryNav()}
    </section>

    <section class="tools-section" id="tools" aria-labelledby="tools-heading">
      <span class="eyebrow" aria-hidden="true">All Tools</span>
      <h2 id="tools-heading">ツール一覧</h2>
      <p class="no-results" id="no-results" hidden>該当するツールが見つかりませんでした。</p>
      ${categorySections}
    </section>

    <section class="home-blog" aria-labelledby="blog-heading">
      <span class="eyebrow" aria-hidden="true">Blog</span>
      <div class="section-head">
        <h2 id="blog-heading">技術ブログ・リファレンス</h2>
        <a class="section-more" href="/blog/">すべての記事 →</a>
      </div>
      <div class="post-grid">${latestPosts}</div>
    </section>

    <section class="home-about">
      <span class="eyebrow" aria-hidden="true">About</span>
      <h2>DevToolBox について</h2>
      <p>DevToolBox は、Web開発・プログラミングの現場で毎日のように必要になる小さな作業——JSONの整形、Base64の変換、正規表現の確認、パスワードの生成など——を、インストール不要でその場で済ませられるオンラインツール集です。</p>
      <p>ブラウザ上で使える開発用ツールです。動作確認にはダミーデータを使い、機密情報や本番環境のAPIキー・トークンは入力しないでください。あわせて、HTTPステータスコードや正規表現などの<a href="/blog/">技術リファレンス記事</a>も公開しています。</p>
    </section>
  </div>`;

  return {
    meta: {
      title: `${siteConfig.name}｜${siteConfig.tagline}【登録不要・${tools.length}種類】`,
      description: siteConfig.description,
      path: '/',
      lastmod: posts[0]?.updated || posts[0]?.date,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteConfig.name,
          url: siteConfig.url,
          description: siteConfig.description,
          inLanguage: 'ja',
          publisher: { '@type': 'Organization', name: siteConfig.operator.name },
        },
      ],
    },
    html,
  };
}

// ---------------- ツールページ ----------------
export function toolPage(slug) {
  const t = toolMap[slug];
  if (!t) return null;
  const cat = categories.find((c) => c.id === t.category);
  const bc = [
    { label: 'ホーム', href: '/' },
    { label: cat ? cat.label : 'ツール', href: cat ? `/category/${cat.id}/` : '/#tools' },
    { label: t.name },
  ];

  const faqHTML = t.faq?.length
    ? `
    <section class="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">よくある質問</h2>
      ${t.faq
        .map(
          (f) => `
      <details class="faq-item">
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`
        )
        .join('')}
    </section>`
    : '';

  const relatedHTML = t.related?.length
    ? `
    <section class="related" aria-labelledby="related-heading">
      <h2 id="related-heading">関連ツール</h2>
      <div class="tool-grid">${t.related
        .map((slug2) => toolMap[slug2])
        .filter(Boolean)
        .map(toolCard)
        .join('')}</div>
    </section>`
    : '';

  const toolPosts = postsForTool(t.slug).slice(0, 4);
  const relatedPostsHTML = toolPosts.length
    ? `
    <section class="related related-posts" aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading">関連する解説記事</h2>
      <div class="post-grid">${toolPosts.map(postCard).join('')}</div>
    </section>`
    : '';

  const html = `
  <div class="tool-page">
    ${breadcrumb(bc)}
    <div class="tool-head">
      <h1><span class="tool-head-icon" aria-hidden="true">${t.icon}</span>${esc(t.name)}</h1>
      <p class="tool-lead">${esc(t.lead)}</p>
    </div>
    <p class="tool-input-note">動作確認にはダミーデータを使い、機密情報・個人情報、本番環境のAPIキー・トークンや使用中のパスワードは入力しないでください。外部通信については<a href="/privacy/">プライバシーポリシー</a>をご確認ください。</p>
    <div id="tool-root" data-tool="${t.slug}">
      <noscript><p class="noscript-note">このツールの実行にはJavaScriptを有効にしてください。</p></noscript>
      <div class="tool-loading" aria-hidden="true">ツールを読み込み中...</div>
    </div>
    <article class="article">${t.article}</article>
    ${t.updated ? `<p class="content-updated">最終更新: <time datetime="${t.updated}">${formatDate(t.updated)}</time></p>` : ''}
    ${faqHTML}
    ${relatedHTML}
    ${relatedPostsHTML}
  </div>`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: t.name,
      url: `${siteConfig.url}/${t.slug}/`,
      description: t.description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      inLanguage: 'ja',
      ...(t.updated ? { dateModified: t.updated } : {}),
    },
    breadcrumbJsonLd(bc),
  ];
  if (t.faq?.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: t.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return {
    meta: { title: t.title, description: t.description, path: `/${t.slug}`, lastmod: t.updated, ogType: 'website', jsonLd },
    html,
  };
}

// ---------------- ブログ ----------------
export function blogIndexPage() {
  const html = `
  <div class="blog-index">
    ${breadcrumb([{ label: 'ホーム', href: '/' }, { label: 'ブログ' }])}
    <div class="page-head">
      <h1>技術ブログ・リファレンス</h1>
      <p>Web開発の現場で役立つリファレンスと入門ガイドを公開しています。ツールとあわせてブックマークしてご活用ください。</p>
    </div>
    <nav class="blog-cat-nav" aria-label="記事カテゴリ">${blogCategories
      .map((c) => `<a class="category-chip" href="#blog-${c.id}"><span class="category-chip-name">${esc(c.label)}</span><span class="category-chip-count">${posts.filter((p) => p.category === c.label).length}本</span></a>`)
      .join('')}</nav>
    ${blogCategories
      .map((c) => {
        const list = posts.filter((p) => p.category === c.label);
        return list.length
          ? `
    <section class="blog-cat" aria-labelledby="blog-${c.id}">
      <h2 id="blog-${c.id}">${esc(c.label)}</h2>
      <p class="blog-cat-desc">${esc(c.desc)}</p>
      <div class="post-list">${list.map(postCard).join('')}</div>
    </section>`
          : '';
      })
      .join('')}
    ${(() => {
      // 既知のカテゴリに当てはまらない記事も一覧から漏らさない
      const known = new Set(blogCategories.map((c) => c.label));
      const rest = posts.filter((p) => !known.has(p.category));
      return rest.length
        ? `
    <section class="blog-cat" aria-labelledby="blog-other">
      <h2 id="blog-other">その他</h2>
      <div class="post-list">${rest.map(postCard).join('')}</div>
    </section>`
        : '';
    })()}
    <section class="blog-tools" aria-labelledby="blog-tools-heading">
      <h2 id="blog-tools-heading">ツールをカテゴリから探す</h2>
      ${categoryNav()}
    </section>
  </div>`;

  return {
    meta: {
      title: `技術ブログ・リファレンス - ${siteConfig.name}`,
      description:
        'HTTPステータスコード一覧、正規表現入門、Gitコマンド逆引きなど、Web開発の現場で役立つ技術リファレンスと入門ガイドを公開しています。',
      path: '/blog',
      lastmod: posts[0]?.updated || posts[0]?.date,
      ogType: 'website',
      jsonLd: [breadcrumbJsonLd([{ label: 'ホーム', href: '/' }, { label: 'ブログ' }])],
    },
    html,
  };
}

export function blogPostPage(slug) {
  const p = postMap[slug];
  if (!p) return null;
  const bc = [{ label: 'ホーム', href: '/' }, { label: 'ブログ', href: '/blog/' }, { label: p.title }];

  const relatedHTML = p.relatedTools?.length
    ? `
    <section class="related" aria-labelledby="related-heading">
      <h2 id="related-heading">この記事に関連するツール</h2>
      <div class="tool-grid">${p.relatedTools
        .map((s) => toolMap[s])
        .filter(Boolean)
        .map(toolCard)
        .join('')}</div>
    </section>`
    : '';

  const more = relatedPosts(p);
  const relatedPostsHTML = more.length
    ? `
    <section class="related related-posts" aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading">関連記事</h2>
      <div class="post-grid">${more.map(postCard).join('')}</div>
    </section>`
    : '';
  const { toc, html: bodyHTML } = withToc(p.body);
  // 導入文（最初の h2 より前）の直後に目次を差し込む
  const firstH2 = bodyHTML.indexOf('<h2');
  const bodyWithToc = toc && firstH2 >= 0 ? bodyHTML.slice(0, firstH2) + toc + bodyHTML.slice(firstH2) : bodyHTML;

  const html = `
  <div class="blog-post">
    ${breadcrumb(bc)}
    <article class="article article-post">
      <header class="post-header">
        <div class="post-meta">
          <span class="post-card-cat">${esc(p.category)}</span>
          <time datetime="${p.date}">${formatDate(p.date)}公開</time>
          ${p.updated && p.updated !== p.date ? `<time datetime="${p.updated}">${formatDate(p.updated)}更新</time>` : ''}
        </div>
        <h1>${esc(p.title)}</h1>
        <div class="post-tags">${(p.tags || []).map((tag) => `<span class="tag">${esc(tag)}</span>`).join('')}</div>
      </header>
      ${bodyWithToc}
    </article>
    ${relatedHTML}
    ${relatedPostsHTML}
  </div>`;

  return {
    meta: {
      title: `${p.title} - ${siteConfig.name}`,
      description: p.description,
      path: `/blog/${p.slug}`,
      lastmod: p.updated || p.date,
      ogType: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          dateModified: p.updated || p.date,
          inLanguage: 'ja',
          mainEntityOfPage: `${siteConfig.url}/blog/${p.slug}/`,
          author: { '@type': 'Organization', name: siteConfig.operator.name },
          publisher: { '@type': 'Organization', name: siteConfig.operator.name },
        },
        breadcrumbJsonLd(bc),
      ],
    },
    html,
  };
}

// ---------------- カテゴリ ----------------
export function categoryPage(id) {
  const cat = categoryMap[id];
  if (!cat) return null;
  const list = toolsByCategory(id);
  const catPosts = postsForCategory(id).slice(0, 6);
  const bc = [{ label: 'ホーム', href: '/' }, { label: cat.label }];
  const others = categories.filter((c) => c.id !== id);

  const html = `
  <div class="category-page">
    ${breadcrumb(bc)}
    <div class="page-head">
      <h1>${esc(cat.label)}ツール一覧</h1>
      <p>${esc(cat.intro)}</p>
    </div>
    <section class="category-tools" aria-labelledby="category-tools-heading">
      <h2 id="category-tools-heading">${esc(cat.label)}のツール（${list.length}種類）</h2>
      <div class="tool-grid">${list.map(toolCard).join('')}</div>
    </section>
    <section class="category-guide" aria-labelledby="category-guide-heading">
      <h2 id="category-guide-heading">各ツールでできること</h2>
      <ul class="category-guide-list">${list
        .map((t) => `<li><a href="/${t.slug}/">${esc(t.name)}</a>: ${esc(t.lead)}</li>`)
        .join('')}</ul>
    </section>
    ${
      catPosts.length
        ? `
    <section class="related related-posts" aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading">${esc(cat.label)}に関する解説記事</h2>
      <div class="post-grid">${catPosts.map(postCard).join('')}</div>
    </section>`
        : ''
    }
    <section class="related" aria-labelledby="other-categories-heading">
      <h2 id="other-categories-heading">ほかのカテゴリ</h2>
      <div class="category-nav">${others
        .map(
          (c) =>
            `<a class="category-chip" href="/category/${c.id}/"><span class="category-chip-name">${esc(c.label)}</span><span class="category-chip-count">${toolsByCategory(c.id).length}種類</span></a>`
        )
        .join('')}</div>
    </section>
  </div>`;

  const updates = list.map((t) => t.updated).filter(Boolean).sort();
  return {
    meta: {
      title: `${cat.label}ツール一覧（${list.length}種類・無料） - ${siteConfig.name}`,
      description: `${cat.desc}を${list.length}種類まとめました。${list
        .slice(0, 4)
        .map((t) => t.name)
        .join('、')}など、登録不要・無料でブラウザから使えます。`,
      path: `/category/${id}`,
      lastmod: updates[updates.length - 1],
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${cat.label}ツール一覧`,
          url: `${siteConfig.url}/category/${id}/`,
          description: cat.intro,
          inLanguage: 'ja',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: list.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.name,
              url: `${siteConfig.url}/${t.slug}/`,
            })),
          },
        },
        breadcrumbJsonLd(bc),
      ],
    },
    html,
  };
}

// ---------------- 固定ページ ----------------
export function aboutPage() {
  const html = `
  <div class="static-page">
    ${breadcrumb([{ label: 'ホーム', href: '/' }, { label: '運営者情報' }])}
    <article class="article">
      <h1>運営者情報</h1>
      <h2>DevToolBox について</h2>
      <p>DevToolBox（${siteConfig.url.replace('https://', '')}）は、Web開発者・プログラマー・Web制作に携わる方に向けて、日々の作業で必要になる${tools.length}種類のオンラインツールと技術情報を無料で提供するサイトです。</p>
      <p>「小さな作業のためにアプリをインストールしたり、怪しいサイトにデータを貼り付けたりしたくない」という開発現場の悩みを解決するために、次の3つを設計方針としています。</p>
      <ul>
        <li><strong>入力データへの配慮:</strong> ツールの変換・計算はブラウザ内で行います。動作確認にはダミーデータを使い、機密情報・個人情報や使用中の認証情報は入力しないでください。外部通信については<a href="/privacy/">プライバシーポリシー</a>をご確認ください。</li>
        <li><strong>登録不要・完全無料:</strong> アカウント作成や料金は一切不要です。</li>
        <li><strong>正確で実用的な情報:</strong> 各ツールには仕組みの解説と実務での使い方を掲載し、単なる変換だけでなく「理解して使える」ことを目指しています。</li>
      </ul>
      <h2>運営者</h2>
      <table>
        <tbody>
          <tr><th>運営会社</th><td>${siteConfig.operator.name}</td></tr>
          <tr><th>所在地</th><td>${siteConfig.operator.address}</td></tr>
          <tr><th>連絡先</th><td><a href="mailto:${siteConfig.operator.email}">${siteConfig.operator.email}</a></td></tr>
          <tr><th>コーポレートサイト</th><td><a href="${siteConfig.operator.site}" target="_blank" rel="noopener">${siteConfig.operator.site}</a></td></tr>
        </tbody>
      </table>
      <h2>コンテンツの品質について</h2>
      <p>掲載しているツールと記事は、実際の開発業務での利用を想定して作成し、公開後も継続的に改善しています。誤りを見つけた場合や、追加してほしいツール・記事のご要望は、<a href="/contact/">お問い合わせページ</a>からお気軽にお知らせください。</p>
    </article>
  </div>`;

  return {
    meta: {
      title: `運営者情報 - ${siteConfig.name}`,
      description: `${siteConfig.name}の運営者情報。運営会社、サイトの設計方針、コンテンツ品質への取り組みについて掲載しています。`,
      path: '/about',
      ogType: 'website',
      jsonLd: [],
    },
    html,
  };
}

export function contactPage() {
  const html = `
  <div class="static-page">
    ${breadcrumb([{ label: 'ホーム', href: '/' }, { label: 'お問い合わせ' }])}
    <article class="article">
      <h1>お問い合わせ</h1>
      <p>DevToolBox へのご意見・ご要望・不具合のご報告は、下記メールアドレスまでお寄せください。すべてのメールに目を通しています。</p>
      <p class="contact-email"><a href="mailto:${siteConfig.operator.email}">${siteConfig.operator.email}</a></p>
      <h2>お問い合わせの例</h2>
      <ul>
        <li>ツールの不具合報告（お使いのブラウザ名とあわせてお知らせいただけると助かります）</li>
        <li>「こんなツールがほしい」という追加のご要望</li>
        <li>記事内容の誤りのご指摘</li>
        <li>広告・提携などビジネスに関するご連絡</li>
      </ul>
      <h2>ご返信について</h2>
      <p>内容を確認のうえ、通常2〜3営業日以内にご返信します。不具合報告や記事の誤りのご指摘は、返信の有無にかかわらず優先的に対応します。</p>
      <p>入力データの取り扱いについては<a href="/privacy/">プライバシーポリシー</a>をご覧ください。</p>
    </article>
  </div>`;

  return {
    meta: {
      title: `お問い合わせ - ${siteConfig.name}`,
      description: `${siteConfig.name}へのお問い合わせ方法。不具合報告、ツール追加のご要望、記事の誤りのご指摘などを受け付けています。`,
      path: '/contact',
      ogType: 'website',
      jsonLd: [],
    },
    html,
  };
}

export function privacyPage() {
  const html = `
  <div class="static-page">
    ${breadcrumb([{ label: 'ホーム', href: '/' }, { label: 'プライバシーポリシー' }])}
    <article class="article">
      <h1>プライバシーポリシー</h1>
      <p>${siteConfig.operator.name}（以下「当社」）は、当社が運営する DevToolBox（以下「当サイト」）における利用者情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。</p>

      <h2>1. ツールに入力されたデータについて</h2>
      <p>ツールの変換・計算はブラウザ内で行います。動作確認にはダミーデータを使い、機密情報・個人情報、本番環境のAPIキー・トークンや使用中のパスワードは入力しないでください。ブラウザ内で処理することは、サイト全体で外部通信が発生しないことや、入力情報の安全性を保証するものではありません。</p>
      <p>ページにはGoogle AdSenseのスクリプトとGoogle Fontsのスタイルシートを読み込むコードがあり、cron式の解析ツールでは外部CDNのライブラリも読み込みます。これらの読込時には各配信元への通信が発生し、IPアドレスやブラウザ情報などが配信元に伝わる場合があります。メタタグ生成ツールで指定した外部画像URLのプレビュー時にも、画像の配信元へ通信します。Markdownプレビューでは生HTMLを文字として表示し、画像を自動で読み込みません。リンクを開く操作をした場合は移動先へ通信します。</p>

      <h2>2. アクセス解析・Cookieについて</h2>
      <p>サイトの配信や外部サービスの読込に伴い、アクセス情報が各配信元で取り扱われる場合があります。ブラウザには画面テーマの設定を保存します。広告に関するCookieと第三者配信事業者については、次の「広告配信について」をご確認ください。</p>

      <h2>3. 広告配信について</h2>
      <p>当サイトはGoogle AdSenseの導入を予定しています。広告配信開始後は、Googleなどの第三者配信事業者がCookieを使用し、当サイトや他のサイトへの過去のアクセス情報に基づいて広告を配信する場合があります。Googleおよびそのパートナーは、広告Cookieを利用して、利用者の関心に応じた広告を表示する場合があります。</p>
      <p>Googleによるパーソナライズ広告は<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Googleの広告設定</a>から無効にできます。また、<a href="https://optout.aboutads.info/" target="_blank" rel="noopener">WebChoices</a>では、参加する第三者配信事業者によるパーソナライズ広告を無効にできます。</p>

      <h2>4. お問い合わせで取得する情報</h2>
      <p>お問い合わせの際に取得したメールアドレス等の情報は、ご質問への回答および必要な連絡のためにのみ利用し、法令に基づく場合を除き第三者へ提供することはありません。</p>

      <h2>5. 免責事項</h2>
      <p>当サイトからリンクやバナーによって他のサイトへ移動した場合、移動先サイトで提供される情報・サービスについて当社は責任を負いません。また、当サイトのコンテンツについては正確性の維持に努めていますが、その内容の正確性・安全性を保証するものではありません。</p>

      <h2>6. プライバシーポリシーの変更</h2>
      <p>当社は、法令の変更やサービス内容の変更に応じて、本ポリシーを予告なく改定することがあります。改定後のポリシーは、当ページに掲載した時点から効力を生じるものとします。</p>

      <p class="policy-date">制定日: 2025年11月1日<br />最終改定日: 2026年10月20日</p>
    </article>
  </div>`;

  return {
    meta: {
      title: `プライバシーポリシー - ${siteConfig.name}`,
      description: `${siteConfig.name}のプライバシーポリシー。入力データの取り扱い、Cookie、Google AdSenseによる広告配信について説明しています。`,
      path: '/privacy',
      lastmod: '2026-10-20',
      ogType: 'website',
      jsonLd: [],
    },
    html,
  };
}

export function termsPage() {
  const html = `
  <div class="static-page">
    ${breadcrumb([{ label: 'ホーム', href: '/' }, { label: '利用規約' }])}
    <article class="article">
      <h1>利用規約</h1>
      <p>本規約は、${siteConfig.operator.name}（以下「当社」）が運営する DevToolBox（以下「当サイト」）の利用条件を定めるものです。当サイトを利用された時点で、本規約に同意いただいたものとみなします。</p>

      <h2>1. サービス内容</h2>
      <p>当サイトは、開発者向けのオンラインツールおよび技術情報を無料で提供します。アカウント登録は不要で、どなたでもご利用いただけます。</p>

      <h2>2. ツールの出力の利用</h2>
      <p>当サイトのツールで生成・変換した結果（生成されたパスワード、QRコード、整形されたコードなど）は、個人利用・商用利用を問わず自由にご利用いただけます。</p>

      <h2>3. 禁止事項</h2>
      <ul>
        <li>当サイトのサーバーやネットワークに過度な負荷をかける行為</li>
        <li>当サイトの運営を妨害する行為</li>
        <li>法令または公序良俗に違反する目的での利用</li>
        <li>当サイトのコンテンツを無断で複製・転載する行為</li>
      </ul>

      <h2>4. 免責事項</h2>
      <p>当社は、当サイトのツールの処理結果および掲載情報の正確性・完全性・有用性について、いかなる保証も行いません。当サイトの利用により生じたいかなる損害についても、当社は責任を負わないものとします。重要なデータを扱う際は、必ずご自身で結果を検証してください。</p>

      <h2>5. サービスの変更・中断</h2>
      <p>当社は、利用者への事前の通知なく、当サイトの内容の変更、提供の中断または終了を行うことがあります。</p>

      <h2>6. 規約の変更</h2>
      <p>当社は、必要と判断した場合、本規約を予告なく変更することがあります。変更後の規約は、当ページに掲載した時点から効力を生じるものとします。</p>

      <p class="policy-date">制定日: 2025年11月1日<br />最終改定日: 2026年7月9日</p>
    </article>
  </div>`;

  return {
    meta: {
      title: `利用規約 - ${siteConfig.name}`,
      description: `${siteConfig.name}の利用規約。サービス内容、ツール出力の利用条件、禁止事項、免責事項について定めています。`,
      path: '/terms',
      lastmod: '2026-07-09',
      ogType: 'website',
      jsonLd: [],
    },
    html,
  };
}

export function notFoundPage() {
  const popular = tools.slice(0, 6).map(toolCard).join('');
  const html = `
  <div class="static-page not-found">
    <h1>404 — ページが見つかりません</h1>
    <p>お探しのページは移動または削除された可能性があります。URLに誤りがないかご確認のうえ、<a href="/">トップページ</a>からお探しください。</p>
    <section class="related">
      <h2>よく使われているツール</h2>
      <div class="tool-grid">${popular}</div>
    </section>
  </div>`;
  return {
    meta: {
      title: `ページが見つかりません - ${siteConfig.name}`,
      description: 'お探しのページが見つかりませんでした。',
      path: '/404',
      ogType: 'website',
      jsonLd: [],
    },
    html,
  };
}
