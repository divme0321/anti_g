import { copyToClipboard } from '../utils.js';

// IPv4アドレス文字列（"192.168.1.0"）を符号なし32bit整数に変換する
function ipToInt(ip) {
  const parts = ip.split('.');
  let result = 0;
  for (const part of parts) {
    result = ((result << 8) | Number(part)) >>> 0;
  }
  return result >>> 0;
}

// 符号なし32bit整数をIPv4アドレス文字列に変換する
function intToIp(int) {
  return [24, 16, 8, 0].map((shift) => (int >>> shift) & 0xff).join('.');
}

// "192.168.1.0/24" 形式の文字列をパースし、IP整数とプレフィックス長を返す
// 不正な場合は { error: 'メッセージ' } を返す
function parseCidr(value) {
  const trimmed = value.trim();
  if (!trimmed) return { error: '' };

  const match = trimmed.match(/^(\S+)\/(\S+)$/);
  if (!match) {
    return { error: 'CIDR表記で入力してください（例: 192.168.1.0/24）' };
  }
  const [, ipStr, prefixStr] = match;

  const ipMatch = ipStr.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipMatch) {
    return { error: 'IPv4アドレスの形式が正しくありません（例: 192.168.1.0）' };
  }
  const octets = ipMatch.slice(1, 5).map(Number);
  if (octets.some((o) => o < 0 || o > 255)) {
    return { error: 'IPv4アドレスの各オクテットは0〜255の範囲で入力してください' };
  }

  if (!/^\d{1,2}$/.test(prefixStr)) {
    return { error: 'プレフィックス長（/の後ろの数値）が正しくありません' };
  }
  const prefix = Number(prefixStr);
  if (prefix < 0 || prefix > 32) {
    return { error: 'プレフィックス長は0〜32の範囲で入力してください' };
  }

  return { ip: octets.join('.'), ipInt: ipToInt(octets.join('.')), prefix };
}

// CIDR情報からサブネットの各種情報を計算する
function calculateSubnet(ipInt, prefix) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = Math.pow(2, 32 - prefix);

  let firstHost;
  let lastHost;
  let usableHosts;
  let hostNote = '';

  if (prefix === 32) {
    // ホストルート: このアドレス1つのみ
    firstHost = network;
    lastHost = network;
    usableHosts = 1;
    hostNote = '/32はホスト1台を表す特殊なCIDRです。ネットワーク・ブロードキャストの区別はありません。';
  } else if (prefix === 31) {
    // RFC 3021: ポイントツーポイントリンク用、2アドレスとも使用可能
    firstHost = network;
    lastHost = broadcast;
    usableHosts = 2;
    hostNote = '/31はポイントツーポイントリンク向けの特殊なCIDRです（RFC 3021）。2つのアドレスはどちらもホストとして使用できます。';
  } else {
    firstHost = network + 1;
    lastHost = broadcast - 1;
    usableHosts = totalAddresses - 2;
  }

  return {
    mask,
    wildcard,
    network,
    broadcast,
    totalAddresses,
    firstHost,
    lastHost,
    usableHosts,
    hostNote,
  };
}

const PRESETS = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/16', '203.0.113.0/28', '8.8.8.8/32'];

