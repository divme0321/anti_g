import { copyToClipboard } from '../main.js';

export function renderJwtDecoder() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="/">Home</a> <span>›</span> <span>JWT Decoder</span>
      </div>
      <h1>JWT Decoder</h1>
      <p>Decode JSON Web Tokens (JWT) to inspect their header and payload securely in your browser.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Encoded Token</span>
        </div>
        <div class="pane-body">
          <textarea id="jwt-input" class="tool-textarea" placeholder="Paste your JWT here... (e.g. eyJhbGciOiJIUzI1NiIsInR...)" style="height:300px;font-family:var(--font-mono);"></textarea>
          <div id="jwt-error" style="color:var(--color-error);margin-top:10px;display:none;font-size:0.9rem;">Invalid JWT format</div>
        </div>
      </div>
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Decoded Output</span>
        </div>
        <div class="pane-body" style="display:flex;flex-direction:column;gap:15px;overflow-y:auto;">
          <div>
            <h3 style="font-size:0.9rem;color:var(--color-text-muted);margin-bottom:8px;">Header (Algorithm & Type)</h3>
            <pre id="jwt-header" class="code-output" style="min-height:80px;"></pre>
          </div>
          <div>
            <h3 style="font-size:0.9rem;color:var(--color-text-muted);margin-bottom:8px;">Payload (Data)</h3>
            <pre id="jwt-payload" class="code-output" style="min-height:200px;"></pre>
          </div>
        </div>
      </div>
    </div>
    <div class="tool-seo-content" style="margin-top: 3rem; padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); font-size: 1rem; line-height: 1.8; color: var(--text-secondary);">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary); font-weight: 700;">What is a JWT Decoder?</h2>
      <p style="margin-bottom: 1.5rem;">JSON Web Tokens (JWT) are an open, industry-standard (RFC 7519) method for representing claims securely between two parties. Our JWT Decoder allows you to inspect the header and payload of any JWT without needing to write a script or rely on insecure third-party servers.</p>
      <p style="margin-bottom: 1.5rem;">Decoding JWTs is an essential step when debugging authentication, verifying role-based access control (RBAC), or inspecting OAuth token expiration times.</p>
      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Safe & Private</h3>
      <p>All processing in this tool is done securely within your browser using client-side JavaScript. Your tokens—which often contain sensitive user information or temporary access credentials—are never sent to a server or logged.</p>
    </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('jwt-input');
        const headerOut = document.getElementById('jwt-header');
        const payloadOut = document.getElementById('jwt-payload');
        const errorOut = document.getElementById('jwt-error');

        function decodeBase64Url(str) {
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            while (str.length % 4) {
                str += '=';
            }
            const decoded = atob(str);
            try {
                return decodeURIComponent(decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            } catch (e) {
                return decoded;
            }
        }

        input.addEventListener('input', () => {
            const token = input.value.trim();
            if (!token) {
                headerOut.textContent = '';
                payloadOut.textContent = '';
                errorOut.style.display = 'none';
                return;
            }

            const parts = token.split('.');
            if (parts.length !== 3) {
                headerOut.textContent = '';
                payloadOut.textContent = '';
                errorOut.style.display = 'block';
                return;
            }

            try {
                const header = JSON.parse(decodeBase64Url(parts[0]));
                const payload = JSON.parse(decodeBase64Url(parts[1]));
                
                headerOut.textContent = JSON.stringify(header, null, 2);
                payloadOut.textContent = JSON.stringify(payload, null, 2);
                errorOut.style.display = 'none';
            } catch (e) {
                headerOut.textContent = '';
                payloadOut.textContent = '';
                errorOut.style.display = 'block';
            }
        });
    }, 0);

    return page;
}
