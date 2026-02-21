export function renderAbout() {
    const page = document.createElement('div');
    page.className = 'content-page';
    page.innerHTML = `
    <div class="content-page-inner">
      <h1>About DevToolBox</h1>

      <section class="about-hero-section">
        <div class="about-tagline">
          <span class="gradient-text">Fast, Free, and Private</span> Developer Tools
        </div>
        <p>DevToolBox is a collection of essential developer tools that run entirely in your browser. No data ever leaves your device — everything is processed client-side using JavaScript.</p>
      </section>

      <section>
        <h2>Our Mission</h2>
        <p>We believe developer tools should be:</p>
        <div class="about-values">
          <div class="about-value-card">
            <div class="about-value-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>No server round-trips, no loading spinners. Every tool runs instantly in your browser with zero latency.</p>
          </div>
          <div class="about-value-card">
            <div class="about-value-icon">🔒</div>
            <h3>Completely Private</h3>
            <p>Your data never leaves your device. No server-side processing means zero risk of data exposure.</p>
          </div>
          <div class="about-value-card">
            <div class="about-value-icon">🎯</div>
            <h3>No Distractions</h3>
            <p>No mandatory sign-ups, no paywalls, no popups. Just open a tool and start working immediately.</p>
          </div>
          <div class="about-value-card">
            <div class="about-value-icon">🎨</div>
            <h3>Beautiful Design</h3>
            <p>Carefully crafted UI that's a pleasure to use. Because developer tools don't have to look boring.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>What We Offer</h2>
        <p>DevToolBox provides a growing suite of tools for developers, designers, and tech professionals:</p>
        <ul>
          <li><strong>Data Formatting:</strong> JSON Formatter & Validator, CSS Minifier, HTML Entity Encoder</li>
          <li><strong>Encoding & Decoding:</strong> Base64 Encoder/Decoder, URL Encoder/Decoder</li>
          <li><strong>Generators:</strong> UUID Generator, Lorem Ipsum Generator, Password Generator, Hash Generator</li>
          <li><strong>Converters:</strong> Color Converter (HEX/RGB/HSL), Timestamp Converter</li>
          <li><strong>Text Tools:</strong> Markdown Preview, Word Counter, Diff Checker, Regex Tester</li>
        </ul>
        <p>We're constantly adding new tools. If you have a suggestion, feel free to reach out via our <a href="#/contact">Contact page</a>.</p>
      </section>

      <section>
        <h2>How It Works</h2>
        <p>DevToolBox is built as a single-page application using modern JavaScript. All tool logic runs in your browser via client-side JavaScript — no backend servers are involved in processing your data. This architecture provides several benefits:</p>
        <ul>
          <li><strong>Speed:</strong> Tools respond instantly without waiting for network requests</li>
          <li><strong>Privacy:</strong> Your sensitive data (API keys, private JSON, passwords) stays on your device</li>
          <li><strong>Reliability:</strong> Tools work even with a poor internet connection (once the page is loaded)</li>
          <li><strong>Security:</strong> No data transmission means no interception risk</li>
        </ul>
      </section>

      <section>
        <h2>Technology Stack</h2>
        <p>DevToolBox is built with a focus on performance and simplicity:</p>
        <ul>
          <li><strong>Vanilla JavaScript</strong> — No heavy frameworks, resulting in fast load times</li>
          <li><strong>Vite</strong> — Modern build tool for optimized production bundles</li>
          <li><strong>Custom CSS</strong> — Hand-crafted design system with dark mode aesthetics</li>
          <li><strong>Vercel</strong> — Global edge deployment for low-latency access worldwide</li>
        </ul>
      </section>

      <section>
        <h2>FAQ</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3>Is DevToolBox really free?</h3>
            <p>Yes, completely free. We sustain the project through non-intrusive advertising. All tools are fully functional with no premium tiers or feature locks.</p>
          </div>
          <div class="faq-item">
            <h3>Is my data safe?</h3>
            <p>Absolutely. All processing happens in your browser. We never see, store, or transmit the data you enter into any tool. You can verify this by checking your browser's Network tab — no data is sent to our servers.</p>
          </div>
          <div class="faq-item">
            <h3>Do I need to create an account?</h3>
            <p>No. DevToolBox works instantly with no registration, login, or account creation required.</p>
          </div>
          <div class="faq-item">
            <h3>Can I use DevToolBox for commercial projects?</h3>
            <p>Yes. You can use any output generated by our tools for personal, educational, or commercial purposes without restriction.</p>
          </div>
          <div class="faq-item">
            <h3>What browsers are supported?</h3>
            <p>DevToolBox works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.</p>
          </div>
          <div class="faq-item">
            <h3>How can I report a bug or suggest a feature?</h3>
            <p>Please visit our <a href="#/contact">Contact page</a> to send us a message. We appreciate all feedback!</p>
          </div>
        </div>
      </section>
    </div>
  `;
    return page;
}
