export function renderHeader() {
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="header-inner">
      <a class="logo" href="#/" aria-label="DevToolBox Home">
        <span class="logo-icon">DT</span>
        <span>DevToolBox</span>
      </a>
      <nav class="header-nav">
        <div class="nav-dropdown">
          <button class="nav-dropdown-btn">Tools ▾</button>
          <div class="nav-dropdown-menu">
            <a href="#/json-formatter">JSON Formatter</a>
            <a href="#/base64">Base64</a>
            <a href="#/uuid-generator">UUID Generator</a>
            <a href="#/color-converter">Color Converter</a>
            <a href="#/lorem-ipsum">Lorem Ipsum</a>
            <a href="#/markdown-preview">Markdown Preview</a>
            <a href="#/hash-generator">Hash Generator</a>
            <a href="#/url-encoder">URL Encoder</a>
            <a href="#/html-entities">HTML Entities</a>
            <a href="#/regex-tester">Regex Tester</a>
            <a href="#/css-minifier">CSS Minifier</a>
            <a href="#/timestamp-converter">Timestamp</a>
            <a href="#/word-counter">Word Counter</a>
            <a href="#/diff-checker">Diff Checker</a>
            <a href="#/password-generator">Passwords</a>
            <a href="#/qr-code-generator">QR Code</a>
            <a href="#/image-base64">Image Base64</a>
            <a href="#/css-gradient">CSS Gradient</a>
            <a href="#/meta-tag-generator">Meta Tags</a>
            <a href="#/favicon-generator">Favicon</a>
          </div>
        </div>
        <a href="#/about">About</a>
        <a href="#/contact">Contact</a>
      </nav>
      <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
    <div class="mobile-nav" id="mobile-nav">
      <a href="#/json-formatter">JSON Formatter</a>
      <a href="#/base64">Base64</a>
      <a href="#/uuid-generator">UUID Generator</a>
      <a href="#/color-converter">Color Converter</a>
      <a href="#/hash-generator">Hash Generator</a>
      <a href="#/url-encoder">URL Encoder</a>
      <a href="#/regex-tester">Regex Tester</a>
      <a href="#/css-minifier">CSS Minifier</a>
      <a href="#/timestamp-converter">Timestamp</a>
      <a href="#/word-counter">Word Counter</a>
      <a href="#/diff-checker">Diff Checker</a>
      <a href="#/password-generator">Passwords</a>
      <a href="#/qr-code-generator">QR Code Generator</a>
      <a href="#/image-base64">Image ↔ Base64</a>
      <a href="#/css-gradient">CSS Gradient</a>
      <a href="#/meta-tag-generator">Meta Tags</a>
      <a href="#/favicon-generator">Favicon Generator</a>
      <div class="mobile-nav-divider"></div>
      <a href="#/about">About</a>
      <a href="#/contact">Contact</a>
      <a href="#/privacy">Privacy Policy</a>
      <a href="#/terms">Terms of Service</a>
    </div>
  `;

  // Mobile menu toggle
  setTimeout(() => {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('mobile-nav');
    if (btn && nav) {
      btn.addEventListener('click', () => {
        nav.classList.toggle('open');
        btn.textContent = nav.classList.contains('open') ? '✕' : '☰';
      });
      // Close on link click
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          nav.classList.remove('open');
          btn.textContent = '☰';
        });
      });
    }
  }, 0);

  return header;
}
