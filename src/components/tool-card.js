export function createToolCard({ id, icon, title, description }) {
    const card = document.createElement('a');
    card.className = 'tool-card';
    card.href = `/${id}`;
  card.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', `/${id}`);
    window.dispatchEvent(new Event('popstate'));
  });
    card.innerHTML = `
    <div class="tool-card-icon">${icon}</div>
    <h3>${title}</h3>
    <p>${description}</p>
    <span class="tool-card-arrow">→</span>
  `;
    return card;
}
