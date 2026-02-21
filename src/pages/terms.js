export function renderTerms() {
    const page = document.createElement('div');
    page.className = 'content-page';
    page.innerHTML = `
    <div class="content-page-inner">
      <h1>Terms of Service</h1>
      <p class="content-meta">Last updated: February 21, 2026</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using DevToolBox ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.</p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>DevToolBox provides a collection of free, browser-based developer tools, including but not limited to: JSON formatting, Base64 encoding/decoding, UUID generation, color conversion, and other text/data processing utilities. All tools run entirely within your web browser using client-side JavaScript.</p>
      </section>

      <section>
        <h2>3. Use of the Service</h2>
        <h3>3.1 Permitted Use</h3>
        <p>You may use DevToolBox for any lawful purpose, including personal, educational, and commercial use. The tools are provided free of charge with no registration required.</p>

        <h3>3.2 Prohibited Use</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any illegal or unauthorized purpose</li>
          <li>Attempt to interfere with, compromise, or disrupt the Service</li>
          <li>Use automated scripts to access the Service in a way that burdens the infrastructure</li>
          <li>Reverse engineer or attempt to extract the source code of the Service (beyond what is publicly available)</li>
          <li>Use the Service to distribute malware, spam, or harmful content</li>
          <li>Misrepresent your identity or affiliation with any person or organization</li>
        </ul>
      </section>

      <section>
        <h2>4. Intellectual Property</h2>
        <p>The DevToolBox website, including its design, code, graphics, logos, and content, is the property of DevToolBox and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without explicit permission.</p>
        <p>Data you process through our tools remains entirely your property. Since all processing occurs client-side, we never have access to or claim any rights over your data.</p>
      </section>

      <section>
        <h2>5. Disclaimer of Warranties</h2>
        <p>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:</p>
        <ul>
          <li>Implied warranties of merchantability or fitness for a particular purpose</li>
          <li>Accuracy, reliability, or completeness of results produced by any tool</li>
          <li>Uninterrupted or error-free operation of the Service</li>
        </ul>
        <p>You use the tools at your own risk. While we strive for accuracy, you should always verify critical results independently.</p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, DevToolBox and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, arising from your use of the Service.</p>
        <p>Our total liability for any claim arising from the use of the Service shall not exceed the amount of $0, as the Service is provided free of charge.</p>
      </section>

      <section>
        <h2>7. Third-Party Content and Advertisements</h2>
        <p>The Service may display advertisements provided by third parties, including Google AdSense. We are not responsible for the content of these advertisements or the products/services they promote. Your interactions with advertisers are solely between you and the advertiser.</p>
      </section>

      <section>
        <h2>8. Modifications to the Service</h2>
        <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice. We may also update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
      </section>

      <section>
        <h2>9. Privacy</h2>
        <p>Your use of the Service is also governed by our <a href="#/privacy">Privacy Policy</a>, which describes how we handle information collected through the Service.</p>
      </section>

      <section>
        <h2>10. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>If you have any questions about these Terms, please visit our <a href="#/contact">Contact page</a>.</p>
      </section>
    </div>
  `;
    return page;
}
