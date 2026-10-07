// ページを離れた後の読込結果と、同じ領域への重複マウントを破棄する。
const mounts = new WeakMap();

export async function mountTool(rootEl, loader) {
  if (!loader) return;
  const token = {};
  mounts.set(rootEl, token);
  const slug = rootEl.dataset.tool;
  const path = window.location.pathname;
  const current = () => rootEl.isConnected && rootEl.dataset.tool === slug
    && window.location.pathname === path && mounts.get(rootEl) === token;

  try {
    const mod = await loader();
    if (!current()) return;
    // ツールはrender時にdocumentから入力要素を取得するため、先に領域を空にする。
    rootEl.replaceChildren();
    const widget = mod.render();
    if (current()) rootEl.appendChild(widget);
  } catch {
    if (!current()) return;
    const panel = document.createElement('div');
    panel.className = 'tool-loading tool-load-error';
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = 'ツールを読み込めませんでした。通信状況を確認して、ページを再読み込みしてください。再読み込みすると入力内容はリセットされます。';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn btn-primary';
    retry.textContent = 'ページを再読み込み';
    retry.addEventListener('click', () => {
      if (!current() || retry.disabled) return;
      retry.disabled = true;
      // importの失敗がキャッシュされていても、新しいページで読み込み直せる。
      window.location.reload();
    });
    panel.append(message, retry);
    rootEl.replaceChildren(panel);
  }
}
