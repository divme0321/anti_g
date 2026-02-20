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

    return page;
}
