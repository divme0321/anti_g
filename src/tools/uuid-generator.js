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
        <a href="#/">Home</a> <span>/</span> <span>UUID Generator</span>
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
