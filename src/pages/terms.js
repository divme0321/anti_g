export function renderTerms() {
    const page = document.createElement('div');
    page.className = 'content-page';
    page.innerHTML = `
    <div class="content-page-inner">
      <div class="language-switch" style="display:flex; gap:1rem; margin-bottom:2rem; font-size:0.9rem;">
        <a href="#terms-en">English</a> | <a href="#terms-jp">日本語</a>
      </div>

      <div id="terms-en">
        <h1>Terms of Service</h1>
        <p class="content-meta">Last updated: April 25, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using DevToolBox ("the Service"), you agree to be bound by these Terms of Service. This Service is operated by <strong>合同会社me (me, limited liability company)</strong>.</p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>DevToolBox provides a collection of free, browser-based developer tools. All tools run entirely within your web browser using client-side JavaScript. No data you process is stored on our servers.</p>
        </section>

        <section>
          <h2>3. Intellectual Property</h2>
          <p>The Service design, code, and content are owned by 合同会社me. You may use the outputs of the tools for personal or commercial projects without restriction.</p>
        </section>

        <section>
          <h2>4. Disclaimer</h2>
          <p>The Service is provided "AS IS". 合同会社me makes no warranties regarding the accuracy or reliability of tool results.</p>
        </section>
      </div>

      <hr style="margin: 4rem 0; border: 0; border-top: 1px solid var(--border-color);" />

      <div id="terms-jp">
        <h1>利用規約</h1>
        <p class="content-meta">最終更新日: 2026年4月25日</p>

        <section>
          <h2>1. 規約の適用</h2>
          <p>DevToolBox（以下「当サイト」）を利用することにより、ユーザーは本利用規約に同意したものとみなされます。当サイトは<strong>合同会社me</strong>（以下「当社」）によって運営されています。</p>
        </section>

        <section>
          <h2>2. サービスの内容</h2>
          <p>当サイトは、ブラウザ上で動作する開発者向けツールを無料で提供します。すべての処理はユーザーのデバイス上で行われ、入力データが当社のサーバーに保存されることはありません。</p>
        </section>

        <section>
          <h2>3. 知的財産権</h2>
          <p>当サイトのデザイン、プログラム、コンテンツの著作権は当社に帰属します。ただし、各ツールを使用して生成された成果物については、商用・非商用問わず自由にご利用いただけます。</p>
        </section>

        <section>
          <h2>4. 免責事項</h2>
          <p>当サイトは「現状有姿」で提供されます。当社は、ツールの正確性や特定の目的への適合性について、明示的にも黙示的にも保証しません。利用により生じた損害について、当社は一切の責任を負わないものとします。</p>
        </section>
      </div>
    </div>
  `;
    return page;
}
