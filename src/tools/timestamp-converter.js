import { copyToClipboard } from '../main.js';

export function renderTimestampConverter() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>›</span> <span>Timestamp Converter</span>
      </div>
      <h1>Unix Timestamp Converter</h1>
      <p>Convert between Unix timestamps and human-readable date/time formats. Essential for debugging APIs and working with date fields.</p>
    </div>
    <div class="tool-container single-pane">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Current Time</span>
        </div>
        <div class="pane-body">
          <div class="timestamp-current">
            <div class="timestamp-live" id="ts-live"></div>
            <div class="timestamp-live-label">Current Unix Timestamp (updates live)</div>
          </div>

          <div class="timestamp-sections">
            <div class="timestamp-section">
              <h3>Timestamp → Date</h3>
              <div class="form-group">
                <label for="ts-input">Unix Timestamp</label>
                <div style="display:flex;gap:8px">
                  <input type="text" id="ts-input" placeholder="e.g. 1708560000" style="flex:1" />
                  <button class="btn btn-primary" id="ts-to-date">Convert →</button>
                </div>
              </div>
              <div class="timestamp-result" id="ts-date-result"></div>
            </div>

            <div class="timestamp-section">
              <h3>Date → Timestamp</h3>
              <div class="form-group">
                <label>Date & Time</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <input type="number" id="ts-year" placeholder="Year" style="width:90px" />
                  <input type="number" id="ts-month" placeholder="Month" min="1" max="12" style="width:80px" />
                  <input type="number" id="ts-day" placeholder="Day" min="1" max="31" style="width:70px" />
                  <input type="number" id="ts-hour" placeholder="Hour" min="0" max="23" style="width:70px" />
                  <input type="number" id="ts-min" placeholder="Min" min="0" max="59" style="width:70px" />
                  <input type="number" id="ts-sec" placeholder="Sec" min="0" max="59" style="width:70px" />
                  <button class="btn btn-primary" id="ts-to-unix">Convert →</button>
                </div>
              </div>
              <div class="timestamp-result" id="ts-unix-result"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tool-info">
      <h2>What is a Unix Timestamp?</h2>
      <p>A Unix timestamp (also known as POSIX time or Epoch time) represents the number of seconds that have elapsed since January 1, 1970, at 00:00:00 UTC (the Unix Epoch). This format is widely used in programming because it's simple, timezone-independent, and easy to compare.</p>
      <h3>Common Use Cases</h3>
      <ul>
        <li><strong>API Responses:</strong> Many APIs return timestamps as Unix epoch values.</li>
        <li><strong>Database Storage:</strong> Storing dates as integers is efficient and timezone-agnostic.</li>
        <li><strong>Log Analysis:</strong> Server logs often use Unix timestamps for precise timing.</li>
        <li><strong>Scheduling:</strong> Cron jobs and scheduled tasks often use epoch-based timing.</li>
      </ul>
      <h3>Key Formats</h3>
      <ul>
        <li><strong>Seconds:</strong> Standard Unix timestamp (10 digits, e.g., 1708560000)</li>
        <li><strong>Milliseconds:</strong> JavaScript/Java style (13 digits, e.g., 1708560000000)</li>
        <li><strong>ISO 8601:</strong> Human-readable format (e.g., 2024-02-22T00:00:00Z)</li>
      </ul>
    </div>
  `;

    setTimeout(() => {
        // Live clock
        const liveEl = document.getElementById('ts-live');
        function updateLive() {
            if (liveEl) liveEl.textContent = Math.floor(Date.now() / 1000);
        }
        updateLive();
        const interval = setInterval(updateLive, 1000);

        // Clean up interval when navigating away
        const observer = new MutationObserver(() => {
            if (!document.getElementById('ts-live')) {
                clearInterval(interval);
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById('app'), { childList: true, subtree: true });

        // Timestamp to date
        document.getElementById('ts-to-date').addEventListener('click', () => {
            const val = document.getElementById('ts-input').value.trim();
            const resultDiv = document.getElementById('ts-date-result');
            if (!val) { resultDiv.innerHTML = ''; return; }

            let ts = parseInt(val);
            // Auto-detect ms vs seconds
            if (ts > 9999999999) ts = Math.floor(ts / 1000);
            const date = new Date(ts * 1000);

            if (isNaN(date.getTime())) {
                resultDiv.innerHTML = '<span style="color:var(--color-error)">Invalid timestamp</span>';
                return;
            }

            resultDiv.innerHTML = `
        <div class="ts-result-row"><strong>UTC:</strong> ${date.toUTCString()}</div>
        <div class="ts-result-row"><strong>ISO 8601:</strong> ${date.toISOString()}</div>
        <div class="ts-result-row"><strong>Local:</strong> ${date.toLocaleString()}</div>
        <div class="ts-result-row"><strong>Relative:</strong> ${getRelativeTime(date)}</div>
        <button class="btn btn-secondary" style="margin-top:8px" onclick="navigator.clipboard.writeText('${date.toISOString()}')">Copy ISO</button>
      `;
        });

        // Date to timestamp
        document.getElementById('ts-to-unix').addEventListener('click', () => {
            const y = parseInt(document.getElementById('ts-year').value) || 2024;
            const m = parseInt(document.getElementById('ts-month').value) || 1;
            const d = parseInt(document.getElementById('ts-day').value) || 1;
            const h = parseInt(document.getElementById('ts-hour').value) || 0;
            const min = parseInt(document.getElementById('ts-min').value) || 0;
            const sec = parseInt(document.getElementById('ts-sec').value) || 0;

            const date = new Date(Date.UTC(y, m - 1, d, h, min, sec));
            const ts = Math.floor(date.getTime() / 1000);
            const resultDiv = document.getElementById('ts-unix-result');

            resultDiv.innerHTML = `
        <div class="ts-result-row"><strong>Unix (seconds):</strong> <span class="ts-value">${ts}</span></div>
        <div class="ts-result-row"><strong>Unix (milliseconds):</strong> <span class="ts-value">${ts * 1000}</span></div>
        <div class="ts-result-row"><strong>ISO 8601:</strong> ${date.toISOString()}</div>
        <button class="btn btn-secondary" style="margin-top:8px" onclick="navigator.clipboard.writeText('${ts}')">Copy Timestamp</button>
      `;
        });

        // Set current time in the date fields
        const now = new Date();
        document.getElementById('ts-year').value = now.getUTCFullYear();
        document.getElementById('ts-month').value = now.getUTCMonth() + 1;
        document.getElementById('ts-day').value = now.getUTCDate();
        document.getElementById('ts-hour').value = now.getUTCHours();
        document.getElementById('ts-min').value = now.getUTCMinutes();
        document.getElementById('ts-sec').value = now.getUTCSeconds();

        function getRelativeTime(date) {
            const diff = Date.now() - date.getTime();
            const abs = Math.abs(diff);
            const future = diff < 0;
            const prefix = future ? 'in ' : '';
            const suffix = future ? '' : ' ago';

            if (abs < 60000) return prefix + Math.floor(abs / 1000) + ' seconds' + suffix;
            if (abs < 3600000) return prefix + Math.floor(abs / 60000) + ' minutes' + suffix;
            if (abs < 86400000) return prefix + Math.floor(abs / 3600000) + ' hours' + suffix;
            if (abs < 2592000000) return prefix + Math.floor(abs / 86400000) + ' days' + suffix;
            if (abs < 31536000000) return prefix + Math.floor(abs / 2592000000) + ' months' + suffix;
            return prefix + Math.floor(abs / 31536000000) + ' years' + suffix;
        }
    }, 0);

    return page;
}
