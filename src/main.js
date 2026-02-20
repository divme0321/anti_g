import './styles/index.css';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderHome } from './pages/home.js';
import { renderJsonFormatter } from './tools/json-formatter.js';
import { renderBase64 } from './tools/base64.js';
import { renderUuidGenerator } from './tools/uuid-generator.js';
import { renderColorConverter } from './tools/color-converter.js';
import { renderLoremIpsum } from './tools/lorem-ipsum.js';
import { renderMarkdownPreview } from './tools/markdown-preview.js';

const routes = {
  '': renderHome,
  'json-formatter': renderJsonFormatter,
  'base64': renderBase64,
  'uuid-generator': renderUuidGenerator,
  'color-converter': renderColorConverter,
  'lorem-ipsum': renderLoremIpsum,
  'markdown-preview': renderMarkdownPreview,
};

function getRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return hash || '';
}

function render() {
  const app = document.getElementById('app');
  const route = getRoute();
  const renderPage = routes[route] || renderHome;

  app.innerHTML = '';
  app.appendChild(renderHeader());

  // Top ad slot
  const adTop = document.createElement('div');
  adTop.className = 'ad-slot';
  adTop.innerHTML = '<div class="ad-slot-inner" id="ad-top"><!-- AdSense ad unit code here --></div>';
  app.appendChild(adTop);

  const main = document.createElement('main');
  main.appendChild(renderPage());
  app.appendChild(main);

  // Bottom ad slot
  const adBottom = document.createElement('div');
  adBottom.className = 'ad-slot';
  adBottom.innerHTML = '<div class="ad-slot-inner" id="ad-bottom"><!-- AdSense ad unit code here --></div>';
  app.appendChild(adBottom);

  app.appendChild(renderFooter());

  // Update page title & meta
  updateMeta(route);
}

function updateMeta(route) {
  const titles = {
    '': 'DevToolBox — Free Online Developer Tools',
    'json-formatter': 'JSON Formatter & Validator — DevToolBox',
    'base64': 'Base64 Encoder / Decoder — DevToolBox',
    'uuid-generator': 'UUID Generator — DevToolBox',
    'color-converter': 'Color Converter (HEX ↔ RGB ↔ HSL) — DevToolBox',
    'lorem-ipsum': 'Lorem Ipsum Generator — DevToolBox',
    'markdown-preview': 'Markdown Preview — DevToolBox',
  };
  document.title = titles[route] || titles[''];
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);

// Toast utility
export function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = type === 'success' ? `✓ ${message}` : `✗ ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Copy utility
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard');
  });
}
