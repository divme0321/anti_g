// ヘッダー・テーマ切替・ツール検索など、全ページ共通のUI挙動
export function initSiteUI() {
  // モバイルメニュー
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
      btn.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
  }

  // ドロップダウン（タップ端末対応）
  const ddBtn = document.querySelector('.nav-dropdown-btn');
  const dd = document.querySelector('.nav-dropdown');
  if (ddBtn && dd) {
    ddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle('open');
      ddBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => {
      dd.classList.remove('open');
      ddBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // テーマ切替（初期適用は index.html の head 内インラインスクリプトが担当）
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* プライベートブラウズ等では保存しない */
      }
    });
  }

  // ホームのツール検索（インクリメンタル絞り込み）
  const search = document.getElementById('tool-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      document.querySelectorAll('.tool-card').forEach((card) => {
        const hit = !q || (card.dataset.name || '').toLowerCase().includes(q);
        card.style.display = hit ? '' : 'none';
        if (hit) visible++;
      });
      document.querySelectorAll('.tool-category').forEach((sec) => {
        const any = [...sec.querySelectorAll('.tool-card')].some((c) => c.style.display !== 'none');
        sec.style.display = any ? '' : 'none';
      });
      const noResults = document.getElementById('no-results');
      if (noResults) noResults.hidden = visible > 0;
    });
  }
}
