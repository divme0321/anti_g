export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-brand">
            <span class="logo-icon" style="width:28px;height:28px;font-size:0.7rem;">DT</span>
            <span style="font-weight:700;color:var(--color-heading);">DevToolBox</span>
          </div>
          <p>Free, fast, and private developer tools. All processing happens in your browser — no data is ever sent to a server.</p>
        </div>
        <div class="footer-col">
          <h4>Popular Tools</h4>
          <a href="#/json-formatter">JSON Formatter</a>
          <a href="#/base64">Base64 Encoder</a>
          <a href="#/uuid-generator">UUID Generator</a>
          <a href="#/hash-generator">Hash Generator</a>
          <a href="#/password-generator">Password Generator</a>
        </div>
        <div class="footer-col">
          <h4>More Tools</h4>
          <a href="#/color-converter">Color Converter</a>
          <a href="#/regex-tester">Regex Tester</a>
          <a href="#/css-minifier">CSS Minifier</a>
          <a href="#/timestamp-converter">Timestamp Converter</a>
          <a href="#/diff-checker">Diff Checker</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="#/about">About</a>
          <a href="#/contact">Contact</a>
          <a href="#/privacy">Privacy Policy</a>
          <a href="#/terms">Terms of Service</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} <a href="#/">DevToolBox</a> — Free developer tools, built with ♥</p>
      </div>
    </div>
  `;
  return footer;
}
