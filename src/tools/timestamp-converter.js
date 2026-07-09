export function render() {
    const widget = document.createElement('div');
    widget.className = 'tool-container single-pane';
    widget.innerHTML = `
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">現在時刻</span>
        </div>
        <div class="pane-body">
          <div class="timestamp-current">
            <div class="timestamp-live" id="ts-live"></div>
            <div class="timestamp-live-label">現在のUnixタイムスタンプ（リアルタイム更新）</div>
          </div>

          <div class="timestamp-sections">
            <div class="timestamp-section">
              <h3>タイムスタンプ → 日時</h3>
              <div class="form-group">
                <label for="ts-input">Unixタイムスタンプ</label>
                <div style="display:flex;gap:8px">
                  <input type="text" id="ts-input" placeholder="例: 1708560000" style="flex:1" />
                  <button class="btn btn-primary" id="ts-to-date">変換 →</button>
                </div>
              </div>
              <div class="timestamp-result" id="ts-date-result"></div>
            </div>

            <div class="timestamp-section">
              <h3>日時 → タイムスタンプ</h3>
              <div class="form-group">
                <label>日付と時刻</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <input type="number" id="ts-year" placeholder="年" style="width:90px" />
                  <input type="number" id="ts-month" placeholder="月" min="1" max="12" style="width:80px" />
                  <input type="number" id="ts-day" placeholder="日" min="1" max="31" style="width:70px" />
                  <input type="number" id="ts-hour" placeholder="時" min="0" max="23" style="width:70px" />
                  <input type="number" id="ts-min" placeholder="分" min="0" max="59" style="width:70px" />
                  <input type="number" id="ts-sec" placeholder="秒" min="0" max="59" style="width:70px" />
                  <button class="btn btn-primary" id="ts-to-unix">変換 →</button>
                </div>
              </div>
              <div class="timestamp-result" id="ts-unix-result"></div>
            </div>
          </div>
        </div>
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
                resultDiv.innerHTML = '<span style="color:var(--color-error)">無効なタイムスタンプです</span>';
                return;
            }

            resultDiv.innerHTML = `
        <div class="ts-result-row"><strong>UTC:</strong> ${date.toUTCString()}</div>
        <div class="ts-result-row"><strong>ISO 8601:</strong> ${date.toISOString()}</div>
        <div class="ts-result-row"><strong>ローカル:</strong> ${date.toLocaleString()}</div>
        <div class="ts-result-row"><strong>相対時間:</strong> ${getRelativeTime(date)}</div>
        <button class="btn btn-secondary" style="margin-top:8px" onclick="navigator.clipboard.writeText('${date.toISOString()}')">ISOをコピー</button>
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
        <div class="ts-result-row"><strong>Unix（秒）:</strong> <span class="ts-value">${ts}</span></div>
        <div class="ts-result-row"><strong>Unix（ミリ秒）:</strong> <span class="ts-value">${ts * 1000}</span></div>
        <div class="ts-result-row"><strong>ISO 8601:</strong> ${date.toISOString()}</div>
        <button class="btn btn-secondary" style="margin-top:8px" onclick="navigator.clipboard.writeText('${ts}')">タイムスタンプをコピー</button>
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
            const suffix = future ? '後' : '前';

            if (abs < 60000) return Math.floor(abs / 1000) + ' 秒' + suffix;
            if (abs < 3600000) return Math.floor(abs / 60000) + ' 分' + suffix;
            if (abs < 86400000) return Math.floor(abs / 3600000) + ' 時間' + suffix;
            if (abs < 2592000000) return Math.floor(abs / 86400000) + ' 日' + suffix;
            if (abs < 31536000000) return Math.floor(abs / 2592000000) + ' ヶ月' + suffix;
            return Math.floor(abs / 31536000000) + ' 年' + suffix;
        }
    }, 0);

    return widget;
}
