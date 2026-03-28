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
import { renderQrCodeGenerator } from './tools/qr-code-generator.js';
import { renderImageBase64 } from './tools/image-base64.js';
import { renderCssGradient } from './tools/css-gradient.js';
import { renderMetaTagGenerator } from './tools/meta-tag-generator.js';
import { renderFaviconGenerator } from './tools/favicon-generator.js';

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
  'qr-code-generator': renderQrCodeGenerator,
  'image-base64': renderImageBase64,
  'css-gradient': renderCssGradient,
  'meta-tag-generator': renderMetaTagGenerator,
  'favicon-generator': renderFaviconGenerator,
};

function getRoute() {
  const path = window.location.pathname.replace(/^\//, '');
  return path || '';
}

function render() {
  const app = document.getElementById('app');
  const route = getRoute();
  const renderPage = routes[route] || renderHome;

  app.innerHTML = '';
  app.appendChild(renderHeader());

  const main = document.createElement('main');
  main.appendChild(renderPage());
  app.appendChild(main);

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
    'qr-code-generator': 'QR Code Generator — DevToolBox',
    'image-base64': 'Image ↔ Base64 Converter — DevToolBox',
    'css-gradient': 'CSS Gradient Generator — DevToolBox',
    'meta-tag-generator': 'Meta Tag Generator — DevToolBox',
    'favicon-generator': 'Favicon Generator — DevToolBox',
  };

  const descriptions = {
    '': 'Free, fast, and private online developer tools. JSON formatter, Base64 encoder, UUID generator, regex tester, and 16 more tools. No signup required. All processing in your browser.',
    'privacy': 'Privacy Policy for DevToolBox. Learn how we handle your data. All tool processing happens in your browser — nothing is ever sent to our servers.',
    'terms': 'Terms of Service for DevToolBox. Read the terms governing your use of our free online developer tools.',
    'about': 'About DevToolBox — a free collection of fast, private, browser-based developer tools. No ads, no tracking, no signup required.',
    'contact': 'Contact DevToolBox. Send us feedback, bug reports, or feature requests. We read every message.',
    'json-formatter': 'Free online JSON formatter and validator. Paste JSON to instantly format, beautify, minify, and validate. Syntax highlighting and error detection. No signup required.',
    'base64': 'Free online Base64 encoder and decoder. Convert text to Base64 or decode Base64 strings back to plain text instantly. Supports UTF-8. No data sent to server.',
    'uuid-generator': 'Free online UUID v4 generator. Generate single or bulk UUIDs instantly. Copy to clipboard with one click. Cryptographically random. No signup required.',
    'color-converter': 'Free online color converter. Convert between HEX, RGB, and HSL formats with a live color preview. Pick colors visually and copy CSS values instantly.',
    'lorem-ipsum': 'Free online Lorem Ipsum generator. Generate placeholder text by paragraphs, sentences, or words. Customize length for your design mockups.',
    'markdown-preview': 'Free online Markdown editor with live preview. Write Markdown and see rendered HTML in real time. Supports GFM, tables, and code blocks.',
    'hash-generator': 'Free online hash generator. Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text. Instant results, no data sent to server.',
    'url-encoder': 'Free online URL encoder and decoder. Encode special characters for safe URL usage or decode percent-encoded strings. Handles query strings and full URLs.',
    'html-entities': 'Free online HTML entity encoder and decoder. Convert special characters to HTML entities and decode them back. Supports named, numeric, and full non-ASCII encoding.',
    'regex-tester': 'Free online regex tester and debugger. Test regular expressions with real-time match highlighting and capture group display. Supports all JS regex flags.',
    'css-minifier': 'Free online CSS minifier and beautifier. Minify CSS for production or beautify minified CSS for readability. See exact size savings instantly.',
    'timestamp-converter': 'Free online Unix timestamp converter. Convert Unix timestamps to human-readable dates and back. Supports seconds and milliseconds. Includes live clock.',
    'word-counter': 'Free online word counter and text analyzer. Count words, characters, sentences, paragraphs, and estimate reading time. Paste any text for instant results.',
    'diff-checker': 'Free online diff checker. Compare two texts side by side and see differences highlighted with added and removed lines. Instant results in your browser.',
    'password-generator': 'Free online password generator. Generate cryptographically secure random passwords with custom length, uppercase, numbers, and symbols.',
    'qr-code-generator': 'Free online QR code generator. Create QR codes for URLs, text, email, and phone numbers. Download as PNG or SVG. No signup required.',
    'image-base64': 'Free online image to Base64 converter. Convert images to Base64 data URIs or decode Base64 strings back to images. Supports PNG, JPEG, GIF, and WebP.',
    'css-gradient': 'Free online CSS gradient generator. Create beautiful linear, radial, and conic gradients with a visual editor. Copy the CSS code instantly.',
    'meta-tag-generator': 'Free online meta tag generator. Generate SEO meta tags, Open Graph tags, and Twitter Cards with a live Google and social media preview.',
    'favicon-generator': 'Free online favicon generator. Create favicons from emoji or text. Download in all required sizes for web, iOS, and Android. No design skills needed.',
  };

  document.title = titles[route] || titles[''];

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', descriptions[route] || descriptions['']);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', descriptions[route] || descriptions['']);

  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', titles[route] || titles['']);

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', `https://devtoolbox.link${window.location.pathname}`);
  }
}

window.addEventListener('popstate', render);
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
