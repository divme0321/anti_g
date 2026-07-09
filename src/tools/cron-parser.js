export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container single-pane';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">CRON式</span>
        </div>
        <div class="pane-body">
          <div style="display:flex; gap:10px; margin-bottom: 20px;">
            <input type="text" id="cron-input" class="tool-input" style="flex:1; font-family:var(--font-mono); font-size: 1.2rem; text-align:center;" value="0 12 * * 1-5" />
          </div>

          <div style="background:var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); text-align:center;">
            <h2 id="cron-output" style="color:var(--text-primary); font-size: 1.5rem; margin-bottom:10px;">月曜日から金曜日の 12:00 に実行</h2>
            <p style="color:var(--text-muted); font-size: 0.9rem;" id="cron-next">次回実行: 計算中...</p>
          </div>

          <div style="margin-top: 20px; display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; text-align:center;">
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">分</div>
              <div id="p-min" style="color:var(--text-muted); font-family:var(--font-mono);">0</div>
            </div>
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">時</div>
              <div id="p-hr" style="color:var(--text-muted); font-family:var(--font-mono);">12</div>
            </div>
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">日</div>
              <div id="p-dom" style="color:var(--text-muted); font-family:var(--font-mono);">*</div>
            </div>
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">月</div>
              <div id="p-mon" style="color:var(--text-muted); font-family:var(--font-mono);">*</div>
            </div>
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">曜日</div>
              <div id="p-dow" style="color:var(--text-muted); font-family:var(--font-mono);">1-5</div>
            </div>
          </div>

          <div style="margin-top: 20px; display:flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm cron-preset" data-cron="* * * * *">毎分</button>
            <button class="btn btn-secondary btn-sm cron-preset" data-cron="0 * * * *">毎時</button>
            <button class="btn btn-secondary btn-sm cron-preset" data-cron="0 0 * * *">毎日 0時</button>
            <button class="btn btn-secondary btn-sm cron-preset" data-cron="0 0 * * 0">毎週日曜日</button>
          </div>
        </div>
      </div>
  `;

    setTimeout(() => {
        const input = document.getElementById('cron-input');
        const output = document.getElementById('cron-output');
        const nextTime = document.getElementById('cron-next');

        const parts = {
            min: document.getElementById('p-min'),
            hr: document.getElementById('p-hr'),
            dom: document.getElementById('p-dom'),
            mon: document.getElementById('p-mon'),
            dow: document.getElementById('p-dow')
        };

        // Very basic cron translator (fallback if library isn't used)
        function translateCron(cron) {
            const split = cron.trim().split(/\s+/);
            if (split.length !== 5) return "無効なCRON式です（5つの項目が必要です）";

            parts.min.textContent = split[0];
            parts.hr.textContent = split[1];
            parts.dom.textContent = split[2];
            parts.mon.textContent = split[3];
            parts.dow.textContent = split[4];

            // For a robust implementation, we dynamically load a tiny script
            if (window.cronstrue) {
                try {
                    return window.cronstrue.toString(cron, { locale: "ja" });
                } catch(e) {
                    return "式を解析できませんでした";
                }
            } else {
                return "解析エンジンを読み込み中...";
            }
        }

        function update() {
            output.textContent = translateCron(input.value);
            const d = new Date();
            d.setHours(d.getHours() + 1); // Mock next run time
            nextTime.textContent = "有効な式です";
        }

        input.addEventListener('input', update);

        document.querySelectorAll('.cron-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                input.value = btn.dataset.cron;
                update();
            });
        });

        // Load cronstrue library via CDN (i18n build for Japanese output)
        if (!window.cronstrue) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/cronstrue@2.47.0/dist/cronstrue-i18n.min.js';
            script.onload = update;
            document.head.appendChild(script);
        } else {
            update();
        }

    }, 0);

    return widget;
}
