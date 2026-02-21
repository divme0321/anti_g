import './styles/index.css';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderHome } from './pages/home.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderTerms } from './pages/terms.js';
import { renderAbout } from './pages/about.js';
import { renderContact } from './pages/contact.js';
import { renderJsonFormatter } from './tools/json-formatter.js';
import { renderBase64 } from './tools/base64.js';
import { renderUuidGenerator } from './tools/uuid-generator.js';
import { renderColorConverter } from './tools/color-converter.js';
import { renderLoremIpsum } from './tools/lorem-ipsum.js';
import { renderMarkdownPreview } from './tools/markdown-preview.js';
import { renderHashGenerator } from './tools/hash-generator.js';
import { renderUrlEncoder } from './tools/url-encoder.js';
import { renderHtmlEntities } from './tools/html-entities.js';
import { renderRegexTester } from './tools/regex-tester.js';
import { renderCssMinifier } from './tools/css-minifier.js';
import { renderTimestampConverter } from './tools/timestamp-converter.js';
import { renderWordCounter } from './tools/word-counter.js';
import { renderDiffChecker } from './tools/diff-checker.js';
import { renderPasswordGenerator } from './tools/password-generator.js';

const routes = {
  '': renderHome,
  'privacy': renderPrivacy,
  'terms': renderTerms,
  'about': renderAbout,
  'contact': renderContact,
  'json-formatter': renderJsonFormatter,
  'base64': renderBase64,
  'uuid-generator': renderUuidGenerator,
  'color-converter': renderColorConverter,
  'lorem-ipsum': renderLoremIpsum,
  'markdown-preview': renderMarkdownPreview,
  'hash-generator': renderHashGenerator,
  'url-encoder': renderUrlEncoder,
  'html-entities': renderHtmlEntities,
  'regex-tester': renderRegexTester,
  'css-minifier': renderCssMinifier,
  'timestamp-converter': renderTimestampConverter,
  'word-counter': renderWordCounter,
  'diff-checker': renderDiffChecker,
  'password-generator': renderPasswordGenerator,
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

  // Scroll to top
  window.scrollTo(0, 0);
}

function updateMeta(route) {
  const titles = {
    '': 'DevToolBox — Free Online Developer Tools',
    'privacy': 'Privacy Policy — DevToolBox',
    'terms': 'Terms of Service — DevToolBox',
    'about': 'About — DevToolBox',
    'contact': 'Contact Us — DevToolBox',
    'json-formatter': 'JSON Formatter & Validator — DevToolBox',
    'base64': 'Base64 Encoder / Decoder — DevToolBox',
    'uuid-generator': 'UUID Generator — DevToolBox',
    'color-converter': 'Color Converter (HEX ↔ RGB ↔ HSL) — DevToolBox',
    'lorem-ipsum': 'Lorem Ipsum Generator — DevToolBox',
    'markdown-preview': 'Markdown Preview — DevToolBox',
    'hash-generator': 'Hash Generator (MD5/SHA-256) — DevToolBox',
    'url-encoder': 'URL Encoder / Decoder — DevToolBox',
    'html-entities': 'HTML Entity Encoder / Decoder — DevToolBox',
    'regex-tester': 'Regex Tester & Debugger — DevToolBox',
    'css-minifier': 'CSS Minifier / Beautifier — DevToolBox',
    'timestamp-converter': 'Unix Timestamp Converter — DevToolBox',
    'word-counter': 'Word Counter & Text Analyzer — DevToolBox',
    'diff-checker': 'Diff Checker — DevToolBox',
    'password-generator': 'Password Generator — DevToolBox',
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
