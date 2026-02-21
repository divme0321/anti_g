export function renderContact() {
    const page = document.createElement('div');
    page.className = 'content-page';
    page.innerHTML = `
    <div class="content-page-inner">
      <h1>Contact Us</h1>

      <section>
        <p>Have a question, feature request, or bug report? We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.</p>
      </section>

      <section>
        <form id="contact-form" class="contact-form">
          <div class="form-group">
            <label for="contact-name">Name</label>
            <input type="text" id="contact-name" placeholder="Your name" required />
          </div>
          <div class="form-group">
            <label for="contact-email">Email</label>
            <input type="text" id="contact-email" placeholder="your@email.com" required />
          </div>
          <div class="form-group">
            <label for="contact-subject">Subject</label>
            <select id="contact-subject">
              <option value="general">General Inquiry</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="contact-message">Message</label>
            <textarea id="contact-message" rows="6" placeholder="Tell us what's on your mind..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg">Send Message</button>
        </form>
        <div id="contact-success" class="contact-success" style="display:none;">
          <div class="success-icon">✓</div>
          <h3>Message Sent!</h3>
          <p>Thank you for reaching out. We'll review your message and get back to you as soon as possible.</p>
        </div>
      </section>

      <section>
        <h2>Other Ways to Reach Us</h2>
        <div class="contact-methods">
          <div class="contact-method">
            <div class="contact-method-icon">📧</div>
            <h3>Email</h3>
            <p>For direct inquiries, you can email us at <strong>devtoolbox.contact@gmail.com</strong></p>
          </div>
          <div class="contact-method">
            <div class="contact-method-icon">💡</div>
            <h3>Feature Requests</h3>
            <p>Have an idea for a new tool? We're always looking to expand our toolkit. Send us your suggestions!</p>
          </div>
          <div class="contact-method">
            <div class="contact-method-icon">🐛</div>
            <h3>Bug Reports</h3>
            <p>Found something broken? Let us know which tool, which browser, and what happened. We'll fix it quickly.</p>
          </div>
        </div>
      </section>
    </div>
  `;

    // Attach form handler after a tick
    setTimeout(() => {
        const form = document.getElementById('contact-form');
        const success = document.getElementById('contact-success');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                form.style.display = 'none';
                success.style.display = 'block';
            });
        }
    }, 0);

    return page;
}
