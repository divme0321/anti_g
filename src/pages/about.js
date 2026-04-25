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
        <p>DevToolBox is a collection of essential developer tools that run entirely in your browser. All processing happens locally on your device — no data ever leaves your browser.</p>
      </section>

      <section>
        <h2>Our Mission</h2>
        <p>We provide high-quality, zero-latency tools for developers who value privacy and speed. By removing the need for server-side processing, we ensure your sensitive data (like API keys or customer records) remains completely secure.</p>
      </section>

      <section>
        <h2>Operator / 運営会社</h2>
        <div class="company-card" style="background: var(--bg-secondary); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-top: 1rem;">
          <h3 style="margin-top:0; color: var(--text-primary);">合同会社me (me, limited liability company)</h3>
          <p style="margin-bottom: 0.5rem;"><strong>Address:</strong> 〒107-0052 東京都港区南青山2丁目2-15 UCF635</p>
          <p style="margin-bottom: 0.5rem;"><strong>Mission:</strong> デジタルの力で、 ビジョンを実現。最新の技術を使用して、高速で応答性の高いウェブアプリケーションを開発します。</p>
          <p style="margin-bottom: 0;"><strong>Website:</strong> <a href="https://div-me.com/" target="_blank">https://div-me.com/</a></p>
        </div>
      </section>

      <section>
        <h2>How It Works</h2>
        <p>DevToolBox is built with modern web technologies (Vanilla JS, Vite, Vercel). Since it's a client-side application:</p>
        <ul>
          <li><strong>Zero Latency:</strong> Immediate results without network delays.</li>
          <li><strong>Privacy by Design:</strong> Your data is never seen by us or any third party.</li>
          <li><strong>Security:</strong> No transmission means no risk of data interception (Man-in-the-Middle).</li>
        </ul>
      </section>
    </div>
  `;
    return page;
}
