// 各ページの本文HTMLとメタ情報を生成するテンプレート（文字列生成のみ・DOM非依存）
// 戻り値: { meta: { title, description, path, ogType, jsonLd }, html }
import { siteConfig } from '../site-config.js';
import { tools, categories, toolMap, toolsByCategory } from '../content/tools/index.js';
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
    <a class="tool-card" href="/${t.slug}" data-name="${esc(t.name)} ${esc(t.shortDesc)} ${t.slug}">
      <span class="tool-card-icon" aria-hidden="true">${t.icon}</span>
      <span class="tool-card-body">
        <span class="tool-card-name">${esc(t.name)}</span>
        <span class="tool-card-desc">${esc(t.shortDesc)}</span>
      </span>
    </a>`;
}

function postCard(p) {
  return `
    <a class="post-card" href="/blog/${p.slug}">
      <span class="post-card-meta"><span class="post-card-cat">${esc(p.category)}</span><time datetime="${p.date}">${formatDate(p.date)}</time></span>
      <span class="post-card-title">${esc(p.title)}</span>
      <span class="post-card-desc">${esc(p.description)}</span>
    </a>`;
}

// ---------------- ホーム ----------------
export function homePage() {
  const categorySections = categories
    .map((cat) => {
      const cards = toolsByCategory(cat.id).map(toolCard).join('');
      return `
      <section class="tool-category" aria-labelledby="cat-${cat.id}">
        <h3 id="cat-${cat.id}">${esc(cat.label)}</h3>
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
        <span class="badge">✓ データ送信なし</span>
      </div>
    </section>

    <section class="tools-section" id="tools" aria-labelledby="tools-heading">
      <h2 id="tools-heading">ツール一覧</h2>
      <p class="no-results" id="no-results" hidden>該当するツールが見つかりませんでした。</p>
      ${categorySections}
    </section>

    <section class="home-blog" aria-labelledby="blog-heading">
      <div class="section-head">
        <h2 id="blog-heading">技術ブログ・リファレンス</h2>
        <a class="section-more" href="/blog">すべての記事 →</a>
      </div>
      <div class="post-grid">${latestPosts}</div>
    </section>

    <section class="home-about">
      <h2>DevToolBox について</h2>
      <p>DevToolBox は、Web開発・プログラミングの現場で毎日のように必要になる小さな作業——JSONの整形、Base64の変換、正規表現の確認、パスワードの生成など——を、インストール不要でその場で済ませられるオンラインツール集です。</p>
      <p>すべてのツールはJavaScriptによりお使いのブラウザ内だけで動作します。入力したコードやデータが外部サーバーへ送信されることはないため、業務のデータや機密情報を扱う場面でも安心してご利用いただけます。あわせて、HTTPステータスコードや正規表現などの<a href="/blog">技術リファレンス記事</a>も公開しています。</p>
    </section>
  </div>`;

  return {
    meta: {
      title: `${siteConfig.name}｜${siteConfig.tagline}【登録不要・${tools.length}種類】`,
      description: siteConfig.description,
      path: '/',
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
    { label: cat ? cat.label : 'ツール', href: '/#tools' },
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

  const html = `
  <div class="tool-page">
    ${breadcrumb(bc)}
    <div class="tool-head">
      <h1><span class="tool-head-icon" aria-hidden="true">${t.icon}</span>${esc(t.name)}</h1>
      <p class="tool-lead">${esc(t.lead)}</p>
    </div>
    <div id="tool-root" data-tool="${t.slug}">
      <noscript><p class="noscript-note">このツールの実行にはJavaScriptを有効にしてください。</p></noscript>
      <div class="tool-loading" aria-hidden="true">ツールを読み込み中...</div>
    </div>
    <article class="article">${t.article}</article>
    ${faqHTML}
    ${relatedHTML}
  </div>`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: t.name,
      url: `${siteConfig.url}/${t.slug}`,
      description: t.description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      inLanguage: 'ja',
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
    meta: { title: t.title, description: t.description, path: `/${t.slug}`, ogType: 'website', jsonLd },
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
    <div class="post-list">${posts.map(postCard).join('')}</div>
  </div>`;

  return {
    meta: {
      title: `技術ブログ・リファレンス - ${siteConfig.name}`,
      description:
        'HTTPステータスコード一覧、正規表現入門、Gitコマンド逆引きなど、Web開発の現場で役立つ技術リファレンスと入門ガイドを公開しています。',
      path: '/blog',
      ogType: 'website',
      jsonLd: [breadcrumbJsonLd([{ label: 'ホーム', href: '/' }, { label: 'ブログ' }])],
    },
    html,
  };
}

