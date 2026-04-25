export function renderPrivacy() {
    const page = document.createElement('div');
    page.className = 'content-page';
    page.innerHTML = `
    <div class="content-page-inner">
      <div class="language-switch" style="display:flex; gap:1rem; margin-bottom:2rem; font-size:0.9rem;">
        <a href="#privacy-en">English</a> | <a href="#privacy-jp">日本語</a>
      </div>

      <div id="privacy-en">
        <h1>Privacy Policy</h1>
        <p class="content-meta">Last updated: April 25, 2026</p>

        <section>
          <h2>Introduction</h2>
          <p>DevToolBox ("we", "us", or "our") operates the DevToolBox website. This Privacy Policy explains how we collect, use, and protect information when you use our service.</p>
          <p>We are committed to protecting your privacy. All our developer tools run <strong>entirely in your browser</strong> — no data you enter into our tools is ever transmitted to or stored on our servers.</p>
        </section>

        <section>
          <h2>Google AdSense and Cookies</h2>
          <p>We use Google AdSense to serve ads on our website. Google, as a third-party vendor, uses cookies to serve ads on DevToolBox. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to DevToolBox and/or other sites on the Internet.</p>
          <p>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank">Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank">www.aboutads.info</a>.</p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>All data you enter into DevToolBox tools is processed <strong>entirely within your web browser</strong>. This data is never sent to our servers. We may collect standard log information like IP addresses and browser types for security and analytics purposes.</p>
        </section>

        <section>
          <h2>Operator Information</h2>
          <p>This website is operated by <strong>合同会社me (me, limited liability company)</strong>.</p>
          <p>Address: UCF635, 2-2-15 Minamiaoyama, Minato-ku, Tokyo, 107-0052, Japan</p>
        </section>
      </div>

      <hr style="margin: 4rem 0; border: 0; border-top: 1px solid var(--border-color);" />

      <div id="privacy-jp">
        <h1>プライバシーポリシー</h1>
        <p class="content-meta">最終更新日: 2026年4月25日</p>

        <section>
          <h2>はじめに</h2>
          <p>DevToolBox（以下「当サイト」）は、合同会社me（以下「当社」）が運営しています。当サイトが提供するすべての開発者ツールは、<strong>お客様のブラウザ内でのみ動作</strong>し、入力されたデータが当社のサーバーに送信されたり保存されたりすることはありません。</p>
        </section>

        <section>
          <h2>広告の配信について（Googleアドセンス）</h2>
          <p>当サイトでは、第三者配信の広告サービス「Googleアドセンス」を利用しています。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。</p>
          <p>Cookieを無効にする設定およびGoogleアドセンスに関する詳細は「<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank">広告 – ポリシーと規約 – Google</a>」をご覧ください。また、<a href="https://www.google.com/settings/ads" target="_blank">広告設定</a>からパーソナライズ広告を無効にすることができます。</p>
        </section>

        <section>
          <h2>免責事項</h2>
          <p>当サイトのツールの計算結果や出力内容によって生じた損害について、当社は一切の責任を負いません。重要な作業に使用される場合は、必ずご自身で結果を検証してください。</p>
        </section>

        <section>
          <h2>運営者情報</h2>
          <p>運営会社：合同会社me</p>
          <p>所在地：〒107-0052 東京都港区南青山2丁目2-15 UCF635</p>
        </section>
      </div>
    </div>
  `;
    return page;
}
