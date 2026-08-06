// ヘッダー・フッターのHTMLテンプレート（文字列生成のみ・DOM非依存）
// ビルド時の静的生成とクライアント描画の両方から使われる。
import { siteConfig } from '../site-config.js';
import { tools, categories, toolsByCategory } from '../content/tools/index.js';

export function headerHTML() {
  const dropdownItems = categories
    .map((cat) => {
      const items = toolsByCategory(cat.id)
        .map((t) => `<a href="/${t.slug}/">${t.icon} ${t.name}</a>`)
        .join('');
      return `<div class="nav-dropdown-group"><span class="nav-dropdown-label">${cat.label}</span>${items}</div>`;
    })
    .join('');

  return `
  <header class="header">
    <div class="header-inner">
      <a class="logo" href="/" aria-label="${siteConfig.name} ホーム">
        <span class="logo-icon" aria-hidden="true">DT</span>
        <span class="logo-text">${siteConfig.name}</span>
      </a>
      <nav class="header-nav" aria-label="メインナビゲーション">
        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" type="button" aria-expanded="false">ツール一覧 <span aria-hidden="true">▾</span></button>
          <div class="nav-dropdown-menu">${dropdownItems}</div>
        </div>
        <a href="/blog/">ブログ</a>
        <a href="/about/">運営者情報</a>
      </nav>
      <div class="header-actions">
        <button class="theme-toggle" id="theme-toggle" type="button" aria-label="テーマ切り替え" title="ライト/ダーク切り替え"><span class="theme-icon-light" aria-hidden="true">☀️</span><span class="theme-icon-dark" aria-hidden="true">🌙</span></button>
        <button class="mobile-menu-btn" id="mobile-menu-btn" type="button" aria-label="メニュー">☰</button>
      </div>
    </div>
    <div class="mobile-nav" id="mobile-nav">
      ${tools.map((t) => `<a href="/${t.slug}/">${t.icon} ${t.name}</a>`).join('')}
      <div class="mobile-nav-divider"></div>
      <a href="/blog/">ブログ</a>
      <a href="/about/">運営者情報</a>
      <a href="/contact/">お問い合わせ</a>
      <a href="/privacy/">プライバシーポリシー</a>
      <a href="/terms/">利用規約</a>
    </div>
  </header>`;
}

export function footerHTML() {
  const popular = ['json-formatter', 'base64', 'regex-tester', 'qr-code-generator', 'password-generator', 'timestamp-converter'];
  const popularLinks = tools
    .filter((t) => popular.includes(t.slug))
    .map((t) => `<a href="/${t.slug}/">${t.name}</a>`)
    .join('');

  return `
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-col footer-col-brand">
          <div class="footer-brand">
            <span class="logo-icon" aria-hidden="true">DT</span>
            <span class="footer-brand-name">${siteConfig.name}</span>
          </div>
          <p>${siteConfig.tagline}。すべての処理はブラウザ内で完結し、入力データがサーバーへ送信されることはありません。</p>
          <div class="footer-operator">
            <p><strong>運営:</strong> ${siteConfig.operator.name}</p>
            <p>${siteConfig.operator.address}</p>
          </div>
        </div>
        <div class="footer-col">
          <h4>人気のツール</h4>
          ${popularLinks}
        </div>
        <div class="footer-col">
          <h4>コンテンツ</h4>
          <a href="/">ツール一覧</a>
          <a href="/blog/">技術ブログ</a>
          <a href="/about/">運営者情報</a>
          <a href="/contact/">お問い合わせ</a>
        </div>
        <div class="footer-col">
          <h4>規約・ポリシー</h4>
          <a href="/privacy/">プライバシーポリシー</a>
          <a href="/terms/">利用規約</a>
          <a href="${siteConfig.operator.site}" target="_blank" rel="noopener">運営会社サイト</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} <a href="/">${siteConfig.name}</a> — ${siteConfig.operator.name}</p>
      </div>
    </div>
  </footer>`;
}