export function render() {
  const widget = document.createElement('div');
  widget.className = 'tool-container single-pane';
  widget.innerHTML = `
    <div class="tool-pane">
      <div class="pane-header">
        <span class="pane-title">CIDR表記を入力</span>
        <div class="pane-actions">
          <button class="btn btn-secondary" id="cidr-clear">クリア</button>
        </div>
      </div>
      <div class="pane-body">
        <div class="form-group" style="display:flex; flex-direction:column; gap: var(--space-xs); margin-bottom: var(--space-md);">
          <label for="cidr-input" style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color: var(--color-text-dim);">CIDR表記（IPv4）</label>
          <input type="text" id="cidr-input" placeholder="例: 192.168.1.0/24" autocomplete="off" spellcheck="false" />
        </div>

        <div class="grad-presets" style="margin-bottom: var(--space-lg);">
          ${PRESETS.map((p) => `<button class="btn btn-secondary" data-preset="${p}">${p}</button>`).join('')}
        </div>

        <div id="cidr-error" class="regex-error" style="display:none;"></div>

        <div class="hash-results" id="cidr-results" style="display:none;">
          <div class="hash-result-item">
            <label>ネットワークアドレス</label>
            <div class="hash-value" id="cidr-network">—</div>
            <button class="btn-icon" data-target="cidr-network" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>ブロードキャストアドレス</label>
            <div class="hash-value" id="cidr-broadcast">—</div>
            <button class="btn-icon" data-target="cidr-broadcast" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>サブネットマスク</label>
            <div class="hash-value" id="cidr-mask">—</div>
            <button class="btn-icon" data-target="cidr-mask" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>ワイルドカードマスク</label>
            <div class="hash-value" id="cidr-wildcard">—</div>
            <button class="btn-icon" data-target="cidr-wildcard" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>使用可能なホストの範囲</label>
            <div class="hash-value" id="cidr-range">—</div>
            <button class="btn-icon" data-target="cidr-range" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>使用可能なホスト数</label>
            <div class="hash-value" id="cidr-usable">—</div>
            <button class="btn-icon" data-target="cidr-usable" title="コピー">📋</button>
          </div>
          <div class="hash-result-item">
            <label>総アドレス数</label>
            <div class="hash-value" id="cidr-total">—</div>
            <button class="btn-icon" data-target="cidr-total" title="コピー">📋</button>
          </div>
        </div>

        <div id="cidr-note" style="display:none; margin-top: var(--space-md); font-size: 0.8rem; color: var(--color-text-dim);"></div>

        <div class="tool-actions" id="cidr-actions" style="display:none; padding-left:0; padding-right:0; border-top: none;">
          <button class="btn btn-primary" id="cidr-copy-all">📋 すべてコピー</button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById('cidr-input');
    const errorBox = document.getElementById('cidr-error');
    const results = document.getElementById('cidr-results');
    const noteBox = document.getElementById('cidr-note');
    const actions = document.getElementById('cidr-actions');

    const fields = {
      network: document.getElementById('cidr-network'),
      broadcast: document.getElementById('cidr-broadcast'),
      mask: document.getElementById('cidr-mask'),
      wildcard: document.getElementById('cidr-wildcard'),
      range: document.getElementById('cidr-range'),
      usable: document.getElementById('cidr-usable'),
      total: document.getElementById('cidr-total'),
    };

    function showError(message) {
      results.style.display = 'none';
      actions.style.display = 'none';
      noteBox.style.display = 'none';
      if (message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
      } else {
        errorBox.style.display = 'none';
      }
    }

    function update() {
      const parsed = parseCidr(input.value);
      if (parsed.error !== undefined) {
        showError(parsed.error);
        return;
      }

      const { ipInt, prefix } = parsed;
      const subnet = calculateSubnet(ipInt, prefix);

      fields.network.textContent = intToIp(subnet.network);
      fields.broadcast.textContent = intToIp(subnet.broadcast);
      fields.mask.textContent = intToIp(subnet.mask);
      fields.wildcard.textContent = intToIp(subnet.wildcard);
      fields.range.textContent =
        subnet.firstHost === subnet.lastHost
          ? intToIp(subnet.firstHost)
          : `${intToIp(subnet.firstHost)} 〜 ${intToIp(subnet.lastHost)}`;
      fields.usable.textContent = subnet.usableHosts.toLocaleString('ja-JP');
      fields.total.textContent = subnet.totalAddresses.toLocaleString('ja-JP');

      errorBox.style.display = 'none';
      results.style.display = 'flex';
      actions.style.display = 'flex';

      if (subnet.hostNote) {
        noteBox.textContent = `※ ${subnet.hostNote}`;
        noteBox.style.display = 'block';
      } else {
        noteBox.style.display = 'none';
      }
    }

    input.addEventListener('input', update);

    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.preset;
        update();
      });
    });

    document.getElementById('cidr-clear').addEventListener('click', () => {
      input.value = '';
      showError('');
      input.focus();
    });

    document.querySelectorAll('#cidr-results .btn-icon').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target && target.textContent !== '—') {
          copyToClipboard(target.textContent);
        }
      });
    });

    document.getElementById('cidr-copy-all').addEventListener('click', () => {
      const text = [
        `CIDR: ${input.value.trim()}`,
        `ネットワークアドレス: ${fields.network.textContent}`,
        `ブロードキャストアドレス: ${fields.broadcast.textContent}`,
        `サブネットマスク: ${fields.mask.textContent}`,
        `ワイルドカードマスク: ${fields.wildcard.textContent}`,
        `使用可能なホストの範囲: ${fields.range.textContent}`,
        `使用可能なホスト数: ${fields.usable.textContent}`,
        `総アドレス数: ${fields.total.textContent}`,
      ].join('\n');
      copyToClipboard(text);
    });

    // 初期表示用のサンプル
    input.value = '192.168.1.0/24';
    update();
  }, 0);

  return widget;
}
