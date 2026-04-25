import { copyToClipboard, showToast } from '../main.js';

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function renderUuidGenerator() {
    const page = document.createElement('div');
    page.className = 'tool-page';

    const firstUuid = generateUUID();

    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="/">Home</a> <span>/</span> <span>UUID Generator</span>
      </div>
      <h1>UUID Generator</h1>
      <p>Generate random UUID v4 identifiers instantly. Click to copy.</p>
    </div>
    <div class="tool-container single-pane">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Generated UUID</span>
          <div class="pane-actions">
            <button class="btn btn-primary" id="uuid-generate">⟳ New UUID</button>
            <button class="btn btn-secondary" id="uuid-copy-main">Copy</button>
          </div>
        </div>
        <div class="pane-body" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 2rem;">
          <div class="uuid-display" id="uuid-main" title="Click to copy">${firstUuid}</div>
          <div style="display:flex; gap: 1rem; align-items:center; flex-wrap:wrap; justify-content:center;">
            <label style="font-size: 0.8rem; color: var(--color-text-muted);">Bulk generate:</label>
            <input type="number" id="uuid-count" value="5" min="1" max="100" style="width: 80px;" />
            <button class="btn btn-secondary" id="uuid-bulk">Generate</button>
            <button class="btn btn-secondary" id="uuid-copy-all">Copy All</button>
          </div>
          <div class="uuid-list" id="uuid-list"></div>
        </div>
      </div>
    </div>
    <div class="tool-seo-content" style="margin-top: 3rem; padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); font-size: 1rem; line-height: 1.8; color: var(--text-secondary);">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary); font-weight: 700;">What is a UUID (Universally Unique Identifier)?</h2>
      
      <p style="margin-bottom: 1.5rem;">A <strong>UUID (Universally Unique Identifier)</strong>, also known as a GUID (Globally Unique Identifier), is a 128-bit label used for identification in computer systems. The main purpose of a UUID is to enable distributed systems to uniquely identify information without significant central coordination.</p>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Why Version 4 UUIDs?</h3>
      <p style="margin-bottom: 1.5rem;">There are several versions of UUIDs (v1, v3, v4, v5). This tool generates <strong>Version 4 UUIDs</strong>, which are based on random numbers. Out of the 128 bits, 122 bits are generated randomly, meaning there are 2<sup>122</sup> (approximately 5.3 x 10<sup>36</sup>) possible v4 UUIDs. The probability of a collision (generating the same ID twice) is so infinitesimally small that it is considered zero for practical purposes.</p>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Common Use Cases for Developers</h3>
      <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
        <li><strong>Database Primary Keys:</strong> Using UUIDs as keys allows you to generate IDs on the client-side or in distributed environments without checking a central database for the next available integer.</li>
        <li><strong>Session Identifiers:</strong> Securely identifying user sessions in web applications.</li>
        <li><strong>Unique File Names:</strong> Preventing naming conflicts when multiple users upload files to the same storage bucket.</li>
        <li><strong>Transaction IDs:</strong> Tracking specific events or requests across microservices.</li>
      </ul>

      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">The Structure of a UUID</h3>
      <p>A UUID is represented as 32 hexadecimal digits, displayed in five groups separated by hyphens (e.g., <code>8-4-4-4-12</code>). In a v4 UUID, the 13th character is always '4', and the 17th character is always one of '8', '9', 'a', or 'b' (representing the variant).</p>
    </div>
  `;

    setTimeout(() => {
        const mainDisplay = document.getElementById('uuid-main');
        const list = document.getElementById('uuid-list');

        function newUuid() {
            const uuid = generateUUID();
            mainDisplay.textContent = uuid;
            mainDisplay.style.animation = 'none';
            mainDisplay.offsetHeight; // trigger reflow
            mainDisplay.style.animation = 'fadeIn 0.3s ease';
        }

        mainDisplay.addEventListener('click', () => {
            copyToClipboard(mainDisplay.textContent);
        });

        document.getElementById('uuid-generate').addEventListener('click', newUuid);

        document.getElementById('uuid-copy-main').addEventListener('click', () => {
            copyToClipboard(mainDisplay.textContent);
        });

        document.getElementById('uuid-bulk').addEventListener('click', () => {
            const count = Math.min(100, Math.max(1, +document.getElementById('uuid-count').value || 5));
            list.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const uuid = generateUUID();
                const item = document.createElement('div');
                item.className = 'uuid-item';
                item.innerHTML = `
          <span>${uuid}</span>
          <button class="btn-icon" title="Copy" data-uuid="${uuid}">📋</button>
        `;
                item.querySelector('button').addEventListener('click', (e) => {
                    copyToClipboard(e.currentTarget.dataset.uuid);
                });
                list.appendChild(item);
            }
            showToast(`Generated ${count} UUIDs`);
        });

        document.getElementById('uuid-copy-all').addEventListener('click', () => {
            const items = list.querySelectorAll('.uuid-item span');
            if (items.length === 0) { showToast('Generate UUIDs first', 'error'); return; }
            const all = Array.from(items).map(el => el.textContent).join('\n');
            copyToClipboard(all);
        });
    }, 0);

    return page;
}
