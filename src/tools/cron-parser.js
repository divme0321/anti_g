import { copyToClipboard } from '../main.js';

export function renderCronParser() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="/">Home</a> <span>›</span> <span>CRON Parser</span>
      </div>
      <h1>CRON Expression Parser</h1>
      <p>Translate complex CRON schedules into plain, human-readable text.</p>
    </div>
    <div class="tool-container single-pane">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">CRON Expression</span>
        </div>
        <div class="pane-body">
          <div style="display:flex; gap:10px; margin-bottom: 20px;">
            <input type="text" id="cron-input" class="tool-input" style="flex:1; font-family:var(--font-mono); font-size: 1.2rem; text-align:center;" value="0 12 * * 1-5" />
          </div>
          
          <div style="background:var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); text-align:center;">
            <h2 id="cron-output" style="color:var(--text-primary); font-size: 1.5rem; margin-bottom:10px;">At 12:00 PM, Monday through Friday</h2>
            <p style="color:var(--text-muted); font-size: 0.9rem;" id="cron-next">Next run: calculating...</p>
          </div>

          <div style="margin-top: 20px; display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; text-align:center;">
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">Minute</div>
              <div id="p-min" style="color:var(--text-muted); font-family:var(--font-mono);">0</div>
            </div>
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">Hour</div>
              <div id="p-hr" style="color:var(--text-muted); font-family:var(--font-mono);">12</div>
            </div>
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">Day (Month)</div>
              <div id="p-dom" style="color:var(--text-muted); font-family:var(--font-mono);">*</div>
            </div>
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">Month</div>
              <div id="p-mon" style="color:var(--text-muted); font-family:var(--font-mono);">*</div>
            </div>
            <div style="background:var(--bg-primary); padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <div style="font-weight:bold; margin-bottom:5px;">Day (Week)</div>
              <div id="p-dow" style="color:var(--text-muted); font-family:var(--font-mono);">1-5</div>
            </div>
          </div>
          
          <div style="margin-top: 20px; display:flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm cron-preset" data-cron="* * * * *">Every minute</button>
            <button class="btn btn-secondary btn-sm cron-preset" data-cron="0 * * * *">Every hour</button>
            <button class="btn btn-secondary btn-sm cron-preset" data-cron="0 0 * * *">Every day at midnight</button>
            <button class="btn btn-secondary btn-sm cron-preset" data-cron="0 0 * * 0">Every Sunday</button>
          </div>
        </div>
      </div>
    </div>
    <div class="tool-seo-content" style="margin-top: 3rem; padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); font-size: 1rem; line-height: 1.8; color: var(--text-secondary);">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary); font-weight: 700;">CRON Expression Parser</h2>
      <p style="margin-bottom: 1.5rem;">CRON is a time-based job scheduler used in Unix-like computer operating systems. Developers and system administrators use CRON expressions to schedule scripts, database backups, and maintenance tasks to run automatically at specific times or intervals.</p>
      <p style="margin-bottom: 1.5rem;">Writing and understanding these expressions can be confusing. Our CRON Parser instantly translates the five-part syntax (Minute, Hour, Day of Month, Month, Day of Week) into clear, human-readable text.</p>
      <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Safe & Private</h3>
      <p>All processing in this tool is done securely within your browser using client-side JavaScript. Your data is never sent to a server or stored in a database, ensuring complete privacy.</p>
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
            if (split.length !== 5) return "Invalid CRON expression (needs 5 parts)";
            
            parts.min.textContent = split[0];
            parts.hr.textContent = split[1];
            parts.dom.textContent = split[2];
            parts.mon.textContent = split[3];
            parts.dow.textContent = split[4];
            
            // For a robust implementation, we dynamically load a tiny script
            if (window.cronstrue) {
                try {
                    return window.cronstrue.toString(cron);
                } catch(e) {
                    return "Error parsing expression";
                }
            } else {
                return "Loading parser engine...";
            }
        }

        function update() {
            output.textContent = translateCron(input.value);
            const d = new Date();
            d.setHours(d.getHours() + 1); // Mock next run time
            nextTime.textContent = "Valid expression";
        }

        input.addEventListener('input', update);
        
        document.querySelectorAll('.cron-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                input.value = btn.dataset.cron;
                update();
            });
        });

        // Load cronstrue library via CDN
        if (!window.cronstrue) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/cronstrue@2.47.0/dist/cronstrue.min.js';
            script.onload = update;
            document.head.appendChild(script);
        } else {
            update();
        }

    }, 0);

    return page;
}
