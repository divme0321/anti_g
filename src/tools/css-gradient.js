import { showToast, copyToClipboard } from '../main.js';

export function renderCssGradient() {
    const page = document.createElement('div');
    page.className = 'tool-page';

    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>CSS Gradient Generator</span>
      </div>
      <h1>CSS Gradient Generator</h1>
      <p>Create beautiful CSS gradients with a visual editor. Copy the CSS code directly into your project.</p>
    </div>
    <div class="tool-container">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Settings</span>
        </div>
        <div class="pane-body">
          <div class="qr-settings">
            <div class="qr-form-group">
              <label for="grad-type">Gradient Type</label>
              <select id="grad-type">
                <option value="linear">Linear Gradient</option>
                <option value="radial">Radial Gradient</option>
                <option value="conic">Conic Gradient</option>
              </select>
            </div>

            <div id="grad-linear-opts">
              <div class="qr-form-group">
                <label for="grad-angle">Angle: <span id="grad-angle-val">135</span>°</label>
                <input type="range" id="grad-angle" min="0" max="360" value="135" class="grad-range" />
              </div>
              <div class="grad-direction-grid" id="grad-direction-grid">
                <button data-angle="315" title="↖">↖</button>
                <button data-angle="0" title="↑">↑</button>
                <button data-angle="45" title="↗">↗</button>
                <button data-angle="270" title="←">←</button>
                <button data-angle="" title="•" class="grad-dir-center">•</button>
                <button data-angle="90" title="→">→</button>
                <button data-angle="225" title="↙">↙</button>
                <button data-angle="180" title="↓">↓</button>
                <button data-angle="135" title="↘" class="active">↘</button>
              </div>
            </div>

            <div id="grad-radial-opts" style="display:none">
              <div class="qr-form-group">
                <label for="grad-shape">Shape</label>
                <select id="grad-shape">
                  <option value="circle">Circle</option>
                  <option value="ellipse">Ellipse</option>
                </select>
              </div>
            </div>

            <div class="qr-form-group" style="margin-top: var(--space-lg)">
              <label>Color Stops</label>
              <div id="grad-stops"></div>
              <button class="btn btn-secondary" id="grad-add-stop" style="margin-top: var(--space-sm)">+ Add Color Stop</button>
            </div>

            <div class="qr-form-group" style="margin-top: var(--space-lg)">
              <label>Presets</label>
              <div class="grad-presets" id="grad-presets"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Preview & Code</span>
          <div class="pane-actions">
            <button class="btn btn-primary" id="grad-copy-css">📋 Copy CSS</button>
          </div>
        </div>
        <div class="pane-body">
          <div id="grad-preview" class="grad-preview"></div>
          <div class="grad-code-block">
            <pre><code id="grad-css-output"></code></pre>
          </div>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => {
        const presets = [
            { name: 'Sunset', colors: ['#ff6b6b', '#feca57', '#ff9ff3'] },
            { name: 'Ocean', colors: ['#0652DD', '#1289A7', '#38ada9'] },
            { name: 'Purple Dream', colors: ['#6366f1', '#a855f7', '#ec4899'] },
            { name: 'Forest', colors: ['#0f9b0f', '#00d2d3', '#01a3a4'] },
            { name: 'Dark Mode', colors: ['#0b0d17', '#1a1a2e', '#16213e'] },
            { name: 'Fire', colors: ['#f12711', '#f5af19'] },
            { name: 'Northern', colors: ['#43cea2', '#185a9d'] },
            { name: 'Peach', colors: ['#ffecd2', '#fcb69f'] },
        ];

        let stops = [
            { color: '#6366f1', position: 0 },
            { color: '#a855f7', position: 50 },
            { color: '#ec4899', position: 100 },
        ];

        const typeSelect = document.getElementById('grad-type');
        const angleInput = document.getElementById('grad-angle');
        const angleVal = document.getElementById('grad-angle-val');
        const stopsContainer = document.getElementById('grad-stops');
        const preview = document.getElementById('grad-preview');
        const cssOutput = document.getElementById('grad-css-output');
        const linearOpts = document.getElementById('grad-linear-opts');
        const radialOpts = document.getElementById('grad-radial-opts');
        const presetsContainer = document.getElementById('grad-presets');

        function renderStops() {
            stopsContainer.innerHTML = '';
            stops.forEach((stop, i) => {
                const row = document.createElement('div');
                row.className = 'grad-stop-row';
                row.innerHTML = `
          <input type="color" value="${stop.color}" data-idx="${i}" class="grad-stop-color" />
          <input type="range" min="0" max="100" value="${stop.position}" data-idx="${i}" class="grad-stop-pos grad-range" />
          <span class="grad-stop-pos-label">${stop.position}%</span>
          ${stops.length > 2 ? `<button class="btn-icon grad-stop-remove" data-idx="${i}">✕</button>` : ''}
        `;
                stopsContainer.appendChild(row);
            });

            // Attach events
            stopsContainer.querySelectorAll('.grad-stop-color').forEach(el => {
                el.addEventListener('input', (e) => {
                    stops[parseInt(e.target.dataset.idx)].color = e.target.value;
                    updateGradient();
                });
            });
            stopsContainer.querySelectorAll('.grad-stop-pos').forEach(el => {
                el.addEventListener('input', (e) => {
                    const idx = parseInt(e.target.dataset.idx);
                    stops[idx].position = parseInt(e.target.value);
                    e.target.nextElementSibling.textContent = e.target.value + '%';
                    updateGradient();
                });
            });
            stopsContainer.querySelectorAll('.grad-stop-remove').forEach(el => {
                el.addEventListener('click', (e) => {
                    stops.splice(parseInt(e.target.dataset.idx), 1);
                    renderStops();
                    updateGradient();
                });
            });
        }

        function getGradientCSS() {
            const type = typeSelect.value;
            const sortedStops = [...stops].sort((a, b) => a.position - b.position);
            const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

            if (type === 'linear') {
                const angle = angleInput.value;
                return `linear-gradient(${angle}deg, ${stopsStr})`;
            }
            if (type === 'radial') {
                const shape = document.getElementById('grad-shape').value;
                return `radial-gradient(${shape}, ${stopsStr})`;
            }
            if (type === 'conic') {
                const angle = angleInput.value;
                return `conic-gradient(from ${angle}deg, ${stopsStr})`;
            }
            return '';
        }

        function updateGradient() {
            const css = getGradientCSS();
            preview.style.background = css;
            cssOutput.textContent = `background: ${css};`;
        }

        // Gradient type change
        typeSelect.addEventListener('change', () => {
            const type = typeSelect.value;
            linearOpts.style.display = type === 'linear' || type === 'conic' ? '' : 'none';
            radialOpts.style.display = type === 'radial' ? '' : 'none';
            updateGradient();
        });

        // Angle input
        angleInput.addEventListener('input', () => {
            angleVal.textContent = angleInput.value;
            updateGradient();
        });

        // Direction grid
        document.getElementById('grad-direction-grid').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn || btn.dataset.angle === '') return;
            const angle = parseInt(btn.dataset.angle);
            angleInput.value = angle;
            angleVal.textContent = angle;
            document.querySelectorAll('.grad-direction-grid button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateGradient();
        });

        // Add stop
        document.getElementById('grad-add-stop').addEventListener('click', () => {
            const lastPos = stops[stops.length - 1].position;
            const newPos = Math.min(lastPos + 10, 100);
            stops.push({ color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), position: newPos });
            renderStops();
            updateGradient();
        });

        // Radial shape
        document.getElementById('grad-shape').addEventListener('change', updateGradient);

        // Copy CSS
        document.getElementById('grad-copy-css').addEventListener('click', () => {
            copyToClipboard(cssOutput.textContent);
        });

        // Presets
        presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'grad-preset-btn';
            btn.style.background = `linear-gradient(135deg, ${preset.colors.join(', ')})`;
            btn.title = preset.name;
            btn.addEventListener('click', () => {
                stops = preset.colors.map((color, i) => ({
                    color,
                    position: Math.round((i / (preset.colors.length - 1)) * 100),
                }));
                renderStops();
                updateGradient();
            });
            presetsContainer.appendChild(btn);
        });

        renderStops();
        updateGradient();
    }, 0);

    return page;
}
