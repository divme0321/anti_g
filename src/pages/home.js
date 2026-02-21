import { createToolCard } from '../components/tool-card.js';

const tools = [
  {
    id: 'json-formatter',
    icon: '{ }',
    title: 'JSON Formatter & Validator',
    description: 'Format, validate, and minify your JSON data with syntax highlighting and error detection.',
  },
  {
    id: 'base64',
    icon: '⇄',
    title: 'Base64 Encoder / Decoder',
    description: 'Encode text to Base64 or decode Base64 strings back to plain text instantly.',
  },
  {
    id: 'uuid-generator',
    icon: '#',
    title: 'UUID Generator',
    description: 'Generate random UUID v4 identifiers. Generate single or bulk UUIDs with one click.',
  },
  {
    id: 'color-converter',
    icon: '🎨',
    title: 'Color Converter',
    description: 'Convert colors between HEX, RGB, and HSL formats with a live color preview.',
  },
  {
    id: 'lorem-ipsum',
    icon: '¶',
    title: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text in paragraphs, sentences, or words for your designs.',
  },
  {
    id: 'markdown-preview',
    icon: 'M↓',
    title: 'Markdown Preview',
    description: 'Write Markdown and see a beautiful, real-time rendered preview side by side.',
  },
  {
    id: 'hash-generator',
    icon: '🔐',
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from any text input instantly.',
  },
  {
    id: 'url-encoder',
    icon: '%',
    title: 'URL Encoder / Decoder',
    description: 'Encode special characters for safe URL usage, or decode URL-encoded strings.',
  },
  {
    id: 'html-entities',
    icon: '&;',
    title: 'HTML Entity Encoder',
    description: 'Convert special characters to HTML entities and decode them back safely.',
  },
  {
    id: 'regex-tester',
    icon: '.*',
    title: 'Regex Tester',
    description: 'Test regular expressions with real-time match highlighting and capture group display.',
  },
  {
    id: 'css-minifier',
    icon: '{}',
    title: 'CSS Minifier',
    description: 'Minify CSS for production or beautify minified CSS for readability. See size savings.',
  },
  {
    id: 'timestamp-converter',
    icon: '🕐',
    title: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates with live clock display.',
  },
  {
    id: 'word-counter',
    icon: 'Aa',
    title: 'Word Counter',
    description: 'Count words, characters, sentences, paragraphs, and estimate reading time.',
  },
  {
    id: 'diff-checker',
    icon: '±',
    title: 'Diff Checker',
    description: 'Compare two texts side by side and see differences highlighted with added/removed lines.',
  },
  {
    id: 'password-generator',
    icon: '🔑',
    title: 'Password Generator',
    description: 'Generate cryptographically secure random passwords with customizable options.',
  },
];

export function renderHome() {
  const page = document.createElement('div');

  // Hero
  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.innerHTML = `
    <div class="hero-badge">⚡ 100% Free &amp; Open Source</div>
    <h1>Developer Tools<br/><span class="gradient-text">That Just Work</span></h1>
    <p>Fast, beautiful, and private. All tools run entirely in your browser — no data is ever sent to a server.</p>
    <div class="hero-stats">
      <div class="hero-stat">
        <div class="hero-stat-value">${tools.length}</div>
        <div class="hero-stat-label">Tools Available</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">0ms</div>
        <div class="hero-stat-label">Server Latency</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">100%</div>
        <div class="hero-stat-label">Client-Side</div>
      </div>
    </div>
  `;
  page.appendChild(hero);

  // Tool grid
  const section = document.createElement('section');
  section.className = 'tool-grid-section';
  section.innerHTML = '<h2 class="section-title">All Tools</h2>';

  const grid = document.createElement('div');
  grid.className = 'tool-grid';
  tools.forEach(tool => grid.appendChild(createToolCard(tool)));
  section.appendChild(grid);
  page.appendChild(section);

  // Why DevToolBox section (SEO content)
  const whySection = document.createElement('section');
  whySection.className = 'why-section';
  whySection.innerHTML = `
    <div class="why-inner">
      <h2>Why Choose DevToolBox?</h2>
      <div class="why-grid">
        <div class="why-card">
          <div class="why-icon">🔒</div>
          <h3>100% Private</h3>
          <p>All tools process data entirely in your browser. Nothing is ever uploaded to our servers. Your API keys, JSON data, and passwords stay completely private.</p>
        </div>
        <div class="why-card">
          <div class="why-icon">⚡</div>
          <h3>Instant Results</h3>
          <p>No server round-trips means zero latency. Every tool responds instantly, making your workflow faster and more efficient.</p>
        </div>
        <div class="why-card">
          <div class="why-icon">🎯</div>
          <h3>No Sign-Up Required</h3>
          <p>Jump straight to using any tool. No email required, no account creation, no paywalls. Just open and start working.</p>
        </div>
        <div class="why-card">
          <div class="why-icon">📱</div>
          <h3>Works Everywhere</h3>
          <p>Responsive design works on desktops, tablets, and mobile devices. All modern browsers are fully supported.</p>
        </div>
      </div>
    </div>
  `;
  page.appendChild(whySection);

  return page;
}
