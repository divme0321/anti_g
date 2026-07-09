// 共通ユーティリティ（トースト通知・クリップボードコピー）
export function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = type === 'success' ? `✓ ${message}` : `✗ ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('コピーしました');
  });
}

export function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
