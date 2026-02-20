export function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
    <p>© ${new Date().getFullYear()} <a href="#/">DevToolBox</a> — Free developer tools, built with ♥</p>
    <p style="margin-top: 4px;">Fast, private, no signup required. All processing happens in your browser.</p>
  `;
    return footer;
}
