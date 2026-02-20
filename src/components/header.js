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
        <a href="#/json-formatter">JSON</a>
        <a href="#/base64">Base64</a>
        <a href="#/uuid-generator">UUID</a>
        <a href="#/color-converter">Color</a>
        <a href="#/lorem-ipsum">Lorem</a>
        <a href="#/markdown-preview">Markdown</a>
      </nav>
    </div>
  `;
    return header;
}
