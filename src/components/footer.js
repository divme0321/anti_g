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
          <div class="footer-operator" style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--color-text-dim);">
            <p style="margin-bottom: 0.25rem;"><strong>Operator:</strong> 合同会社me</p>
            <p style="margin-bottom: 0;">〒107-0052 東京都港区南青山2丁目2-15 UCF635</p>
          </div>
        </div>
        <div class="footer-col">
          <h4>Popular Tools</h4>
          <a href="/json-formatter">JSON Formatter</a>
          <a href="/base64">Base64 Encoder</a>
          <a href="/uuid-generator">UUID Generator</a>
          <a href="/hash-generator">Hash Generator</a>
          <a href="/password-generator">Password Generator</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
        </div>
        <div class="footer-col">
          <h4>Links</h4>
          <a href="https://div-me.com/" target="_blank">Corporate Site</a>
          <a href="/color-converter">Color Converter</a>
          <a href="/regex-tester">Regex Tester</a>
          <a href="/timestamp-converter">Timestamp Converter</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} <a href="/">DevToolBox</a> by 合同会社me — Built with ♥</p>
      </div>
    </div>
  `;

  footer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        history.pushState(null, '', href);
        window.dispatchEvent(new Event('popstate'));
      }
    });
  });

  return footer;
}