export function blogPostPage(slug) {
  const p = postMap[slug];
  if (!p) return null;
  const bc = [{ label: 'ホーム', href: '/' }, { label: 'ブログ', href: '/blog' }, { label: p.title }];

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
      ${p.body}
    </article>
    ${relatedHTML}
  </div>`;

  return {
    meta: {
      title: `${p.title} - ${siteConfig.name}`,
      description: p.description,
      path: `/blog/${p.slug}`,
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
          mainEntityOfPage: `${siteConfig.url}/blog/${p.slug}`,
          author: { '@type': 'Organization', name: siteConfig.operator.name },
          publisher: { '@type': 'Organization', name: siteConfig.operator.name },
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
        <li><strong>プライバシー第一:</strong> すべてのツールはブラウザ内のJavaScriptだけで動作し、入力データを外部サーバーへ送信しません。</li>
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
      <p>掲載しているツールと記事は、実際の開発業務での利用を想定して作成し、公開後も継続的に改善しています。誤りを見つけた場合や、追加してほしいツール・記事のご要望は、<a href="/contact">お問い合わせページ</a>からお気軽にお知らせください。</p>
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
      <p>入力データの取り扱いについては<a href="/privacy">プライバシーポリシー</a>をご覧ください。</p>
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
      <p>当サイトのすべてのツールは、お使いのブラウザ内のJavaScriptだけで動作します。ツールに入力されたテキスト・コード・画像などのデータが当社のサーバーへ送信・保存されることは一切ありません。</p>

      <h2>2. アクセス解析・Cookieについて</h2>
      <p>当サイトでは、サービス向上のためにアクセス状況を統計的に把握することがあります。この際にCookieや類似技術が使用される場合がありますが、個人を特定する情報は収集しません。</p>

      <h2>3. 広告配信について</h2>
      <p>当サイトでは、第三者配信の広告サービス「Google AdSense（グーグルアドセンス）」を利用しています。広告配信事業者は、利用者の興味に応じた広告を表示するためにCookieを使用することがあります。</p>
      <p>Cookieを使用することで、当サイトは利用者のコンピュータを識別できるようになりますが、氏名・住所・メールアドレスなど個人を特定できる情報を取得することはありません。</p>
      <p>Cookieを無効にする方法や Google AdSense に関する詳細は、<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener">Googleの広告に関するポリシーと規約</a>をご確認ください。パーソナライズ広告は、<a href="https://adssettings.google.com/" target="_blank" rel="noopener">Googleの広告設定</a>から無効にできます。</p>

      <h2>4. お問い合わせで取得する情報</h2>
      <p>お問い合わせの際に取得したメールアドレス等の情報は、ご質問への回答および必要な連絡のためにのみ利用し、法令に基づく場合を除き第三者へ提供することはありません。</p>

      <h2>5. 免責事項</h2>
      <p>当サイトからリンクやバナーによって他のサイトへ移動した場合、移動先サイトで提供される情報・サービスについて当社は責任を負いません。また、当サイトのコンテンツについては正確性の維持に努めていますが、その内容の正確性・安全性を保証するものではありません。</p>

      <h2>6. プライバシーポリシーの変更</h2>
      <p>当社は、法令の変更やサービス内容の変更に応じて、本ポリシーを予告なく改定することがあります。改定後のポリシーは、当ページに掲載した時点から効力を生じるものとします。</p>

      <p class="policy-date">制定日: 2025年11月1日<br />最終改定日: 2026年7月9日</p>
    </article>
  </div>`;

  return {
    meta: {
      title: `プライバシーポリシー - ${siteConfig.name}`,
      description: `${siteConfig.name}のプライバシーポリシー。入力データの取り扱い、Cookie、Google AdSenseによる広告配信について説明しています。`,
      path: '/privacy',
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
