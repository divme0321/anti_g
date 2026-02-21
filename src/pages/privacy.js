export function renderPrivacy() {
    const page = document.createElement('div');
    page.className = 'content-page';
    page.innerHTML = `
    <div class="content-page-inner">
      <h1>Privacy Policy</h1>
      <p class="content-meta">Last updated: February 21, 2026</p>

      <section>
        <h2>Introduction</h2>
        <p>DevToolBox ("we", "us", or "our") operates the DevToolBox website. This Privacy Policy explains how we collect, use, and protect information when you use our service.</p>
        <p>We are committed to protecting your privacy. All our developer tools run <strong>entirely in your browser</strong> — no data you enter into our tools is ever transmitted to or stored on our servers.</p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <h3>Data You Enter Into Tools</h3>
        <p>All data you enter into DevToolBox tools (such as JSON data, text, colors, etc.) is processed <strong>entirely within your web browser using client-side JavaScript</strong>. This data is never sent to our servers, stored in any database, or shared with any third party. When you close or navigate away from a tool, the data is discarded.</p>

        <h3>Automatically Collected Information</h3>
        <p>Like most websites, our web servers may automatically collect certain standard information, including:</p>
        <ul>
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Referring website</li>
          <li>Pages visited and time spent</li>
          <li>Date and time of access</li>
        </ul>
        <p>This information is used solely for maintaining the security and performance of our service and for aggregate analytics (e.g., understanding overall traffic patterns).</p>
      </section>

      <section>
        <h2>Cookies and Tracking Technologies</h2>
        <h3>Essential Cookies</h3>
        <p>We may use essential cookies that are necessary for the basic functionality of our website, such as remembering user preferences (e.g., theme settings).</p>

        <h3>Third-Party Advertising (Google AdSense)</h3>
        <p>We use Google AdSense to display advertisements. Google AdSense may use cookies and similar technologies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.</p>
        <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. Alternatively, you can opt out of third-party vendor cookies by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>.</p>

        <h3>Analytics</h3>
        <p>We may use third-party analytics services (such as Google Analytics) to help us understand how users interact with our website. These services may collect information about your use of our website, including your IP address, which is transmitted to and stored by the analytics provider.</p>
      </section>

      <section>
        <h2>How We Use Information</h2>
        <p>We use the automatically collected information to:</p>
        <ul>
          <li>Maintain and improve our website's performance and security</li>
          <li>Understand usage patterns to improve our tools and user experience</li>
          <li>Display relevant advertisements through Google AdSense</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>Data Sharing and Disclosure</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except as described below:</p>
        <ul>
          <li><strong>Advertising Partners:</strong> Google AdSense and its partners may collect data as described in the Cookies section above.</li>
          <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid legal requests.</li>
        </ul>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>We implement reasonable security measures to protect against unauthorized access, alteration, disclosure, or destruction of information. Since tool data is processed entirely client-side, there is no server-side data storage risk for your tool inputs.</p>
      </section>

      <section>
        <h2>Children's Privacy</h2>
        <p>Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us so we can promptly delete it.</p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul>
          <li>The right to access your personal data</li>
          <li>The right to request correction of inaccurate data</li>
          <li>The right to request deletion of your data</li>
          <li>The right to opt out of targeted advertising</li>
        </ul>
      </section>

      <section>
        <h2>Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date. We encourage you to review this page periodically.</p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>If you have any questions or concerns about this Privacy Policy, please visit our <a href="#/contact">Contact page</a>.</p>
      </section>
    </div>
  `;
    return page;
}
